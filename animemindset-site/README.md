# The Anime Mindset

Static site for The Anime Mindset at animemindset.com, served by the `animemindset-preview` Worker (see Deploy
below). It is separate from joinkaminari.com: the root `vercel.json` and `wrangler.jsonc` serve `dist/` for the
`kaminari-site` Worker, and nothing here is part of that build.

| Page | Source | What changed from the source |
| --- | --- | --- |
| `index.html` (home) | Started as `mockups/animemindset/starting-point.html`, the copy of joinkaminari.com/anime-mindset | Redesigned (see Homepage below). Same copy and archetype content, reorganised into one story: hero → how it works → what it is → the 9 archetypes → Arc Tracker → coaching → newsletter |
| `quiz.html` | `src/quiz.html`, the joinkaminari.com/quiz archetype quiz | Questions, scoring, results and lead capture unchanged. Only the site identity changed: title, canonical, favicon, wordmark (links home), and the shareable result card and its link |
| `coaching.html` | `mockups/coaching/kaminari-landing-b.html` (Variant B) | Owner-approved revision (below); quiz button goes to `quiz.html` |
| `about.html` | Started as joinkaminari.com/about | Rewritten for The Anime Mindset (hero, "What We're Building", closing section); the team section (photos as WebP in `assets/team/`, roles, socials, top 5) is unchanged |
| `privacy-policy.html` | joinkaminari.com/privacy-policy | Refers to this website: "Website" is The Anime Mindset at animemindset.com, "Company" is Kaminari as the company that operates it, contact Contact@joinkaminari.com. Adds "Information You Give Us on This Website" (quiz, newsletter, emails). Last updated November 18, 2026 |
| `newsletter.html` | joinkaminari.com/newsletter (built from `src/templates/pages.mjs`) | Rewritten for The Anime Mindset; no blog section (past issues via "Read on Substack"); signup box has a direct Substack link (below) |

`robots.txt` and `sitemap.xml` (home, quiz, newsletter) are served too.

## Search engines

