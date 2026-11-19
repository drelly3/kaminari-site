// Preview deploys for the joinkaminari.com redesign: `node scripts/preview-worker.mjs`
// Builds the site, then publishes it to a SEPARATE Worker, kaminari-redesign-preview, at
// https://kaminari-redesign-preview.joinkaminari.workers.dev, so changes can be checked on a phone before
// they go live. It has no routes, custom domains, storage or crons, never touches joinkaminari.com or the
// live kaminari-site Worker, and every page is marked noindex. Pages are embedded in the Worker; images
// and other files load from the live site. /api calls don't work in the preview.
// Needs wrangler and a Cloudflare token with Workers edit access (the cloud session's connection has one).
import { execSync } from 'node:child_process';
import os from 'node:os';
const ACCOUNT = 'd7e2c700607ab5092aa4a77f4a7967eb';
const NAME = 'kaminari-redesign-preview';
import fs from 'node:fs'; import path from 'node:path';
const dist = "dist", dir = fs.mkdtempSync(path.join(os.tmpdir(), "kpreview-")), out = path.join(dir, "worker.js");
execSync("node build.mjs", { stdio: "inherit" });
const TEXT = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain; charset=utf-8', svg: 'image/svg+xml' };
const files = {};
const walk = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (f !== 'media') walk(p); continue; }
  const ext = f.split('.').pop(); if (!TEXT[ext] || f.startsWith('_')) continue;
  let key = '/' + path.relative(dist, p).split(path.sep).join('/');
  if (ext === 'html') key = key.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  files[key] = [TEXT[ext], fs.readFileSync(p, 'utf8')]; } };
walk(dist);
files['/robots.txt'] = [TEXT.txt, 'User-agent: *\nDisallow: /\n'];
const src = `// kaminari-redesign-preview: a preview of the redesign only. Never routed to joinkaminari.com.
const FILES = ${JSON.stringify(files)};
const LIVE = 'https://www.joinkaminari.com';
const H = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' };
export default { async fetch(req) {
  const url = new URL(req.url); let p = decodeURIComponent(url.pathname);
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (p === '/arc-tracker') return Response.redirect(url.origin + '/arc-tracker/app', 302);
  if (p.startsWith('/go/')) return Response.redirect(LIVE + p + url.search, 302);
  if (p.startsWith('/api/')) return new Response('{"ok":false,"reason":"preview"}', { status: 404, headers: { ...H, 'Content-Type': 'application/json' } });
  const f = FILES[p] || FILES[p === '/' ? '/' : p + '/'];
  if (f) return new Response(f[1], { headers: { ...H, 'Content-Type': f[0] } });
  // images and other files: load them from the live site
  if (/\\.[a-z0-9]{2,5}$/i.test(p)) return new Response(null, { status: 302, headers: { Location: LIVE + p, 'Cache-Control': 'public, max-age=3600' } });
  const nf = FILES['/404']; return new Response(nf ? nf[1] : 'Not found', { status: 404, headers: { ...H, 'Content-Type': TEXT_HTML } });
} };
const TEXT_HTML = 'text/html; charset=utf-8';
`;
fs.writeFileSync(out, src); console.log(Object.keys(files).length, 'files embedded,', Math.round(src.length / 1024), 'KB');
fs.writeFileSync(path.join(dir, 'wrangler.jsonc'), JSON.stringify({ name: NAME, main: 'worker.js', compatibility_date: '2026-10-01', workers_dev: true, preview_urls: false }));
execSync('npx --yes wrangler@4 deploy', { cwd: dir, stdio: 'inherit', env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT, CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || 'set-by-proxy' } });
console.log(`\nPreview: https://${NAME}.joinkaminari.workers.dev`);
