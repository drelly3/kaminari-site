// Unit tests for tracker-proxy.mjs. A fake TRACKER binding serves a built kaminari-site dist/ (the production tracker
// files) and records every request it receives. No network, no Cloudflare, no member data.
//   node animemindset-site/deploy/tracker-proxy.test.mjs <path to a built kaminari-site dist/>
import fs from 'node:fs';
import path from 'node:path';
import { handleTracker, applyRewrites, REWRITES, ORIGINAL_APP, _resetVerification } from './tracker-proxy.mjs';

const DIST = process.argv[2]; if (!DIST) { console.error('usage: node tracker-proxy.test.mjs <kaminari-site dist dir>'); process.exit(2); }
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) pass++; else { fail++; console.log('FAIL', name, extra); } };

// fake upstream: static files from DIST (with /arc-tracker/app -> app.html), API calls echoed back
const seen = [];
function makeEnv(mutate = (f, t) => t) {
  return { TRACKER: { async fetch(req) {
    const u = new URL(req.url);
    seen.push({ method: req.method, path: u.pathname, search: u.search, headers: Object.fromEntries(req.headers), cookie: req.headers.get('cookie') });
    if (u.pathname.startsWith('/api/')) return new Response(JSON.stringify({ upstream: true, path: u.pathname, method: req.method, key: !!req.headers.get('x-arc-key') }), { headers: { 'content-type': 'application/json', 'set-cookie': 'x=1' } });
    const file = u.pathname === '/arc-tracker/app' ? 'arc-tracker/app.html' : u.pathname.slice(1);
    const p = path.join(DIST, file);
    if (!p.startsWith(DIST) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return new Response('nf', { status: 404 });
    const buf = fs.readFileSync(p);
    const body = /\.(html|js|css|webmanifest)$/.test(file) ? mutate(file, buf.toString('utf8')) : buf;
    return new Response(body, { headers: { 'content-type': 'application/octet-stream', 'cache-control': 'public, max-age=60', 'set-cookie': 'leak=1', etag: 'W/"x"' } });
  } } };
}
const req = (p, init = {}) => new Request('https://animemindset.com' + p, init);
const call = async (p, init, env = makeEnv()) => handleTracker(req(p, init), env);

// 1. non-tracker paths are untouched (handled by the site itself)
for (const p of ['/', '/index.html', '/quiz', '/quiz.html', '/styles.css', '/assets/styles.css', '/assets/avatars/strategist.png', '/assets/avatars/balanced-master.png', '/about.html', '/api/waitlist', '/go/x', '/arc-trackerx', '/apix'])
  ok((await call(p)) === null, 'site path not intercepted: ' + p);

// 2. API allowlist: exact paths and methods; everything else stops here without reaching upstream
const apiAllowed = [
  ['POST', '/api/arc-verify'], ['POST', '/api/arc-sync'], ['GET', '/api/arc-photos'],
  ['GET', '/api/arc-photos/2026-11-19_h1/full'], ['PUT', '/api/arc-photos/2026-11-19_h2/thumb'], ['PUT', '/api/arc-photos/2026-11-19_xab12/full'],
  ['DELETE', '/api/arc-photos/2026-11-19_h3'], ['GET', '/api/arc-push/key'],
  ...['subscribe', 'unsubscribe', 'cleared', 'test', 'next'].map(a => ['POST', '/api/arc-push/' + a]),
];
for (const [m, p] of apiAllowed) {
  seen.length = 0;
  const r = await call(p, { method: m, headers: { 'x-arc-key': 'k', cookie: 'c=1', 'x-evil': '1' }, body: ['GET', 'HEAD'].includes(m) ? undefined : 'x' });
  const j = await r.json();
  ok(r.status === 200 && j.upstream && j.path === p && j.method === m, `api forwarded ${m} ${p}`);
  ok(seen.length === 1 && seen[0].cookie === null && !seen[0].headers['x-evil'] && seen[0].headers['x-arc-key'] === 'k', `api headers filtered ${m} ${p}`);
  ok(!r.headers.get('set-cookie'), `no set-cookie relayed ${m} ${p}`);
}
const apiWrongMethod = [['GET', '/api/arc-verify'], ['GET', '/api/arc-sync'], ['DELETE', '/api/arc-photos'], ['POST', '/api/arc-photos/2026-11-19_h1/full'],
  ['DELETE', '/api/arc-photos/2026-11-19_h1/full'], ['GET', '/api/arc-photos/2026-11-19_h1'], ['POST', '/api/arc-push/key'], ['GET', '/api/arc-push/subscribe']];
for (const [m, p] of apiWrongMethod) { seen.length = 0; const r = await call(p, { method: m }); ok(r.status === 405 && seen.length === 0, `405 without upstream ${m} ${p}`, r.status); }
const apiUnknown = ['/api/arc-quotes', '/api/arc-reminders', '/api/arc-sync/x', '/api/arc-photos/2026-11-19_h4/full', '/api/arc-photos/2026-11-19_h1/full/x',
  '/api/arc-photos/2026-11-19_h1/raw', '/api/arc-push/', '/api/arc-push/send', '/api/arc-push/next/x', '/api/arc-verify/', '/api/arc-', '/api/arc-sync%2F'];
for (const p of apiUnknown) { seen.length = 0; const r = await call(p, { method: 'POST' }); ok(r.status === 404 && seen.length === 0, `404 without upstream ${p}`, r.status); }
// dot segments are resolved by the URL parser first, so this is just /api/arc-sync, not an escape
seen.length = 0; { const r = await call('/api/arc-photos/../arc-sync', { method: 'POST', body: '{}', duplex: 'half' }); ok(r.status === 200 && seen[0].path === '/api/arc-sync', 'dot segments normalised before allowlist'); }
// query strings are not passed on
seen.length = 0; await call('/api/arc-push/key?x=1', { method: 'GET' }); ok(seen[0] && seen[0].search === '', 'query string dropped');

// 3. tracker page and files
let r = await call('/arc-tracker'); ok(r.status === 302 && r.headers.get('location') === 'https://animemindset.com/arc-tracker/app', 'redirect /arc-tracker');
r = await call('/arc-tracker/'); ok(r.status === 302, 'redirect /arc-tracker/');
_resetVerification();
r = await call('/arc-tracker/app'); const html = await r.text();
ok(r.status === 200 && /text\/html/.test(r.headers.get('content-type')), 'app page 200 html');
ok(!/(?:href|src)="\/(?!arc-tracker\/k\/)/.test(html), 'app page: every root-relative href/src is namespaced', (html.match(/(?:href|src)="\/(?!arc-tracker\/k\/)[^"]*"/g) || []).join(' '));
ok(html.includes('href="https://www.joinkaminari.com/anime-mindset"') && html.includes('href="https://www.joinkaminari.com/rss.xml"'), 'app page: outbound links keep original destinations');
ok(!r.headers.get('set-cookie') && !r.headers.get('etag') && r.headers.get('x-robots-tag') === 'noindex, nofollow', 'app page headers sanitised');
for (const m of ['POST', 'PUT', 'DELETE']) ok((await call('/arc-tracker/app', { method: m })).status === 405, 'app page rejects ' + m);

