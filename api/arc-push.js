// Arc Tracker push notifications (runs on the Cloudflare Worker).
//
// How it fits together:
//  - A member turns notifications on in the tracker's Setup tab. Their browser hands us a "subscription"
//    (an address at Google/Apple/Mozilla that delivers to that one device), which we store in KV.
//  - Every 5 minutes Cloudflare runs sendDue(). Anyone whose reminder time has passed in their own
//    time zone, and who hasn't cleared today, gets one reminder.
//  - Members can also set their own reminders ("Drink water" at 14:00 on weekdays). Each device keeps
//    a compact copy in its KV metadata (r: [[minutes, day bitmask]], rs: which ones went out today),
//    so the 5-minute timer can check them without reading every device's full entry.
//  - Pushes carry no content. The device's service worker wakes up, asks /api/arc-push/next what to
//    show, and displays it. That keeps the sending code small and the wording editable in one place.
//
// Settings on the Worker: ARC_PUSH (KV), VAPID_PUBLIC_KEY, VAPID_PRIVATE_JWK (secret), VAPID_SUBJECT.
import { verifyLicense } from './arc-verify.js';
import { quoteFor, dropFor } from './arc-quotes.js';
import { reminderFor } from './arc-reminders.js';

const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const text = s => new TextEncoder().encode(s);
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// one KV entry per device, named by a hash of its subscription address
async function idFor(endpoint) {
  return 'sub:' + b64url(await crypto.subtle.digest('SHA-256', text(endpoint))).slice(0, 40);
}

// the member's local date and minutes-past-midnight, in their own time zone
export function localNow(tz, now = new Date()) {
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  } catch { return localNow('UTC', now); }
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: +p.hour * 60 + +p.minute };
}

// should this device get its daily reminder right now?
export function reminderDue(meta, now = new Date()) {
  const { date, minutes } = localNow(meta.tz, now);
  return minutes >= meta.m && meta.sent !== date && meta.cleared !== date;
}

// what, if anything, this device is owed right now, at the member's reminder time. Mondays and
// Thursdays: the quote. Sundays: the Weekly Arc Review. Other days: a reminder, unless today is cleared.
export function dueKind(meta, now = new Date()) {
  const { date, minutes } = localNow(meta.tz, now);
  if (minutes < meta.m || meta.sent === date) return '';
  const day = dropFor(date);
  if (day.isDropDay) return 'quote';
  if (day.isSunday) return 'report'; // the Weekly Arc Review
  return meta.cleared !== date ? 'reminder' : '';
}

/* ---------- the member's own reminders ---------- */
export const MAX_REMINDERS = 12;
// cleaned list from the app: [{id, label, note, time 'HH:MM', days [0-6, 0 = Sunday]}]
export function cleanReminders(list) {
  return (Array.isArray(list) ? list : []).slice(0, MAX_REMINDERS).map(r => {
    const [h, m] = String(r && r.time || '').split(':').map(Number);
    const days = Array.isArray(r && r.days) ? r.days.map(Number).filter(d => d >= 0 && d <= 6) : [];
    return {
      id: String(r.id || '').slice(0, 24),
      label: String(r.label || '').trim().slice(0, 60),
      note: String(r.note || '').trim().slice(0, 120),
      m: Math.min(1439, Math.max(0, (h || 0) * 60 + (m || 0))),
      mask: days.reduce((a, d) => a | (1 << d), 0) || 127,
    };
  }).filter(r => r.id && r.label);
}
const weekday = date => new Date(date + 'T12:00:00Z').getUTCDay();
// which of the member's own reminders are due right now (indices into meta.r), and today's date
export function dueReminders(meta, now = new Date()) {
  if (!Array.isArray(meta.r) || !meta.r.length) return { today: '', due: [] };
  const { date, minutes } = localNow(meta.tz, now);
  const sent = meta.rs && meta.rs.d === date ? meta.rs.s : [];
  const dow = weekday(date);
  const due = meta.r.map(([m, mask], i) => (minutes >= m && (mask & (1 << dow)) && !sent.includes(i)) ? i : -1).filter(i => i >= 0);
  return { today: date, due };
}

