// Cloudflare Worker entry. Cloudflare builds the site from GitHub (node build.mjs) and serves dist/
// as plain files; this script only runs for /api/*, where it answers the Arc Tracker licence check.
// Settings on the Worker: GUMROAD_PRODUCT_ID and ARC_TESTER_KEYS (both stored as secrets).
import { verifyLicense } from './api/arc-verify.js';

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/arc-verify') {
      if (request.method !== 'POST') return json(405, { ok: false, reason: 'method_not_allowed' });
      let body = {};
      try { body = await request.json(); } catch {}
      const out = await verifyLicense(body.key, env.GUMROAD_PRODUCT_ID || '', env.ARC_TESTER_KEYS || '');
      return json(out.status, out.body);
    }
    return env.ASSETS.fetch(request);
  },
};
