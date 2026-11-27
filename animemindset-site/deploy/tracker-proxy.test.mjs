// Unit tests for tracker-proxy.mjs. A fake TRACKER binding serves a built kaminari-site dist/ (the production tracker
// files) and records every request it receives. No network, no Cloudflare, no member data.
//   node animemindset-site/deploy/tracker-proxy.test.mjs <path to a built kaminari-site dist/>
import fs from 'node:fs';
import path from 'node:path';
import { handleTracker, applyRewrites, REWRITES, ORIGINAL_APP, LIVE_HOST, _resetVerification } from './tracker-proxy.mjs';

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
const req = (p, init = {}, origin = 'https://animemindset.com') => new Request(origin + p, init);
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
const rootRefs = (html.match(/(?:href|src)="\/[^"]*"/g) || []).filter(x => !x.includes('"/arc-tracker/k/'));
ok(rootRefs.sort().join(' ') === 'href="/" href="/assets/apple-touch-icon.png" href="/assets/favicon-32.png" src="/assets/anime-mindset-logo.png" src="/assets/anime-mindset-logo.png"', 'app page: root paths are namespaced tracker files or this site\'s own icons/home', rootRefs.join(' '));
ok(html.includes('<a href="/">← Back to The Anime Mindset</a>') && !html.includes('anime-mindset"') && !html.includes('Back to Kaminari'), 'app page: back link goes to this site\'s homepage');
ok(!html.includes('joinkaminari') && !html.includes('rss.xml') && !html.includes('google-site-verification'), 'app page: no joinkaminari metadata, RSS feed or verification tag');
ok(html.includes('<title>Arc Tracker | The Anime Mindset</title>') && html.includes('<link rel="canonical" href="https://animemindset.com/arc-tracker/app">') && html.includes('content="https://animemindset.com/assets/og-image.png"') && html.includes('<meta property="og:site_name" content="The Anime Mindset">') && html.includes('<meta name="robots" content="noindex">'), 'app page: title, canonical, og image/site name for this site; still noindex');
ok(!/Skip the key|sample key|Preview only/i.test(html) && html.includes('<div id="arc-preview-note" hidden><button type="button" id="arc-preview-open" hidden></button></div>'), 'app page: preview/sample-key note not served');
ok(!r.headers.get('set-cookie') && !r.headers.get('etag') && r.headers.get('x-robots-tag') === 'noindex, nofollow', 'app page headers sanitised');
for (const m of ['POST', 'PUT', 'DELETE']) ok((await call('/arc-tracker/app', { method: m })).status === 405, 'app page rejects ' + m);

const gate = await (await call('/arc-tracker/k/arc-gate.js')).text();
ok(gate.includes('const isLive = true;') && !/joinkaminari\\\.com\$\/\.test/.test(gate), 'gate: sample key disabled (isLive forced true)');
ok(gate.includes("const SAMPLE_KEY = '';") && (gate.match(/SAMPLE_KEY = '[^']+'/) === null), 'gate: sample key value not served');
ok(gate.includes("s.src = '/arc-tracker/k/arc-tracker.js'"), 'gate loads namespaced tracker script');
const app = await (await call('/arc-tracker/k/arc-tracker.js')).text();
ok(app.includes("register('/arc-tracker/arc-sw.js',{scope:'/arc-tracker/'})"), 'tracker registers namespaced service worker with /arc-tracker/ scope');
ok(app.includes("'/arc-tracker/k/assets/avatars/'") && app.includes('href="/quiz.html"') && !app.includes('href="/quiz"'), 'tracker avatars namespaced; quiz link opens this site\'s quiz.html');
ok(!/['"`(]\/(?:assets|arc-sw|styles|favicon)/.test(app.split('"/assets/anime-mindset-logo.png"').join('')), 'tracker script: no remaining root asset paths (except this site\'s logo)');
ok(app.split('src="/assets/anime-mindset-logo.png"').length - 1 === 2 && !app.includes('kaminari-bolt'), 'tracker script: bolt replaced by this site\'s logo (2)');
ok(html.split('src="/assets/anime-mindset-logo.png"').length - 1 === 2 && !html.includes('kaminari-bolt'), 'app page: bolt replaced by this site\'s logo (2)');
ok(!/joinkaminari\.com/.test(app.replace('arc-tracker-daily-reminder@joinkaminari.com', '')), 'tracker script: no joinkaminari.com links (calendar event ID only)');
ok(app.includes("fetch('/api/arc-sync'") && app.includes("fetch('/api/arc-photos'"), 'tracker script: API paths unchanged');
const sw = await call('/arc-tracker/arc-sw.js'); const swText = await sw.text();
ok(sw.status === 200 && /javascript/.test(sw.headers.get('content-type')) && swText.includes("'/arc-tracker/k/assets/arc-icon-192.png'") && !swText.includes("'/assets/"), 'service worker served in scope, icons namespaced');
ok(!/addEventListener\('fetch'/.test(swText) && !/caches\./.test(swText), 'service worker has no fetch handler / Cache API use');
const man = JSON.parse(await (await call('/arc-tracker/k/arc-tracker.webmanifest')).text());
ok(man.scope === '/arc-tracker/' && man.start_url === '/arc-tracker/app' && man.icons.every(i => i.src.startsWith('/arc-tracker/k/')), 'manifest scope/start_url unchanged, icons namespaced');
for (const f of ['styles.css', 'arc-tracker.css', 'assets/arc-icon-192.png', 'assets/arc-icon-512.png', 'assets/avatars/balanced-master.png', 'assets/avatars/strategist.png']) {
  const x = await call('/arc-tracker/k/' + f); ok(x.status === 200 && (await x.arrayBuffer()).byteLength > 0, 'namespaced file 200: ' + f);
  const cc = x.headers.get('cache-control'); ok(/\.(png|jpg)$/.test(f) ? cc === 'public, max-age=86400' : cc === 'public, max-age=60', 'cache-control for ' + f, cc);
}
for (const f of ['assets/kaminari-bolt.png', 'favicon.jpg', 'apple-touch-icon.jpg', 'worker.js', 'index.html', 'arc-tracker/app.html', 'assets/avatars/../../worker.js', 'assets/avatars/Strategist.png', 'assets/og-image.jpg', '../api/arc-sync', 'api/arc-sync', 'rss.xml', '']) {
  seen.length = 0; const x = await call('/arc-tracker/k/' + f); ok(x.status === 404 && seen.length === 0, 'namespaced non-allowlisted 404 without upstream: ' + f, x.status);
}
ok((await call('/arc-tracker/other')).status === 404, 'unknown tracker path 404');

// 4. fail closed: a production change that breaks a rewrite sends /arc-tracker/app to the original app
for (const file of ['arc-gate.js', 'arc-tracker.js', 'arc-sw.js', 'arc-tracker.webmanifest', 'arc-tracker/app.html']) {
  _resetVerification();
  const first = REWRITES[file === 'arc-tracker/app.html' ? '/arc-tracker/app' : file][0].find;
  const env = makeEnv((f, t) => f === file ? t.replace(first, 'CHANGED') : t);
  const x = await handleTracker(req('/arc-tracker/app'), env);
  ok(x.status === 302 && x.headers.get('location') === ORIGINAL_APP, 'falls back to original app when rewrite breaks in ' + file, x.status);
}
// every individual rewrite (string or pattern) failing on its own sends the page to the original app
let each = 0, eachOk = 0;
for (const [name, list] of Object.entries(REWRITES)) for (const r of list) {
  const file = name === '/arc-tracker/app' ? 'arc-tracker/app.html' : name; each++;
  _resetVerification();
  const env = makeEnv((f, t) => f === file ? (typeof r.find === 'string' ? t.split(r.find).join('') : t.replace(r.find, '')) : t);
  const x = await handleTracker(req('/arc-tracker/app'), env);
  if (x.status === 302 && x.headers.get('location') === ORIGINAL_APP) eachOk++; else console.log('     not fail-closed:', name, String(r.find).slice(0, 60));
}
ok(each === eachOk, `each of ${each} rewrites, when production changes, sends the page to the original app`);
// hosts: one sign-in address
for (const origin of ['https://www.animemindset.com', 'https://animemindset-preview.joinkaminari.workers.dev', 'http://127.0.0.1:8799', 'https://evil.example']) {
  for (const p of ['/arc-tracker', '/arc-tracker/', '/arc-tracker/app']) {
    const x = await handleTracker(req(p, {}, origin), makeEnv());
    ok(x.status === 302 && x.headers.get('location') === new URL(origin).protocol + '//animemindset.com/arc-tracker/app', `${origin}${p} -> apex tracker`, x.headers.get('location'));
  }
  for (const [m, p] of [['GET', '/arc-tracker/k/arc-gate.js'], ['GET', '/arc-tracker/arc-sw.js'], ['POST', '/api/arc-verify'], ['POST', '/api/arc-sync'], ['GET', '/api/arc-photos'], ['GET', '/api/arc-push/key'], ['POST', '/arc-tracker/app']]) {
    seen.length = 0; const x = await handleTracker(req(p, { method: m, body: m === 'POST' ? '{}' : undefined, duplex: 'half' }, origin), makeEnv());
    ok(x.status === 404 && seen.length === 0, `${origin} ${m} ${p} -> 404, never forwarded`, x.status);
  }
  ok((await handleTracker(req('/', {}, origin), makeEnv())) === null, `${origin}/ marketing untouched`);
}
ok(LIVE_HOST === 'animemindset.com', 'live host is the apex');
// no binding configured -> original app; API -> 503
_resetVerification();
ok((await handleTracker(req('/arc-tracker/app'), {})).headers.get('location') === ORIGINAL_APP, 'no binding: app redirects to original');
ok((await handleTracker(req('/api/arc-sync', { method: 'POST', body: '{}' }), {})).status === 503, 'no binding: API 503');
// rewrite counting is strict
let threw = false; try { applyRewrites('arc-sw.js', "'/assets/arc-icon-192.png'"); } catch { threw = true; } ok(threw, 'rewrite count mismatch throws');

console.log(`unit: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
