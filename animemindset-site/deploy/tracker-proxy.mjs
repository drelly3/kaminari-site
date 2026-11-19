// Arc Tracker on animemindset.com: an allowlisted pass-through to the existing tracker Worker.
//
// The tracker app, its records (KV + R2), its secrets and its reminder cron stay on the production Worker
// ("kaminari-site"). This module only forwards an exact list of tracker paths to it through the TRACKER service
// binding, so both addresses read and write the same records. Nothing here reads or writes member data itself.
//
// Served only on https://animemindset.com (one sign-in address: browser storage is per address).
//   www.animemindset.com and any other host (e.g. workers.dev): the tracker page redirects to the apex address;
//   tracker files and the API answer 404 there and are never forwarded.
//
// Paths on animemindset.com (nothing outside /arc-tracker and /api/arc-* is touched, so the marketing pages,
// /assets/styles.css, the site's own avatars and /quiz.html are never shadowed):
//   /arc-tracker, /arc-tracker/            -> redirect to /arc-tracker/app
//   /arc-tracker/app                       -> the tracker page (GET/HEAD)
//   /arc-tracker/arc-sw.js                 -> the tracker's service worker (inside its /arc-tracker/ scope)
//   /arc-tracker/k/<file>                  -> the tracker's own CSS, JS, icons and avatars, namespaced (GET/HEAD)
//   /api/arc-verify, /api/arc-sync, /api/arc-photos..., /api/arc-push/...  -> exact paths and methods below
//
// The tracker's HTML/JS/manifest use root paths and joinkaminari.com metadata. They are rewritten with exact,
// counted replacements. If production's files change so that any replacement no longer matches exactly, the
// tracker page is not served half-rewritten: /arc-tracker/app redirects to the original app on joinkaminari.com.
// Without the TRACKER binding the same redirect happens and the API answers 503.

export const ORIGINAL_APP = 'https://www.joinkaminari.com/arc-tracker/app';
export const LIVE_HOST = 'animemindset.com';
const SITE = 'https://' + LIVE_HOST;
const UPSTREAM = 'https://www.joinkaminari.com';      // URL host for the service-binding request (routing is by path)
const NS = '/arc-tracker/k/';

// /arc-tracker/k/<file> -> upstream /<file>
const STATIC = new Map([
  ['styles.css', 'text/css'],
  ['arc-tracker.css', 'text/css'],
  ['arc-gate.js', 'text/javascript'],
  ['arc-tracker.js', 'text/javascript'],
  ['arc-tracker.webmanifest', 'application/manifest+json'],
  ['assets/kaminari-bolt.png', 'image/png'],
  ['assets/arc-icon-192.png', 'image/png'],
  ['assets/arc-icon-512.png', 'image/png'],
]);
const AVATAR = /^assets\/avatars\/[a-z][a-z-]{0,40}\.png$/;
const IMAGE_CACHE = 'public, max-age=86400';

// Exact API surface of the production tracker (api/arc-*.js), by method.
const PHOTO_ID = '\\d{4}-\\d{2}-\\d{2}_(?:h1|h2|h3|x[a-z0-9]{1,16})';
const API = [
  { re: /^\/api\/arc-verify$/, methods: ['POST'] },
  { re: /^\/api\/arc-sync$/, methods: ['POST'] },
  { re: /^\/api\/arc-photos$/, methods: ['GET'] },
  { re: new RegExp(`^/api/arc-photos/${PHOTO_ID}/(?:full|thumb)$`), methods: ['GET', 'PUT'] },
  { re: new RegExp(`^/api/arc-photos/${PHOTO_ID}$`), methods: ['DELETE'] },
  { re: /^\/api\/arc-push\/key$/, methods: ['GET'] },
  { re: /^\/api\/arc-push\/(?:subscribe|unsubscribe|cleared|test|next)$/, methods: ['POST'] },
];
// request headers the tracker actually uses; everything else (cookies included) is dropped
const PASS_HEADERS = ['content-type', 'accept', 'x-arc-key', 'x-arc-t', 'x-arc-kind'];