On animemindset.com the home, quiz and newsletter pages are indexable. `coaching.html` stays `noindex, nofollow`
(meta tag and response header), as the owner asked. Everything served on the `workers.dev` address gets
`X-Robots-Tag: noindex, nofollow`, so search engines list animemindset.com rather than the duplicate. Each page has a
description, a canonical URL (except coaching), Open Graph/Twitter tags and the share image `assets/og-image.png`
(1200×630). Favicons (`assets/icon.svg`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`) and the share image show the blue bolt from `assets/kaminari-bolt.png`.

## Homepage

Sections, in order: a full-bleed hero over `assets/art/hero-rooftop.webp` with one main action (Find Your Archetype);
How it works (three numbered steps that reuse the "mirror / weakness / systems" cards); What is the Anime Mindset
(statement plus the rotating quotes from `main.js`); the 9 archetypes as cards (swipeable on phones) leading to the
quiz; the Arc Tracker (features, Get Notified, Sign in, rank ladder); a coaching teaser linking to `coaching.html`; and
a newsletter close over `assets/art/storm-city.webp`. Styles are in `assets/home.css`, loaded only by `index.html`.

The two artworks are the owner's ChatGPT-generated cityscapes, recoloured to the brand cyan: the rooftop scene had its
warm tones moved to cyan (and was mirrored so the figure faces the headline); the storm city had its hue rotated.

## Navigation

Three tabs, in this order, in the header on every page (desktop row and phone menu) and at the top of the footer's
Explore list on the home and newsletter pages:

| Tab | Goes to |
| --- | --- |
| Arc Tracker | `https://www.joinkaminari.com/arc-tracker/app`, the live Arc Tracker, so existing users sign in as before. No tracker page or data lives on this site. |
| Coaching | `coaching.html` |
| Newsletter | `newsletter.html` |

The footer Explore list has the three tabs plus About; About and Privacy Policy are this site's own copies. Footer Contact is Contact@joinkaminari.com. Links that belong
only to joinkaminari.com were removed: Blog, Learn to Draw Anime, Discord (and its disabled waitlist form), Advertise
and RSS, plus a self-link to "Anime Mindset".

## The quiz and the Arc Tracker

The Arc Tracker's own sign-up flow is untouched: it has its own archetype picker, and its "Don't know? Take the
archetype quiz" link still opens joinkaminari.com/quiz, which is unchanged. The quiz copy here hands nothing to the
tracker.

`quiz.html` saves leads to the same Supabase `quiz_submissions` table as the joinkaminari.com quiz (first name,
email and the optional fields, then the result). Its newsletter and Discord checkboxes still name the Kaminari
newsletter and Kaminari Discord, because that's where those sign-ups go.

## Signups

The newsletter signup is Substack's own embedded form (`joinkaminari.substack.com/embed`), so signups go straight to
the Kaminari Substack. Under the embed there's always a "Form not loading? Subscribe on Substack →" button, because a
page can't tell whether an embedded form from another site loaded. The pop-up signup has the same kind of link.

## Coaching page (owner-approved revision)

The page keeps the Variant B headline, "Read This First" story, the three-arc 90-day explanation, "This Isn't For
Everyone", two FAQ answers and the free quiz/newsletter fallback. It has no prices, dates, seat counts,
testimonials, coach bios, guarantee or refund claims, checkout or waitlist. Every "Ask about coaching" button (header,
hero, closing section) opens an email to Contact@joinkaminari.com with the subject "Coaching inquiry". The closing
section uses the approved wording exactly.

## Styling

`assets/home.css` holds the homepage redesign only. `assets/styles.css` is a copy of the main site's stylesheet. The blocks at the end are the only additions: the header
is laid out as name | tabs | button with the tabs centred on desktop (name 30px, tabs 16.5px); below 700px the
newsletter button hides and the name sizes to the screen; the logo (`assets/kaminari-bolt.png`, the blue lightning bolt from the joinkaminari.com logo) sizes with the name; and the newsletter
signup box's fallback row is styled. The header button on the home and newsletter pages is "Find Your Archetype". The coaching
and quiz pages keep their own `<style>` blocks.

## Deploy

`deploy/` turns this folder into one self-contained Worker, `animemindset-preview`.

- `deploy/build-worker.mjs` generates `deploy/worker.generated.js` from an allowlist: the four pages, `robots.txt`,
  `sitemap.xml` and every file under `assets/`. Text files are embedded; PNG/WebP images are binary Data modules.
  Run it again after any site change.
- The Worker answers GET/HEAD only. `/` serves `index.html`; every other allowlisted path is served with its MIME type
  and `X-Content-Type-Options: nosniff`, plus the search-engine rules above. Anything else is a 404 (the README and
  deploy files are never served); other methods get 405.
- `deploy/wrangler.jsonc` has no bindings, routes or custom domains, and no static-assets binding. Paths under
  `/arc-tracker` and `/api/arc-*` are handled by `deploy/tracker-proxy.mjs` (see Arc Tracker below).

    node animemindset-site/deploy/build-worker.mjs
    npx wrangler@4.156.2 deploy -c animemindset-site/deploy/wrangler.jsonc

## Arc Tracker on animemindset.com (built and tested locally, not live)

`deploy/tracker-proxy.mjs` can serve the existing Arc Tracker at animemindset.com/arc-tracker/app by passing an exact
list of paths to the production `kaminari-site` Worker through a service binding named `TRACKER`. The tracker's
storage (KV, R2) and secrets stay on that Worker, members keep their progress and photos, and nothing is copied.

- Paths: `/arc-tracker/app` (GET/HEAD), `/arc-tracker/arc-sw.js` (the tracker's service worker, inside its
  `/arc-tracker/` scope), `/arc-tracker/k/<file>` (the tracker's CSS, JS, icons and avatars, namespaced so they never
  shadow this site's `assets/styles.css`, avatars or quiz), and the tracker API by exact path and method:
  `POST /api/arc-verify`, `POST /api/arc-sync`, `GET /api/arc-photos`, `GET|PUT /api/arc-photos/<id>/(full|thumb)`,
  `DELETE /api/arc-photos/<id>`, `GET /api/arc-push/key`, `POST /api/arc-push/(subscribe|unsubscribe|cleared|test|next)`.
  Anything else under `/api/arc-*` is 404 and a wrong method is 405, without reaching production. `/api/waitlist`,
  `/go/*` and every other production path are never forwarded. Only `content-type`, `accept` and the tracker's
  `x-arc-*` headers are passed on (no cookies, no query strings).
- The tracker's files are rewritten with exact, counted replacements, including `isLive = true` in the gate so its
  built-in sample key never opens the tracker here. The "take the archetype quiz" link keeps opening
  joinkaminari.com/quiz. If production's files change so any replacement stops matching, `/arc-tracker/app` redirects
  to the original app on joinkaminari.com instead of serving a half-rewritten page.
- **Without the binding** (the current `deploy/wrangler.jsonc`), `/arc-tracker/app` redirects to the original app and
  the tracker API answers 503. Turning it on is the one config change below, which is not made yet:

      "services": [ { "binding": "TRACKER", "service": "kaminari-site" } ]

- Members sign in again on the new address with the same key (browser storage is per site), and turn notifications
  on again there. Anything logged offline and not yet backed up stays in the old site's browser until it syncs there.
- Tests: `node animemindset-site/deploy/tracker-proxy.test.mjs <built kaminari-site dist/>`.

The script has to stay under the Workers free plan's 3 MB (compressed) limit; it's about 1.2 MB. The newsletter page
no longer shows blog posts, so its thumbnails were removed from `assets/media/` (the originals are
still in the repo at `public/media/`).

## Open it

Open `index.html` in a browser, or serve the folder:

    npx serve animemindset-site

## Known gaps

- Still Kaminari by design: the newsletter itself (the Substack and its embed), the quiz's newsletter and Discord
  checkboxes, the newsletter page's line saying it goes out through the Kaminari newsletter, the logo bolt, the footer
  LinkedIn and the About link.
- The mockup folders this was built from (`mockups/animemindset/`, `mockups/coaching/`) are kept unchanged as
  reference.
