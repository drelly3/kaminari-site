# animemindset.com (review build)

Static site for review only. It is not deployed: `vercel.json` and `wrangler.jsonc` serve `dist/` for
joinkaminari.com, and nothing here is part of that build. No domain or DNS is set up for it.

| Page | Source | What changed from the source |
| --- | --- | --- |
| `index.html` (home) | `mockups/animemindset/starting-point.html`, the copy of joinkaminari.com/anime-mindset | Mockup bar removed, original title restored, asset paths moved to `assets/`, "Anime Mindset" nav/footer links point here, **Coaching** added to the nav and footer |
| `coaching.html` | `mockups/coaching/kaminari-landing-b.html` (Variant B) | Logo and "Kaminari Home" go to `index.html`, quiz and newsletter buttons go to the live quiz and Substack, "Variant A" footer link removed |

Both pages carry `noindex, nofollow`.

## Still placeholders on the coaching page

Every bracketed value stays as it is: prices, dates, seat counts, testimonials, coach bios and guarantee
terms. "Claim My Seat" under the price only shows a "connect this to your real checkout flow" message; there is
no checkout.

## Open it

Open `index.html` in a browser, or serve the folder:

    npx serve animemindset-site

## Known gaps

- Header/footer links other than Anime Mindset and Coaching (About, Blog, Newsletter, quiz, Arc Tracker sign-in)
  go to the live joinkaminari.com pages.
- The Discord waitlist form posts to `/api/waitlist`, which this site doesn't have, so it won't submit here.
- The coaching page's top banner still mentions Variant A (`kaminari-landing.html`) as text.
- The mockup folders this was built from (`mockups/animemindset/`, `mockups/coaching/`) are kept unchanged as
  reference.
