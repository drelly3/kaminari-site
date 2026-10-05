// Re-pulls every live blog post from the Webflow CMS API into migration/blog-export.csv
// (same columns as Webflow's CSV export), so posts published or edited after the last export aren't lost.
// Usage: WEBFLOW_API_TOKEN=... node scripts/export-webflow.mjs && node scripts/migrate-webflow.mjs && node scripts/download-images.mjs
const TOKEN = process.env.WEBFLOW_API_TOKEN;
if (!TOKEN) { console.error('Set WEBFLOW_API_TOKEN (needs CMS read access).'); process.exit(1); }
import fs from 'node:fs';

const API = 'https://api.webflow.com/v2/collections/';
const BLOGS = '698a1be64aec68356fde1062';
const AUTHORS = '698a1be64aec68356fde109e';
const CATEGORIES = '698a1be64aec68356fde107f';

async function liveItems(collection) {
  const items = [];
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(`${API}${collection}/items/live?limit=100&offset=${offset}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`Webflow API ${res.status}: ${await res.text()}`);
    const page = await res.json();
    items.push(...page.items);
    if (items.length >= page.pagination.total) return items;
  }
}
const slugById = async c => Object.fromEntries((await liveItems(c)).map(i => [i.id, i.fieldData.slug]));

const [posts, authors, categories] = await Promise.all([liveItems(BLOGS), slugById(AUTHORS), slugById(CATEGORIES)]);
const bool = b => (b ? 'TRUE' : 'FALSE');
const date = d => d && d.replace(/\.\d{3}Z$/, '.000Z'); // Webflow's CSV export has second precision

const rows = posts.sort((a, b) => a.fieldData.slug.localeCompare(b.fieldData.slug)).map(p => {
  const f = p.fieldData;
  return {
    Title: f.name, Slug: f.slug, 'Collection ID': BLOGS, 'Locale ID': p.cmsLocaleId, 'Item ID': p.id,
    Archived: bool(p.isArchived), Draft: bool(p.isDraft),
    'Created On': date(p.createdOn), 'Updated On': date(p.lastUpdated), 'Published On': date(p.lastPublished),
    'Publish Date': f['publish-date'], Summary: f['post-summary'], 'Meta Title': f['meta-title-3'],
    'Meta Description': f['meta-description-3'], Thumbnail: f['main-image']?.url, 'Featured?': bool(f.featured),
    Author: authors[f.author], Category: categories[f.category], Content: f['post-body'],
  };
});
const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
const header = Object.keys(rows[0]);
fs.writeFileSync('migration/blog-export.csv', [header, ...rows.map(r => header.map(h => r[h]))].map(r => r.map(cell).join(',')).join('\n') + '\n');
console.log(`exported ${rows.length} live posts`);
