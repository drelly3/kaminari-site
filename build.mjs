// Builds the whole site into dist/. No dependencies: `node build.mjs`
import { QUOTES } from './api/arc-quotes.js';
import fs from 'node:fs';
import path from 'node:path';
import { site, kinds, authors, archetypes } from './site.config.mjs';
import { layout, esc, abs } from './src/templates/layout.mjs';
import * as pages from './src/templates/pages.mjs';

const DIST = 'dist';
const BLOG = 'src/content/blog';

// ---------- load posts ----------
const slugify = s => s.toLowerCase().replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const stripTags = s => s.replace(/<[^>]+>/g, '');

const posts = fs.readdirSync(BLOG).filter(f => f.endsWith('.json')).map(f => {
  const slug = f.slice(0, -5);
  const meta = JSON.parse(fs.readFileSync(path.join(BLOG, f), 'utf8'));
  let html = fs.readFileSync(path.join(BLOG, slug + '.html'), 'utf8');

  // give every h2 an id and collect them for the "On this page" list
  const toc = [], seen = new Set();
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    const text = stripTags(inner).replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').trim();
    let id = slugify(text) || 'section';
    for (let i = 2; seen.has(id); i++) id = `${slugify(text)}-${i}`;
    seen.add(id);
    toc.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return { ...meta, slug, html, toc, kind: kinds.find(k => k.test(slug)).id, readingTime: Math.max(1, Math.round(words / 225)) };
}).sort((a, b) => b.publishDate.localeCompare(a.publishDate) || a.slug.localeCompare(b.slug));

// ---------- write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync('public', DIST, { recursive: true });
fs.copyFileSync('src/styles.css', path.join(DIST, 'styles.css'));
fs.copyFileSync('src/main.js', path.join(DIST, 'main.js'));
fs.copyFileSync('src/arc-tracker.css', path.join(DIST, 'arc-tracker.css'));
// the tracker script, with the daily quotes list added on top
// ...and the website's description of each archetype, for the "choose your archetype" screen
const blurbs = Object.fromEntries(archetypes.map(a => [a[6], { line: a[2], about: a[4] }]));
fs.writeFileSync(path.join(DIST, 'arc-tracker.js'), 'window.ARC_QUOTES=' + JSON.stringify(QUOTES) + ';\nwindow.ARC_BLURBS=' + JSON.stringify(blurbs) + ';\n' + fs.readFileSync('src/arc-tracker.js', 'utf8'));
fs.copyFileSync('src/arc-gate.js', path.join(DIST, 'arc-gate.js'));
fs.copyFileSync('src/quiz.html', path.join(DIST, 'quiz.html')); // the archetype quiz is a self-contained page

const routes = [];
function write(route, opts) {
  const file = path.join(DIST, route === '/' ? 'index.html' : route.slice(1) + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, layout({ path: route, ...opts }));
  if (route !== '/404' && opts.listed !== false) routes.push({ route, lastmod: opts.lastmod });
}

// the tracker's archetype data lives in the browser script; read it here so pages can show it too
const arcSrc = fs.readFileSync('src/arc-tracker.js', 'utf8');
const arcStart = arcSrc.indexOf('const ARCHETYPES = ['), arcEnd = arcSrc.indexOf('\nconst ARCHETYPE_ICONS');
const arcArchetypes = Function(arcSrc.slice(arcStart, arcEnd) + '; return ARCHETYPES;')();

const org = { '@type': 'Organization', '@id': site.url + '/#organization', name: site.name, url: site.url, logo: abs('/assets/kaminari-logo-white.svg') };

