// Arc Tracker cloud backup (runs on the Cloudflare Worker).
//
// A member's arc (character, habits, daily log, weekly reviews, Second Winds, challenges) is stored under their
// licence key, so entering the key on a new phone brings everything back. Proof photos are backed up
// separately, in R2 (see api/arc-photos.js).
//
// Each device sends its whole arc; the server merges it with what's stored and sends the result back.
// Merging works record by record (one log entry per day, one review, one Second Wind) and the newest
// edit of a record wins, so two phones logging different days never overwrite each other. A reset
// stamps resetAt and every record older than that is dropped, on every device.
//
// Stored in the ARC_PUSH KV namespace under "arc:" (the arc) and "lic:" (a recent licence check).
import { verifyLicense } from './arc-verify.js';
import { wipePhotos } from './arc-photos.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const MAX_BODY = 2 * 1024 * 1024;
const LICENCE_CACHE_SECONDS = 6 * 60 * 60;

export async function hashKey(key) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key.trim().toUpperCase()));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 48);
}

// the newer of two copies of one record; on a tie the stored copy (a) stays
const newer = (a, b) => !a ? b : !b ? a : ((b.t || 0) > (a.t || 0) ? b : a);
const byId = (list, id) => new Map((Array.isArray(list) ? list : []).filter(r => r && typeof r === 'object').map(r => [id(r), r]));
const weeklyId = w => w.id || `${w.date}|${String(w.went || '').slice(0, 40)}`;

export function mergeArc(stored = {}, incoming = {}) {
  const resetAt = Math.max(stored.resetAt || 0, incoming.resetAt || 0);
  const keep = r => r && (r.t || 0) >= resetAt;
  const mergeList = (key, id) => {
    const a = byId(stored[key], id), b = byId(incoming[key], id);
    return [...new Set([...a.keys(), ...b.keys()])].map(k => newer(a.get(k), b.get(k))).filter(keep);
  };
  // a never-edited blank (a fresh phone's empty character) must never beat a real one
  const real = (key, r) => r && ((r.t || 0) > 0 || (key === 'profile'
    ? !!(r.name || r.archetypeKey)
    : ['h1', 'h2', 'h3', 'sc'].some(h => r[h] && (r[h].cue || r[h].habit)))) ? r : undefined;
  const one = key => { const r = newer(real(key, stored[key]), real(key, incoming[key])); return keep(r) ? r : undefined; };
  return {
    v: 1,
    resetAt,
    profile: one('profile'),
    habits: one('habits'),
    log: mergeList('log', e => e.date).sort((x, y) => x.date.localeCompare(y.date)),
    weekly: mergeList('weekly', weeklyId).sort((x, y) => String(x.date).localeCompare(String(y.date))),
    secondWinds: mergeList('secondWinds', s => s.missed).sort((x, y) => String(x.on).localeCompare(String(y.on))),
    // removed proof photos, so another phone deletes its copy instead of backing it up again
    proofGone: mergeList('proofGone', g => g.id),
    // character challenges taken on, one per week
    challenges: mergeList('challenges', c => c.id),
  };
}

// a licence check costs a call to Gumroad, so a good result is remembered for a few hours
export async function licenceOk(key, env) {
  const id = 'lic:' + await hashKey(key);
  if (await env.ARC_PUSH.get(id)) return true;
  const out = await verifyLicense(key, env.GUMROAD_PRODUCT_ID || '', env.ARC_TESTER_KEYS || '');
  if (!out.body.ok) return false;
  await env.ARC_PUSH.put(id, '1', { expirationTtl: LICENCE_CACHE_SECONDS });
  return true;
}

// POST /api/arc-sync  { key, state, reset }  ->  { ok, state }
export async function handleSync(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method_not_allowed' });
  if (!env.ARC_PUSH) return json(503, { ok: false, reason: 'not_configured' });
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, reason: 'too_large' });
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { ok: false, reason: 'bad_request' }); }
  const key = String(body.key || '').trim();
  if (!key || key.length > 80) return json(400, { ok: false, reason: 'missing_key' });
  if (!(await licenceOk(key, env))) return json(403, { ok: false, reason: 'no_access' });

  const id = 'arc:' + await hashKey(key);
  const before = await env.ARC_PUSH.get(id);
  const stored = before ? JSON.parse(before) : {};
  const incoming = body.state && typeof body.state === 'object' ? body.state : {};
  if (body.reset) { incoming.resetAt = Date.now(); await wipePhotos(env, key); }
  const merged = mergeArc(stored, incoming);
  const after = JSON.stringify(merged);
  // KV writes are the limited resource, so nothing is written when nothing changed
  if (after !== before) await env.ARC_PUSH.put(id, after);
  return json(200, { ok: true, state: merged });
}
