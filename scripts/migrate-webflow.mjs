// One-time migration: Webflow CMS export (CSV) -> src/content/blog/<slug>.json + <slug>.html
// Also writes migration/image-map.json (Webflow CDN url -> local /media path) for download-images.mjs.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseCsv } from './csv.mjs';

const CSV = 'migration/blog-export.csv';
const OUT = 'src/content/blog';
const SITE = /https?:\/\/(www\.)?joinkaminari\.com/g;

const rows = parseCsv(fs.readFileSync(CSV, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

const imageMap = {};
function localImage(url) {
  if (!/cdn\.prod\.website-files\.com/.test(url)) return url;
  if (!imageMap[url]) {
    const file = decodeURIComponent(url.split('/').pop().split('?')[0]);
    const id = (file.match(/^([0-9a-f]{24})_/) || [])[1] || crypto.createHash('md5').update(url).digest('hex').slice(0, 24);
    const ext = (file.match(/\.([a-z0-9]+)$/i) || [, 'jpg'])[1].toLowerCase();
    imageMap[url] = `/media/${id}.${ext}`;
  }
  return imageMap[url];
}

const isoDate = s => new Date(s.replace(/ \(.*\)$/, '')).toISOString();

function cleanBody(html) {
  return html
    // images: local path, lazy-load, drop Webflow's meaningless width/height="auto"
    .replace(/<img\b([^>]*?)\ssrc="([^"]+)"([^>]*)>/g, (_, a, src, b) =>
      `<img${a} src="${localImage(src)}"${b}>`
        .replace(/\s(width|height)="auto"/g, '')
        .replace(/\sloading="[^"]*"/, '')
        .replace(/<img/, '<img loading="lazy" decoding="async"'))
    // per-post inline table styles now live in the global stylesheet
    .replace(/<style>\s*\.table-wrap th,\s*\.table-wrap td\s*\{\s*padding:\s*8px 14px;?\s*\}\s*<\/style>/g, '')
    .replace(/<table border=['"]1['"] cellpadding=['"]5['"] cellspacing=['"]0['"]>/g, '<table>')
    // empty paragraphs Webflow pads with a zero-width joiner
    .replace(/<p>[‍​\s]*<\/p>/g, '')
    // internal links become relative so they work on any domain / preview URL
    .replace(/href="https?:\/\/(?:www\.)?joinkaminari\.com(\/[^"]*)?"/g, (_, p) => `href="${p || '/'}"`)
    .replace(/<iframe /g, '<iframe loading="lazy" ');
}

let n = 0;
for (const r of rows) {
  if (r.Draft === 'TRUE' || r.Archived === 'TRUE') continue;
  const meta = {
    title: r.Title,
    summary: r.Summary,
    metaTitle: r['Meta Title'] || r.Title,
    metaDescription: r['Meta Description'] || r.Summary,
    publishDate: isoDate(r['Publish Date']),
    updatedDate: isoDate(r['Updated On']),
    featured: r['Featured?'] === 'TRUE',
    author: r.Author,
    category: r.Category || null,
    thumbnail: r.Thumbnail ? localImage(r.Thumbnail) : null,
  };
  fs.writeFileSync(path.join(OUT, `${r.Slug}.json`), JSON.stringify(meta, null, 2) + '\n');
  fs.writeFileSync(path.join(OUT, `${r.Slug}.html`), cleanBody(r.Content) + '\n');
  n++;
}
fs.writeFileSync('migration/image-map.json', JSON.stringify(imageMap, null, 2));
console.log(`posts: ${n}, images referenced: ${Object.keys(imageMap).length}`);