const gate = await (await call('/arc-tracker/k/arc-gate.js')).text();
ok(gate.includes('const isLive = true;') && !/joinkaminari\\\.com\$\/\.test/.test(gate), 'gate: sample key disabled (isLive forced true)');
ok(gate.includes("s.src = '/arc-tracker/k/arc-tracker.js'"), 'gate loads namespaced tracker script');
const app = await (await call('/arc-tracker/k/arc-tracker.js')).text();
ok(app.includes("register('/arc-tracker/arc-sw.js',{scope:'/arc-tracker/'})"), 'tracker registers namespaced service worker with /arc-tracker/ scope');
ok(app.includes("'/arc-tracker/k/assets/avatars/'") && app.includes('href="https://www.joinkaminari.com/quiz"'), 'tracker avatars namespaced; quiz link keeps original quiz');
ok(!/['"`(]\/(?:assets|arc-sw|styles|favicon|quiz)/.test(app), 'tracker script: no remaining root asset paths');
ok(app.includes("fetch('/api/arc-sync'") && app.includes("fetch('/api/arc-photos'"), 'tracker script: API paths unchanged');
const sw = await call('/arc-tracker/arc-sw.js'); const swText = await sw.text();
ok(sw.status === 200 && /javascript/.test(sw.headers.get('content-type')) && swText.includes("'/arc-tracker/k/assets/arc-icon-192.png'") && !swText.includes("'/assets/"), 'service worker served in scope, icons namespaced');
ok(!/addEventListener\('fetch'/.test(swText) && !/caches\./.test(swText), 'service worker has no fetch handler / Cache API use');
const man = JSON.parse(await (await call('/arc-tracker/k/arc-tracker.webmanifest')).text());
ok(man.scope === '/arc-tracker/' && man.start_url === '/arc-tracker/app' && man.icons.every(i => i.src.startsWith('/arc-tracker/k/')), 'manifest scope/start_url unchanged, icons namespaced');
for (const f of ['styles.css', 'arc-tracker.css', 'favicon.jpg', 'apple-touch-icon.jpg', 'assets/kaminari-bolt.png', 'assets/arc-icon-192.png', 'assets/arc-icon-512.png', 'assets/avatars/balanced-master.png', 'assets/avatars/strategist.png']) {
  const x = await call('/arc-tracker/k/' + f); ok(x.status === 200 && (await x.arrayBuffer()).byteLength > 0, 'namespaced file 200: ' + f);
  const cc = x.headers.get('cache-control'); ok(/\.(png|jpg)$/.test(f) ? cc === 'public, max-age=86400' : cc === 'public, max-age=60', 'cache-control for ' + f, cc);
}
for (const f of ['worker.js', 'index.html', 'arc-tracker/app.html', 'assets/avatars/../../worker.js', 'assets/avatars/Strategist.png', 'assets/og-image.jpg', '../api/arc-sync', 'api/arc-sync', 'rss.xml', '']) {
  seen.length = 0; const x = await call('/arc-tracker/k/' + f); ok(x.status === 404 && seen.length === 0, 'namespaced non-allowlisted 404 without upstream: ' + f, x.status);
}
ok((await call('/arc-tracker/other')).status === 404, 'unknown tracker path 404');

// 4. fail closed: a production change that breaks a rewrite sends /arc-tracker/app to the original app
for (const file of ['arc-gate.js', 'arc-tracker.js', 'arc-sw.js', 'arc-tracker.webmanifest', 'arc-tracker/app.html']) {
  _resetVerification();
  const env = makeEnv((f, t) => f === file ? t.replace(REWRITES[file === 'arc-tracker/app.html' ? '/arc-tracker/app' : file][0].find, 'CHANGED') : t);
  const x = await handleTracker(req('/arc-tracker/app'), env);
  ok(x.status === 302 && x.headers.get('location') === ORIGINAL_APP, 'falls back to original app when rewrite breaks in ' + file, x.status);
}
// no binding configured -> original app; API -> 503
_resetVerification();
ok((await handleTracker(req('/arc-tracker/app'), {})).headers.get('location') === ORIGINAL_APP, 'no binding: app redirects to original');
ok((await handleTracker(req('/api/arc-sync', { method: 'POST', body: '{}' }), {})).status === 503, 'no binding: API 503');
// rewrite counting is strict
let threw = false; try { applyRewrites('arc-sw.js', "'/assets/arc-icon-192.png'"); } catch { threw = true; } ok(threw, 'rewrite count mismatch throws');

console.log(`unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
