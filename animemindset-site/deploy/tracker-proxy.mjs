// Arc Tracker on animemindset.com: an allowlisted pass-through to the existing tracker Worker.
//
// The tracker app, its storage (KV + R2) and its secrets stay on the production Worker ("kaminari-site").
// This module only forwards an exact list of tracker paths to it through the TRACKER service binding.
// Nothing here reads or writes member data itself, and no secret is needed or copied.
//
// Paths on this site (nothing outside /arc-tracker and /api/arc-* is touched, so the marketing pages,
// /assets/styles.css, the site's own avatars and /quiz.html are never shadowed):
//   /arc-tracker, /arc-tracker/            -> redirect to /arc-tracker/app
//   /arc-tracker/app                       -> the tracker page (GET/HEAD)
//   /arc-tracker/arc-sw.js                 -> the tracker's service worker (inside its /arc-tracker/ scope)
//   /arc-tracker/k/<file>                  -> the tracker's own CSS, JS, icons and avatars, namespaced (GET/HEAD)
//   /api/arc-verify, /api/arc-sync, /api/arc-photos..., /api/arc-push/...  -> exact paths and methods below
//
// The tracker's HTML/JS/manifest use root paths (/styles.css, /arc-tracker.js, /assets/avatars/...). They
// are rewritten to the /arc-tracker/k/ namespace with exact, counted replacements. If production's files
// change so that any replacement no longer matches exactly, the tracker page is not served half-rewritten:
// /arc-tracker/app redirects to the original, working app on joinkaminari.com instead.

export const ORIGINAL_APP = 'https://www.joinkaminari.com/arc-tracker/app';
const UPSTREAM = 'https://www.joinkaminari.com';      // URL host for the service-binding request (routing is by path)
const NS = '/arc-tracker/k/';

// /arc-tracker/k/<file> -> upstream /<file>
const STATIC = new Map([
  ['styles.css', 'text/css'],
  ['arc-tracker.css', 'text/css'],
  ['arc-gate.js', 'text/javascript'],
  ['arc-tracker.js', 'text/javascript'],
  ['arc-tracker.webmanifest', 'application/manifest+json'],
  ['favicon.jpg', 'image/jpeg'],
  ['apple-touch-icon.jpg', 'image/jpeg'],
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

// Exact text rewrites per upstream file: [find, replace, expected count]. A mismatch fails closed.
const R = (find, replace, count) => ({ find, replace, count });
export const REWRITES = {
  '/arc-tracker/app': [
    R('href="/styles.css"', `href="${NS}styles.css"`, 1),
    R('href="/arc-tracker.css"', `href="${NS}arc-tracker.css"`, 1),
    R('href="/arc-tracker.webmanifest"', `href="${NS}arc-tracker.webmanifest"`, 1),
    R('href="/favicon.jpg"', `href="${NS}favicon.jpg"`, 1),
    R('href="/apple-touch-icon.jpg"', `href="${NS}apple-touch-icon.jpg"`, 1),
    R('src="/assets/kaminari-bolt.png"', `src="${NS}assets/kaminari-bolt.png"`, 2),
    R('src="/arc-gate.js"', `src="${NS}arc-gate.js"`, 1),
    // links that leave the tracker keep their original destinations on joinkaminari.com
    R('href="/rss.xml"', `href="${UPSTREAM}/rss.xml"`, 1),
    R('href="/anime-mindset"', `href="${UPSTREAM}/anime-mindset"`, 1),
  ],
  'arc-gate.js': [
    R("s.src = '/arc-tracker.js'", `s.src = '${NS}arc-tracker.js'`, 1),
    // the built-in sample key must never open the tracker on this site, on any host
    R('const isLive = /(^|\\.)joinkaminari\\.com$/.test(location.hostname);', 'const isLive = true;', 1),
  ],
  'arc-tracker.js': [
    R("'/assets/avatars/'", `'${NS}assets/avatars/'`, 1),
    R('src="/assets/kaminari-bolt.png"', `src="${NS}assets/kaminari-bolt.png"`, 2),
    R("navigator.serviceWorker.register('/arc-sw.js',{scope:'/arc-tracker/'})", "navigator.serviceWorker.register('/arc-tracker/arc-sw.js',{scope:'/arc-tracker/'})", 1),
    // "Don't know? Take the archetype quiz" keeps opening the original quiz
    R('href="/quiz"', `href="${UPSTREAM}/quiz"`, 1),
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
    const n = text.split(find).length - 1;
    if (n !== count) throw new Error(`tracker rewrite mismatch in ${name}: expected ${count} of ${JSON.stringify(find)}, found ${n}`);
    text = text.split(find).join(replace);
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
  const { pathname } = new URL(request.url);
  const isTracker = pathname === '/arc-tracker' || pathname.startsWith('/arc-tracker/');
  const isApi = pathname.startsWith('/api/arc-');
  if (!isTracker && !isApi) return null;

  const method = request.method;
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
