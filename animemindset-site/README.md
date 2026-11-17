# The Anime Mindset (review build)

Static site for The Anime Mindset, intended for animemindset.com. Review only: it is not deployed.
`vercel.json` and `wrangler.jsonc` serve `dist/` for joinkaminari.com, and nothing here is part of that build.
No domain or DNS is set up for it.

| Page | Source | What changed from the source |
| --- | --- | --- |
| `index.html` (home) | `mockups/animemindset/starting-point.html`, the copy of joinkaminari.com/anime-mindset | Mockup bar removed, title and wordmark say The Anime Mindset, asset paths moved to `assets/`, nav replaced with the site tabs (below), footer "Anime Mindset" link points here |
| `coaching.html` | `mockups/coaching/kaminari-landing-b.html` (Variant B) | Title and wordmark say The Anime Mindset, logo and "The Anime Mindset Home" go to `index.html`, quiz and newsletter buttons go to the live quiz and Substack, "Variant A" footer link removed, site tabs added to its header with a phone menu |
| `newsletter.html` | joinkaminari.com/newsletter (built from `src/templates/pages.mjs`) | Same content and look, wrapped in this site's header and footer. Post cards and "Start Reading" link to the live blog; thumbnails copied to `assets/media/` |

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

## Still placeholders on the coaching page

Every bracketed value stays as it is: prices, dates, seat counts, testimonials, coach bios and guarantee
terms. "Claim My Seat" under the price only shows a "connect this to your real checkout flow" message; there is
no checkout.

## Styling

`assets/styles.css` is a copy of the main site's stylesheet. The block at the end is the only addition: the
longer "The Anime Mindset" wordmark is set a little smaller (26px) and kept on one line. The header switches to
the phone menu at the original 1120px. The coaching page's header styles live in its own `<style>` block.

## Open it

Open `index.html` in a browser, or serve the folder:

    npx serve animemindset-site

## Known gaps

- On the home and newsletter pages the header wordmark still links to joinkaminari.com, as on the original page.
  With the old "Anime Mindset" tab gone, the way back to this site's home from the newsletter page is the footer's
  "Anime Mindset" link.
- On phones narrower than about 380px the coaching page scrolls sideways a little, because the large "Claim My Seat
  In The Next Cohort" button is wider than the screen. The Variant B file does the same; it's left as supplied.
- These still say Kaminari because they name Kaminari's newsletter, Discord or team rather than the site:
  the newsletter pop-up title, the Discord waitlist text, the newsletter page's body copy (for example "Experience
  The Kaminari Energy"), the "Welcome to Kaminari" post title, and "Founder, Kaminari" on the coaching page.
- The footer's Discord waitlist form posts to `/api/waitlist`, which this site doesn't have, so it won't submit here.
- The coaching page's top banner still mentions Variant A (`kaminari-landing.html`) as text.
- The mockup folders this was built from (`mockups/animemindset/`, `mockups/coaching/`) are kept unchanged as
  reference.
