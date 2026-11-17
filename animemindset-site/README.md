# The Anime Mindset (review build)

Static site for The Anime Mindset, intended for animemindset.com. Review only: published as an isolated
preview Worker on workers.dev (see Preview deploy below). It is separate from joinkaminari.com: the root
`vercel.json` and `wrangler.jsonc` serve `dist/` for the `kaminari-site` Worker, and nothing here is part of that build.
No domain or DNS is set up for it.

| Page | Source | What changed from the source |
| --- | --- | --- |
| `index.html` (home) | `mockups/animemindset/starting-point.html`, the copy of joinkaminari.com/anime-mindset | Mockup bar removed, title and wordmark say The Anime Mindset, asset paths moved to `assets/`, nav replaced with the site tabs (below), wordmark/logo and footer "Anime Mindset" link point here |
| `coaching.html` | `mockups/coaching/kaminari-landing-b.html` (Variant B) | Title and wordmark say The Anime Mindset, logo and "The Anime Mindset Home" go to `index.html`, quiz and newsletter buttons go to the live quiz and Substack, "Variant A" footer link removed, site tabs added to its header with a phone menu, large CTA buttons wrap on phones narrower than 480px |
| `newsletter.html` | joinkaminari.com/newsletter (built from `src/templates/pages.mjs`) | Same content and look, wrapped in this site's header and footer, wordmark/logo point to `index.html`. Post cards and "Start Reading" link to the live blog; thumbnails copied to `assets/media/`. Signup box has a direct Substack link (below) |

All three pages carry `noindex, nofollow`.

## Navigation

The site has three tabs, in this order, in the header on every page (desktop row and phone menu) and at the top of
the footer's Explore list on the home and newsletter pages:

| Tab | Goes to |
| --- | --- |
| Habit Tracker | `https://www.joinkaminari.com/arc-tracker/app`, the live Arc Tracker, same as the "Have A Key? Sign In" buttons. No tracker page or data lives on this site. |
| Coaching | `coaching.html` |
| Newsletter | `newsletter.html` |

The current page's tab is highlighted. The coaching page keeps its short header (deadline and "Claim My Seat");
the tabs sit beside them and fold into a ☰ menu below 900px. The footer Explore list keeps its other links
(About, Blog, Anime Mindset, Learn to Draw Anime, Discord) under the tabs.

## Signups

The newsletter signup is Substack's own embedded form (`joinkaminari.substack.com/embed`), so signups go
straight to your live Substack. Nothing on this site posts newsletter signups anywhere else.

Under the embed, inside the same box, there's always a "Form not loading? Subscribe on Substack →" button that
opens `joinkaminari.substack.com/subscribe`. A page can't tell whether an embedded form from another site loaded or
failed, so the link is shown every time rather than only on failure. If the embed is blocked, the form area above
the link stays blank; the link below it still works. The pop-up signup already had the same kind of link.

## Still placeholders on the coaching page

Every bracketed value stays as it is: prices, dates, seat counts, testimonials, coach bios and guarantee
terms. "Claim My Seat" under the price only shows a "connect this to your real checkout flow" message; there is
no checkout.

## Styling

`assets/styles.css` is a copy of the main site's stylesheet. The blocks at the end are the only additions: the
longer "The Anime Mindset" wordmark is set a little smaller (26px) and kept on one line, and the newsletter
signup box's fallback row is styled. The header switches to the phone menu at the original 1120px. The coaching page's header styles live in its own `<style>` block.

## Preview deploy

`deploy/` turns this folder into one self-contained Worker, `animemindset-preview`, served only at
`https://animemindset-preview.joinkaminari.workers.dev`.

- `deploy/build-worker.mjs` generates `deploy/worker.generated.js` from an allowlist: the three pages plus every
  file under `assets/`. Pages, CSS, JS and the SVG are embedded as text; PNG/WebP images are uploaded as binary
  Data modules. Run it again after any site change.
- The Worker answers GET/HEAD only. `/` serves `index.html`; every other allowlisted path is served with its MIME
  type, `X-Robots-Tag: noindex, nofollow` and `X-Content-Type-Options: nosniff`. Anything else is a 404 (the README
  and deploy files are never served); other methods get 405.
- `deploy/wrangler.jsonc` has no bindings, routes or custom domains, and no static-assets binding.

    node animemindset-site/deploy/build-worker.mjs
    npx wrangler@4.156.2 deploy -c animemindset-site/deploy/wrangler.jsonc

The whole script has to stay under the Workers free plan's 3 MB (compressed) limit; it's about 2.86 MB. To fit, the
two largest newsletter animations were re-encoded: `698b6ff7…webp` (568×320 → 480×270, same 16:9 framing) and
`698b6c67…webp` (same 480×360 size). Both keep every frame, frame timing and loop setting. The originals are
still in the repo at `public/media/`.

## Open it

Open `index.html` in a browser, or serve the folder:

    npx serve animemindset-site

## Known gaps

- These still say Kaminari because they name Kaminari's newsletter, Discord or team rather than the site:
  the newsletter pop-up title, the Discord waitlist text, the newsletter page's body copy (for example "Experience
  The Kaminari Energy"), the "Welcome to Kaminari" post title, and "Founder, Kaminari" on the coaching page.
- The footer's Discord waitlist form posts to `/api/waitlist`, which this site doesn't have, so it won't submit here.
- The coaching page's top banner still mentions Variant A (`kaminari-landing.html`) as text.
- The mockup folders this was built from (`mockups/animemindset/`, `mockups/coaching/`) are kept unchanged as
  reference.