// Exact rewrites per upstream file: [find (string, or a global RegExp), replace, expected count]. A mismatch fails closed.
const R = (find, replace, count) => ({ find, replace, count });
export const REWRITES = {
  '/arc-tracker/app': [
    // truthful metadata for this address (the page stays noindex)
    R('<title>Arc Tracker | Kaminari</title>', '<title>Arc Tracker | The Anime Mindset</title>', 1),
    R('content="Arc Tracker | Kaminari"', 'content="Arc Tracker | The Anime Mindset"', 2),
    R('<link rel="canonical" href="https://www.joinkaminari.com/arc-tracker/app">', `<link rel="canonical" href="${SITE}/arc-tracker/app">`, 1),
    R('content="https://www.joinkaminari.com/arc-tracker/app"', `content="${SITE}/arc-tracker/app"`, 1),
    R('content="https://www.joinkaminari.com/assets/og-image.jpg"', `content="${SITE}/assets/og-image.png"`, 2),
    R('<meta property="og:site_name" content="Kaminari">', '<meta property="og:site_name" content="The Anime Mindset">', 1),
    R(/<meta name="google-site-verification" content="[^"]*">\n?/g, '', 1),                // joinkaminari.com's ownership tag
    R('<link rel="alternate" type="application/rss+xml" title="Kaminari Blog" href="/rss.xml">\n', '', 1), // this site has no blog feed
    // this site's own icons
    R('<link rel="icon" href="/favicon.jpg" type="image/jpeg">', '<link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32">', 1),
    R('<link rel="apple-touch-icon" href="/apple-touch-icon.jpg">', '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">', 1),
    // the tracker's own files, namespaced
    R('href="/styles.css"', `href="${NS}styles.css"`, 1),
    R('href="/arc-tracker.css"', `href="${NS}arc-tracker.css"`, 1),
    R('href="/arc-tracker.webmanifest"', `href="${NS}arc-tracker.webmanifest"`, 1),
    R('src="/assets/kaminari-bolt.png"', `src="${NS}assets/kaminari-bolt.png"`, 2),
    R('src="/arc-gate.js"', `src="${NS}arc-gate.js"`, 1),
    // the gate's way out goes to this site's homepage
    R('<a href="/anime-mindset">← Back to Kaminari</a>', '<a href="/">← Back to The Anime Mindset</a>', 1),
    // the preview-only "skip the key" note never appears here (kept as empty hidden elements the gate script expects)
    R(/<div id="arc-preview-note" hidden>[\s\S]*?<\/div>/g, '<div id="arc-preview-note" hidden><button type="button" id="arc-preview-open" hidden></button></div>', 1),
  ],
  'arc-gate.js': [
    R("s.src = '/arc-tracker.js'", `s.src = '${NS}arc-tracker.js'`, 1),
    // the built-in sample key never opens the tracker here, on any host, and is not served here at all
    R('const isLive = /(^|\\.)joinkaminari\\.com$/.test(location.hostname);', 'const isLive = true;', 1),
    R(/const SAMPLE_KEY = '[^']*';/g, "const SAMPLE_KEY = '';", 1),
  ],
  'arc-tracker.js': [
    R("'/assets/avatars/'", `'${NS}assets/avatars/'`, 1),
    R('src="/assets/kaminari-bolt.png"', `src="${NS}assets/kaminari-bolt.png"`, 2),
    R("navigator.serviceWorker.register('/arc-sw.js',{scope:'/arc-tracker/'})", "navigator.serviceWorker.register('/arc-tracker/arc-sw.js',{scope:'/arc-tracker/'})", 1),
    // "Don't know? Take the archetype quiz" opens this site's quiz (same questions and scoring; it hands no data
    // to the tracker, which has its own archetype picker)
    R('href="/quiz"', 'href="/quiz.html"', 1),
  ],
  'arc-sw.js': [
    R("'/assets/arc-icon-192.png'", `'${NS}assets/arc-icon-192.png'`, 2),
  ],
  'arc-tracker.webmanifest': [
    R('"/assets/arc-icon-192.png"', `"${NS}assets/arc-icon-192.png"`, 1),
    R('"/assets/arc-icon-512.png"', `"${NS}assets/arc-icon-512.png"`, 1),
  ],
};

export function applyRewrites(name, text) {
  for (const { find, replace, count } of REWRITES[name] || []) {
    const n = typeof find === 'string' ? text.split(find).length - 1 : [...text.matchAll(find)].length;
    if (n !== count) throw new Error(`tracker rewrite mismatch in ${name}: expected ${count} of ${String(find).slice(0, 80)}, found ${n}`);
    text = typeof find === 'string' ? text.split(find).join(replace) : text.replace(find, () => replace);
  }
  return text;
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});

function upstreamRequest(request, path) {
  const headers = new Headers();
  for (const h of PASS_HEADERS) { const v = request.headers.get(h); if (v !== null) headers.set(h, v); }
  const init = { method: request.method, headers, redirect: 'manual' };
  if (!['GET', 'HEAD'].includes(request.method)) { init.body = request.body; init.duplex = 'half'; } // streamed, not buffered
  return new Request(UPSTREAM + path, init);
}

// copies an upstream response, dropping anything that should not cross over (cookies, caching validators of a
// body we changed) and keeping the tracker out of search engines
function relay(res, { body = res.body, type, cache } = {}) {
  const headers = new Headers();
  for (const h of ['content-type', 'cache-control', 'content-language', 'location']) {
    const v = res.headers.get(h); if (v !== null) headers.set(h, v);
  }
  if (type) headers.set('content-type', type);
  if (cache && res.status === 200) headers.set('cache-control', cache);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(body, { status: res.status, headers });
}

