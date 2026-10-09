// Arc Tracker proof photo backup (runs on the Cloudflare Worker).
//
// Proof photos are stored in R2 (the ARC_PHOTOS bucket) under a hash of the member's licence key, so
// signing in on a new phone brings the arc gallery back. Each proof has a "full" image and a small
// "thumb" for the gallery. Videos are backed up as their still frame, which is what the phone keeps
// after 30 days anyway, so a year of clips doesn't fill the bucket.
//
// The phone sends its licence key in the X-Arc-Key header.
//   GET    /api/arc-photos                      -> { ok, photos: [{ id, t, kind, parts }] }
//   PUT    /api/arc-photos/<date>_<slot>/<part>  body: the JPEG; headers X-Arc-T (when it was added), X-Arc-Kind
//   GET    /api/arc-photos/<date>_<slot>/<part>  -> the JPEG
//   DELETE /api/arc-photos/<date>_<slot>         -> removes both parts
import { hashKey, licenceOk } from './arc-sync.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const MAX_PHOTO = 6 * 1024 * 1024;
const ID = /^(\d{4}-\d{2}-\d{2})_(h1|h2|h3)$/;
const PARTS = ['full', 'thumb'];

// every photo a member has, grouped by proof
async function listPhotos(env, base) {
  const byId = new Map();
  let cursor;
  do {
    const page = await env.ARC_PHOTOS.list({ prefix: base, cursor, include: ['customMetadata'] });
    for (const obj of page.objects) {
      const [id, part] = obj.key.slice(base.length).split('/');
      const m = obj.customMetadata || {};
      const p = byId.get(id) || { id, t: 0, kind: 'image', parts: [] };
      p.parts.push(part);
      p.t = Math.max(p.t, Number(m.t) || 0);
      if (m.kind) p.kind = m.kind;
      byId.set(id, p);
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return [...byId.values()];
}

// a reset clears the photos along with the rest of the backup
export async function wipePhotos(env, key) {
  if (!env.ARC_PHOTOS) return;
  const base = (await hashKey(key)) + '/';
  for (const p of await listPhotos(env, base)) await env.ARC_PHOTOS.delete(p.parts.map(part => `${base}${p.id}/${part}`));
}

export async function handlePhotos(request, env, pathname) {
  if (!env.ARC_PHOTOS || !env.ARC_PUSH) return json(503, { ok: false, reason: 'not_configured' });
  const key = String(request.headers.get('X-Arc-Key') || '').trim();
  if (!key || key.length > 80) return json(400, { ok: false, reason: 'missing_key' });
  if (!(await licenceOk(key, env))) return json(403, { ok: false, reason: 'no_access' });
  const base = (await hashKey(key)) + '/';
  const [id, part, extra] = pathname.replace(/^\/api\/arc-photos\/?/, '').split('/').filter(Boolean);

  if (!id) {
    if (request.method !== 'GET') return json(405, { ok: false, reason: 'method_not_allowed' });
    return json(200, { ok: true, photos: await listPhotos(env, base) });
  }
  if (!ID.test(id) || extra) return json(404, { ok: false, reason: 'unknown_photo' });

  if (request.method === 'DELETE' && !part) {
    await env.ARC_PHOTOS.delete(PARTS.map(p => `${base}${id}/${p}`));
    return json(200, { ok: true });
  }
  if (!PARTS.includes(part)) return json(404, { ok: false, reason: 'unknown_part' });
  const name = `${base}${id}/${part}`;

  if (request.method === 'PUT') {
    const body = await request.arrayBuffer();
    if (!body.byteLength) return json(400, { ok: false, reason: 'empty' });
    if (body.byteLength > MAX_PHOTO) return json(413, { ok: false, reason: 'too_large' });
    const kind = request.headers.get('X-Arc-Kind') === 'video' ? 'video' : 'image';
    const t = String(Number(request.headers.get('X-Arc-T')) || 0);
    await env.ARC_PHOTOS.put(name, body, { httpMetadata: { contentType: 'image/jpeg' }, customMetadata: { t, kind } });
    return json(200, { ok: true });
  }
  if (request.method === 'GET') {
    const obj = await env.ARC_PHOTOS.get(name);
    if (!obj) return json(404, { ok: false, reason: 'not_found' });
    return new Response(obj.body, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, no-store' } });
  }
  return json(405, { ok: false, reason: 'method_not_allowed' });
}
