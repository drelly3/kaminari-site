// Cloudflare Worker entry. Cloudflare builds the site from GitHub (node build.mjs) and serves dist/
// as plain files; this script only runs for /api/* and for the notification timer.
// Settings on the Worker: GUMROAD_PRODUCT_ID, ARC_TESTER_KEYS and VAPID_PRIVATE_JWK (secrets),
// plus the ARC_PUSH storage (notification devices and Arc Tracker backups) and VAPID_PUBLIC_KEY in wrangler.jsonc.
import { verifyLicense } from './api/arc-verify.js';
import { handlePush, sendDue } from './api/arc-push.js';
import { handleSync } from './api/arc-sync.js';

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
    if (pathname.startsWith('/api/arc-push/')) return handlePush(request, env, pathname);
    if (pathname === '/api/arc-sync') return handleSync(request, env);
    return env.ASSETS.fetch(request);
  },

  // every 5 minutes: send the daily reminders that have come due
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDue(env));
  },
};