async function fetchText(env, path) {
  const res = await env.TRACKER.fetch(upstreamRequest(new Request('https://x/', { method: 'GET' }), path));
  if (res.status !== 200) throw new Error(`upstream ${path} returned ${res.status}`);
  return { res, text: await res.text() };
}

// Before serving the tracker page, every rewritten file is checked once per isolate (and again every 10 min),
// so a production change that breaks a rewrite sends people to the original app instead of a broken one.
let verified = 0;
const VERIFY_MS = 10 * 60 * 1000;
async function rewritesStillMatch(env) {
  if (Date.now() - verified < VERIFY_MS) return true;
  try {
    await Promise.all(['arc-gate.js', 'arc-tracker.js', 'arc-sw.js', 'arc-tracker.webmanifest']
      .map(async n => applyRewrites(n, (await fetchText(env, '/' + n)).text)));
    verified = Date.now();
    return true;
  } catch (e) {
    console.error(String(e));
    return false;
  }
}
export const _resetVerification = () => { verified = 0; };

// Returns a Response for tracker paths, or null for everything else (the marketing site handles those).
export async function handleTracker(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  const isTracker = pathname === '/arc-tracker' || pathname.startsWith('/arc-tracker/');
  const isApi = pathname.startsWith('/api/arc-');
  if (!isTracker && !isApi) return null;

  const method = request.method;
  const isPage = pathname === '/arc-tracker' || pathname === '/arc-tracker/' || pathname === '/arc-tracker/app';

  // one sign-in address: only the apex serves the tracker
  if (url.hostname !== LIVE_HOST) {
    if (isPage && (method === 'GET' || method === 'HEAD')) return Response.redirect(`${url.protocol}//${LIVE_HOST}/arc-tracker/app`, 302);
    return json(404, { ok: false, reason: 'not_on_this_host' });
  }

  const toOriginal = () => Response.redirect(ORIGINAL_APP, 302);

  if (isApi) {
    const rule = API.find(r => r.re.test(pathname));
    if (!rule) return json(404, { ok: false, reason: 'unknown_endpoint' });
    if (!rule.methods.includes(method)) return json(405, { ok: false, reason: 'method_not_allowed' });
    if (!env.TRACKER) return json(503, { ok: false, reason: 'not_configured' });
    return relay(await env.TRACKER.fetch(upstreamRequest(request, pathname)));
  }

  if (method !== 'GET' && method !== 'HEAD') return json(405, { ok: false, reason: 'method_not_allowed' });
  if (pathname === '/arc-tracker' || pathname === '/arc-tracker/') return Response.redirect(new URL('/arc-tracker/app', request.url).toString(), 302);

  if (pathname === '/arc-tracker/app') {
    if (!env.TRACKER) return toOriginal();
    try {
      if (!(await rewritesStillMatch(env))) return toOriginal();
      const { res, text } = await fetchText(env, '/arc-tracker/app');
      const html = applyRewrites('/arc-tracker/app', text);
      return relay(res, { body: method === 'HEAD' ? null : html, type: 'text/html; charset=utf-8' });
    } catch (e) {
      console.error(String(e));
      return toOriginal();
    }
  }

  if (pathname === '/arc-tracker/arc-sw.js') {
    if (!env.TRACKER) return json(503, { ok: false, reason: 'not_configured' });
    try {
      const { res, text } = await fetchText(env, '/arc-sw.js');
      return relay(res, { body: method === 'HEAD' ? null : applyRewrites('arc-sw.js', text), type: 'text/javascript; charset=utf-8' });
    } catch (e) { console.error(String(e)); return json(502, { ok: false, reason: 'tracker_unavailable' }); }
  }

  if (pathname.startsWith(NS)) {
    const file = pathname.slice(NS.length);
    const type = STATIC.get(file) || (AVATAR.test(file) ? 'image/png' : null);
    if (!type) return json(404, { ok: false, reason: 'not_found' });
    if (!env.TRACKER) return json(503, { ok: false, reason: 'not_configured' });
    if (REWRITES[file]) {
      try {
        const { res, text } = await fetchText(env, '/' + file);
        return relay(res, { body: method === 'HEAD' ? null : applyRewrites(file, text), type: type + '; charset=utf-8' });
      } catch (e) { console.error(String(e)); return json(502, { ok: false, reason: 'tracker_unavailable' }); }
    }
    const res = await env.TRACKER.fetch(upstreamRequest(request, '/' + file));
    if (res.status !== 200) return json(res.status === 404 ? 404 : 502, { ok: false, reason: 'not_found' });
    // Images only: on joinkaminari.com revalidating them is a free static-asset request, but here every request
    // runs this Worker and counts, so browsers keep them for a day. Page, JS, CSS and manifest still revalidate.
    return relay(res, { type, cache: type.startsWith('image/') ? IMAGE_CACHE : undefined });
  }

  return json(404, { ok: false, reason: 'not_found' });
}