/* ---------- sending ---------- */
async function vapidHeader(endpoint, env) {
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVATE_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = b64url(text(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64url(text(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || 'mailto:contact@joinkaminari.com' })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, text(`${head}.${claims}`));
  return `vapid t=${head}.${claims}.${b64url(sig)}, k=${env.VAPID_PUBLIC_KEY}`;
}

// returns 'sent', 'gone' (the device unsubscribed, so forget it) or 'failed'
export async function sendPush(endpoint, env) {
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { Authorization: await vapidHeader(endpoint, env), TTL: '14400', Urgency: 'normal', 'Content-Length': '0' } });
    if (res.status === 404 || res.status === 410) return 'gone';
    return res.ok ? 'sent' : 'failed';
  } catch { return 'failed'; }
}

// run by the 5-minute timer
export async function sendDue(env, now = new Date()) {
  let cursor, sent = 0, checked = 0;
  do {
    const page = await env.ARC_PUSH.list({ prefix: 'sub:', cursor });
    for (const { name, metadata: meta } of page.keys) {
      checked++;
      if (!meta) continue;
      let kind = dueKind(meta, now);
      const own = dueReminders(meta, now);
      if (!kind && !own.due.length) continue;
      const sub = await env.ARC_PUSH.get(name, 'json');
      if (!sub) continue;
      const today = localNow(meta.tz, now).date;
      // no archetype picked yet means no quote to send; fall back to the plain reminder
      if (kind === 'quote' && !quoteFor(sub.archetype, today)) kind = meta.cleared !== today ? 'reminder' : '';
      // the member's own reminders wait in a queue the device reads one at a time (see 'next');
      // they're written before sending so the device finds them when the push wakes it
      const mine = own.due.map(i => (sub.reminders || [])[i]).filter(Boolean);
      sub.queue = (Array.isArray(sub.queue) ? sub.queue : []).concat(mine.map(r => ({ title: r.label, body: r.note || 'Your reminder from Arc Tracker.', tag: 'arc-r-' + r.id, url: '/arc-tracker/app' })));
      if (kind) sub.next = kind;
      if (!kind && !mine.length) continue;
      await env.ARC_PUSH.put(name, JSON.stringify(sub), { metadata: meta });
      const newMeta = { ...meta };
      let gone = false, failedOwn = 0;
      if (kind) {
        const result = await sendPush(sub.endpoint, env);
        if (result === 'gone') gone = true;
        else if (result === 'sent') { newMeta.sent = today; sent++; }
      }
      const done = [];
      for (const i of own.due) {
        if (gone) break;
        const result = await sendPush(sub.endpoint, env);
        if (result === 'gone') { gone = true; break; }
        if (result === 'sent') { done.push(i); sent++; } else failedOwn++;
      }
      if (gone) { await env.ARC_PUSH.delete(name); continue; }
      if (done.length) newMeta.rs = { d: today, s: (meta.rs && meta.rs.d === today ? meta.rs.s : []).concat(done) };
      // a reminder whose push failed comes off the queue and goes out again on the next run
      if (failedOwn) sub.queue = sub.queue.slice(0, sub.queue.length - failedOwn);
      await env.ARC_PUSH.put(name, JSON.stringify(sub), { metadata: newMeta });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return { checked, sent };
}

/* ---------- what a notification says ---------- */
const MESSAGES = {
  reminder: { title: 'Log today’s arc', body: 'Three habits. Clear today before it’s gone.' },
  // the quote itself stays hidden until they open the tracker, where it is revealed
  quote: { title: 'Your new arc quote just dropped', body: 'Tap to reveal it.', url: '/arc-tracker/app#quote' },
  report: { title: 'Your Weekly Arc Review is ready', body: 'See your week in numbers, then set up the next one.', url: '/arc-tracker/app#review' },
  test: { title: 'Arc Tracker notifications are on', body: 'This is how they will arrive. Tap to see your current quote.', url: '/arc-tracker/app#quote' },
};

/* ---------- the /api/arc-push/* addresses ---------- */
export async function handlePush(request, env, pathname) {
  const action = pathname.replace('/api/arc-push/', '');
  if (action === 'key' && request.method === 'GET') return json(200, { publicKey: env.VAPID_PUBLIC_KEY || '' });
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method_not_allowed' });
  if (!env.ARC_PUSH || !env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_JWK) return json(503, { ok: false, reason: 'not_configured' });

  let body = {};
  try { body = await request.json(); } catch {}
  const endpoint = String(body.endpoint || (body.subscription && body.subscription.endpoint) || '');
  if (!/^https:\/\/[^\s]{10,1000}$/.test(endpoint)) return json(400, { ok: false, reason: 'bad_subscription' });
  const id = await idFor(endpoint);

  if (action === 'subscribe') {
    // only members can register a device
    const licence = await verifyLicense(body.key, env.GUMROAD_PRODUCT_ID || '', env.ARC_TESTER_KEYS || '');
    if (!licence.body.ok) return json(403, { ok: false, reason: 'no_access' });
    const [h, m] = String(body.time || '08:00').split(':').map(Number);
    const tz = String(body.tz || 'UTC').slice(0, 64);
    const minutes = Math.min(1439, Math.max(0, (h || 0) * 60 + (m || 0)));
    const today = localNow(tz);
    const meta = {
      tz, m: minutes,
      cleared: body.clearedToday ? today.date : '',
      // turning it on after today's reminder time shouldn't fire one straight away
      sent: today.minutes >= minutes ? today.date : '',
    };
    const archetype = String(body.archetype || '').slice(0, 40);
    // the member's own reminders; ones already past today don't fire the moment they're saved
    const reminders = cleanReminders(body.reminders);
    if (reminders.length) {
      meta.r = reminders.map(r => [r.m, r.mask]);
      meta.rs = { d: today.date, s: reminders.map((r, i) => r.m <= today.minutes ? i : -1).filter(i => i >= 0) };
    }
    const old = await env.ARC_PUSH.get(id, 'json');
    await env.ARC_PUSH.put(id, JSON.stringify({ endpoint, next: (old && old.next) || '', queue: (old && old.queue) || [], archetype, reminders }), { metadata: meta });
    return json(200, { ok: true });
  }

  const { value: sub, metadata: meta } = await env.ARC_PUSH.getWithMetadata(id, 'json');
  if (!sub) return json(404, { ok: false, reason: 'not_subscribed' });

  if (action === 'unsubscribe') { await env.ARC_PUSH.delete(id); return json(200, { ok: true }); }

  if (action === 'cleared') { // the member cleared (or un-cleared) today
    const today = localNow(meta.tz).date;
    const cleared = body.cleared ? today : '';
    if (meta.cleared !== cleared) await env.ARC_PUSH.put(id, JSON.stringify(sub), { metadata: { ...meta, cleared } });
    return json(200, { ok: true });
  }

  if (action === 'test') {
    sub.next = 'test';
    await env.ARC_PUSH.put(id, JSON.stringify(sub), { metadata: meta });
    const result = await sendPush(endpoint, env);
    if (result === 'gone') await env.ARC_PUSH.delete(id);
    return json(result === 'sent' ? 200 : 502, { ok: result === 'sent', reason: result === 'sent' ? undefined : result });
  }

  if (action === 'next') { // asked by the device when a push arrives: what should I show?
    // the member's own reminders first, one per push
    if (Array.isArray(sub.queue) && sub.queue.length) {
      const message = sub.queue.shift();
      await env.ARC_PUSH.put(id, JSON.stringify(sub), { metadata: meta });
      return json(200, { ok: true, ...message });
    }
    // the daily reminder says something different each day (see arc-reminders.js)
    const message = MESSAGES[sub.next] && sub.next !== 'reminder' ? MESSAGES[sub.next] : reminderFor(sub.archetype, localNow(meta.tz).date);
    return json(200, { ok: true, url: '/arc-tracker/app', ...message });
  }

  return json(404, { ok: false, reason: 'unknown_action' });
}
