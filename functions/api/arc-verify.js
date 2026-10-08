// Cloudflare Pages version of the Arc Tracker licence check (the Vercel version is api/arc-verify.js).
// Both use the same checking code; only the way the host hands over the request differs.
// Settings on the Pages project: GUMROAD_PRODUCT_ID and ARC_TESTER_KEYS.
import { verifyLicense } from '../../api/arc-verify.js';

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch {}
  const out = await verifyLicense(body.key, env.GUMROAD_PRODUCT_ID || '', env.ARC_TESTER_KEYS || '');
  return json(out.status, out.body);
}

export const onRequest = () => json(405, { ok: false, reason: 'method_not_allowed' });