write('/', {
  title: 'Kaminari — Turn The Anime You Love Into Habits That Actually Stick',
  description: 'Weekly anime lessons, archetype-matched habit templates, coaching, and a community of others doing the same. Join the free Kaminari newsletter.',
  jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', '@id': site.url + '/#website', url: site.url, name: site.name, publisher: { '@id': org['@id'] } }, org] },
  body: pages.home(posts),
});
write('/about', {
  title: 'About | Kaminari Newsletter',
  description: "Anime ain't just entertainment — it's energy, lessons, and mindset shifts disguised as battles. Kaminari is a weekly newsletter for people who grew up on anime — and grew up learning from it.",
  body: pages.about(),
});
write('/newsletter', { title: 'Your Ultimate Anime Newsletter | Kaminari Newsletter', body: pages.newsletter(posts) });
write('/anime-mindset', {
  title: 'The Anime Mindset | Kaminari',
  description: 'Stop watching growth and start living it. Find your archetype, name your demon, and build a daily system from the anime you love.',
  body: pages.animeMindset(arcArchetypes),
});
write('/privacy-policy', { title: 'Privacy Policy | Kaminari', body: pages.privacy(fs.readFileSync('src/content/privacy-policy.html', 'utf8')) });
write('/blog', {
  title: 'Blog | Kaminari — Anime Lessons, Watch Orders, Filler Lists & Quotes',
  description: 'Anime lessons, watch orders, filler lists, character quotes, and recommendations from the Kaminari universe.',
  body: pages.blogIndex(posts),
});
// the tracker itself (members only once sign-in and payment are connected)
write('/arc-tracker/app', {
  title: 'Arc Tracker | Kaminari',
  description: 'Your Arc Tracker.',
  head: `<meta name="robots" content="noindex">\n<link rel="manifest" href="/arc-tracker.webmanifest">\n<meta name="theme-color" content="#0A0D13">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Arc Tracker">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/arc-tracker.css">`,
  tracking: false, // habit logs are private: no analytics on this page unless Drelly says otherwise
  listed: false,
  chrome: false, // a full-screen app: no site header, footer or newsletter popup
  body: pages.arcTracker(),
});
write('/404', { title: 'Page Not Found | Kaminari', body: pages.notFound() });

for (const p of posts) {
  // related: the next posts of the same kind (wrapping around), topped up with the latest posts
  const same = posts.filter(o => o.kind === p.kind);
  const i = same.indexOf(p);
  const pick = [...same.slice(i + 1), ...same.slice(0, i), ...posts.filter(o => o.kind !== p.kind)].slice(0, 3);
  const author = authors[p.author];
  write(`/blog/${p.slug}`, {
    title: `${p.metaTitle} | Kaminari`,
    description: p.metaDescription,
    image: p.thumbnail || site.ogImage,
    type: 'article',
    lastmod: p.updatedDate,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.title, description: p.metaDescription,
      image: abs(p.thumbnail || site.ogImage),
      datePublished: p.publishDate, dateModified: p.updatedDate,
      mainEntityOfPage: abs(`/blog/${p.slug}`),
      author: { '@type': 'Person', name: author?.name || site.name },
      publisher: org,
    },
    body: pages.blogPost(p, pick),
  });
}

// ---------- sitemap, rss, robots ----------
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(r => `  <url><loc>${site.url}${r.route === '/' ? '' : r.route}</loc><lastmod>${(r.lastmod || today).slice(0, 10)}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n<title>Kaminari Blog</title>\n<link>${site.url}/blog</link>\n<description>${esc(site.description)}</description>\n` +
  posts.map(p => `<item><title>${esc(p.title)}</title><link>${site.url}/blog/${p.slug}</link><guid>${site.url}/blog/${p.slug}</guid><pubDate>${new Date(p.publishDate).toUTCString()}</pubDate><description>${esc(p.metaDescription)}</description></item>`).join('\n') +
  `\n</channel></rss>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

// ---------- Cloudflare Pages settings (the Vercel equivalents live in vercel.json) ----------
fs.writeFileSync(path.join(DIST, '_redirects'), '/arc-tracker /arc-tracker/app 302\n');
fs.writeFileSync(path.join(DIST, '_headers'), '/media/*\n  Cache-Control: public, max-age=31536000, immutable\n');
// only the licence check runs as server code; every other address is a plain file
fs.writeFileSync(path.join(DIST, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/*'], exclude: [] }) + '\n');

console.log(`Built ${routes.length + 1} pages (${posts.length} posts) into ${DIST}/`);
