# The Anime Mindset (review build)

Static site for The Anime Mindset, intended for animemindset.com. Review only: it is not deployed.
`vercel.json` and `wrangler.jsonc` serve `dist/` for joinkaminari.com, and nothing here is part of that build.
No domain or DNS is set up for it.

| Page | Source | What changed from the source |
| --- | --- | --- |
| `index.html` (home) | `mockups/animemindset/starting-point.html`, the copy of joinkaminari.com/anime-mindset | Mockup bar removed, title and wordmark say The Anime Mindset, asset paths moved to `assets/`, "Anime Mindset" nav/footer links point here, **Coaching** added to the nav and footer |
| `coaching.html` | `mockups/coaching/kaminari-landing-b.html` (Variant B) | Title and wordmark say The Anime Mindset, logo and "The Anime Mindset Home" go to `index.html`, quiz and newsletter buttons go to the live quiz and Substack, "Variant A" footer link removed |
| `newsletter.html` | joinkaminari.com/newsletter (built from `src/templates/pages.mjs`) | Same content and look, wrapped in this site's header and footer. Post cards and "Start Reading" link to the live blog; thumbnails copied to `assets/media/` |

All three pages carry `noindex, nofollow`.

## Signups

The newsletter signup is Substack's own embedded form (`joinkaminari.substack.com/embed`), so signups go
straight to your live Substack. Nothing on this site posts newsletter signups anywhere else.

## Still placeholders on the coaching page

Every bracketed value stays as it is: prices, dates, seat counts, testimonials, coach bios and guarantee
terms. "Claim My Seat" under the price only shows a "connect this to your real checkout flow" message; there is
no checkout.

## Styling

`assets/styles.css` is a copy of the main site's stylesheet. The block at the end is the only addition: the
longer "The Anime Mindset" wordmark is set a little smaller (26px) with tighter nav spacing so the header stays
on one line, and the header switches to the phone menu below 1240px instead of 1120px.

## Open it

Open `index.html` in a browser, or serve the folder:

    npx serve animemindset-site

## Known gaps

- The nav tabs aren't wired for this site yet. About, Blog, Newsletter and Community still go to joinkaminari.com,
  so `newsletter.html` is only reachable directly for now. The header wordmark also still links to joinkaminari.com.
- These still say Kaminari because they name Kaminari's newsletter, Discord or team rather than the site:
  the newsletter pop-up title, the Discord waitlist text, the newsletter page's body copy (for example "Experience
  The Kaminari Energy"), the "Welcome to Kaminari" post title, and "Founder, Kaminari" on the coaching page.
- The footer's Discord waitlist form posts to `/api/waitlist`, which this site doesn't have, so it won't submit here.
- The coaching page's top banner still mentions Variant A (`kaminari-landing.html`) as text.
- The mockup folders this was built from (`mockups/animemindset/`, `mockups/coaching/`) are kept unchanged as
  reference.
