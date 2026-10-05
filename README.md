# Kaminari website

Static site for joinkaminari.com, migrated off Webflow. No dependencies — just Node 18+.

## Commands

    node build.mjs     # builds everything into dist/
    node serve.mjs     # preview dist/ at http://localhost:4321

## Where things live

| What | Where |
| --- | --- |
| Links (Substack, Discord, quiz, Gumroad), nav, team, quotes, archetypes | `site.config.mjs` |
| Page layouts (home, about, newsletter, anime mindset, blog) | `src/templates/pages.mjs` |
| Header, footer, SEO tags, newsletter popup | `src/templates/layout.mjs` |
| Design (colors, spacing, type) | `src/styles.css` |
| Blog posts | `src/content/blog/<slug>.json` (details) + `<slug>.html` (body) |
| Images | `public/media/` (blog), `public/assets/` (site) |

## Adding a blog post

1. Copy any `src/content/blog/*.json`, rename it to the new URL slug, and edit the fields.
2. Create the matching `<slug>.html` with the post body (plain HTML: `<p>`, `<h2>`, `<figure><img></figure>`, `<table>`).
3. Put images in `public/media/` and reference them as `/media/filename.jpg`.
4. Run `node build.mjs`. The post appears at `/blog/<slug>`, on the blog index, in the sitemap and RSS feed.

## Deploying

`vercel.json` is set up for Vercel: build command `node build.mjs`, output `dist`, clean URLs
(`/blog/naruto-filler-list`, no `.html`) so every URL matches the old Webflow site.

## migration/

One-time Webflow migration inputs and scripts (`scripts/migrate-webflow.mjs`, `scripts/download-images.mjs`).
Not needed for day-to-day work; safe to delete once the new site is live.

Until cutover, Webflow is still the source of truth. To pull in anything published or edited there since the last export:

    WEBFLOW_API_TOKEN=... node scripts/export-webflow.mjs && node scripts/migrate-webflow.mjs && node scripts/download-images.mjs
