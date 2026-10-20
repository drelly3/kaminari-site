// Discord waitlist: while the Discord is closed (site.config.mjs, discordOpen: false), the site's
// Discord buttons open a short form that posts here. Each email is kept once, in the ARC_PUSH
// storage under "waitlist:discord:<email>", so a list can be pulled when the Discord opens.
const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

export async function handleWaitlist(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, reason: 'method_not_allowed' });
  let body = {};
  try { body = await request.json(); } catch {}
  // a hidden field people never see; anything typed in it came from a bot
  if (body.website) return json(200, { ok: true });
  const email = String(body.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(400, { ok: false, reason: 'bad_email' });
  const name = String(body.name || '').trim().slice(0, 80);
  const page = String(body.page || '').slice(0, 120);
  if (!env.ARC_PUSH) return json(503, { ok: false, reason: 'not_configured' });
  const key = 'waitlist:discord:' + email;
  const existing = await env.ARC_PUSH.get(key);
  if (!existing) await env.ARC_PUSH.put(key, JSON.stringify({ email, name, page, joined: new Date().toISOString() }));
  return json(200, { ok: true, already: !!existing });
}
