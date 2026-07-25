# Bug-Fix Audit Release — July 24, 2026

A full-codebase bug hunt. The starting point was a clean board: `tsc`,
`next build`, all twelve audit suites, and all 33 Playwright mobile tests
already passed. Every defect below was found by reading source and probing a
running production build, not by a failing gate — so each fix is paired with a
note on why the existing gates missed it.

## Lead-capture APIs

The scheduling and contact endpoints are the practice's revenue path; three of
these were patient-visible.

- `POST /api/schedule-request` returned `500` with the raw internal error
  string. That string reached the patient: the funnel renders the response
  `message` verbatim, so a malformed body produced *"Expected property name or
  '}' in JSON at position 1"* on screen, and an upstream inbox failure would
  have shown Formspree's response body. The raw error is now logged server-side
  and the patient gets a fixed, actionable line. `docs/api-contracts.md` already
  specified this contract — the code had drifted from its own documentation.
- A body that is not parseable JSON returned `500` on all three write
  endpoints. It is a client error; it now returns `400`.
- The schedule endpoint accepts both the current (v2) funnel payload and a
  legacy one. On any v2 validation failure it silently re-parsed the body
  against the legacy schema and reported *that* schema's errors, so a patient
  who mistyped their email was told `Required at "emergency"; Required at
  "preferredDays"; Required at "preferredTimeOfDay"` — three fields the form has
  never had. Bodies carrying a v2-only key now report v2 errors; legacy
  submissions are unaffected.
- `POST /api/newsletter` accepted any string as an email
  (`{"email":"not-an-email"}` → `201`), had no length cap, no honeypot, and a
  duplicate check that missed case variants — `Dup@Example.com` and
  `dup@example.com` both stored, because the column's `UNIQUE` index is
  case-sensitive. Fixed in the shared schema, so the client form and both server
  paths are covered at once.

*Why the gates missed it:* `test:api` mocks outbound vendors and asserts the
happy path plus schema rejection. It never asserts a status code for a malformed
body, and never inspects the text of an error message — which is precisely where
these lived.

## Structured data

- The `Person` schema's `memberOf` listed *"University of the Pacific Arthur A.
  Dugoni School of Dentistry Graduate"* as an `Organization`. That names an
  entity which does not exist and duplicates the school already correctly
  expressed in `alumniOf`. Root cause: `doctorInfo.credentials` is About-page
  display copy, reused as schema values without checking the relationship the
  property asserts.
- `specialOpeningHoursSpecification` serialized as an empty array once every
  temporary-hours entry expired. The property is now omitted.

*Why the gates missed it:* `test:seo:schema` validates that required properties
are present and well-formed. Both defects are well-formed JSON-LD asserting
something untrue.

## Social share images

Every `og:image` was a 2.4–4.2 MB PNG, and several were WebP. `og:image`
bypasses `next/image` entirely — the URL in the meta tag is what Facebook,
LinkedIn, Slack, iMessage, and WhatsApp fetch — so both problems reached the
crawler: multi-megabyte payloads on every unfurl, and, for the WebP entries, no
image at all on X/Twitter and LinkedIn, which do not render that format.

Added `scripts/generate-og-images.mjs` (`pnpm run og:generate`), which emits
1200x675 progressive JPEGs into `public/images/og/`. Worst case went from
**4.2 MB to 163 KB**. See `docs/seo-technical-architecture.md`.

*Why the gates missed it:* `test:images` audits on-page image responses.
`og:image` is a meta tag, not a rendered image, so it was outside the audit's
scope entirely.

## A test that asserted nothing

`tests/mobile/overflow.spec.ts` listed `/dentist-palo-alto` — a route this site
has never had. The 404 page renders a `main` element, has exactly one `h1`, and
does not overflow, so the case passed on every run while testing a page that did
not exist.

The fix is in the helper rather than the spec: `gotoAndHydrate` now asserts a
`200` before anything else, so any spec naming a dead route fails loudly instead
of quietly measuring the 404 page. Verified by re-adding the dead route and
confirming it fails.

**When adding a route to any spec list, that guard is what proves the route is
real.** A soft assertion against a page that renders for every URL is not a
test.

## Latent

- The appointment form validated its payload against the wire schema with
  `parse()` outside the `try`. A drift between the form schema and the wire
  schema would have thrown an unhandled rejection, leaving the submit button
  spinning with nothing on screen. Now `safeParse` into the existing error panel.

## Known issues, deliberately not fixed here

- **`NewsletterForm` is mounted on no page.** The endpoint is live and writes to
  storage, and the README lists newsletter as current scope, but nothing renders
  the form. Wiring it in (the footer is the natural home) is a product decision,
  not a bug fix. Both sides were hardened regardless.
- **`sitemap.xml` is a full `urlset`, not a sitemap index**, so it duplicates
  every URL in the segment sitemaps that `robots.txt` submits alongside it, with
  disagreeing `lastmod` formats. The right shape is a `sitemapindex`, but it
  changes what `test:seo` and `test:seo:freshness` read.
- **No Content-Security-Policy header.** The other security headers (HSTS,
  `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`) are in place and correct. CSP needs care around the
  inline gtag bootstrap.
- **`GET /api/search` caches unbounded query strings** at the edge under a
  public `s-maxage`, so each distinct query is its own CDN cache key.

## Release gates

All green at the time of release:

```bash
pnpm run test:production
pnpm run test:gallery
pnpm run test:reviews
pnpm run test:mobile
```

After deployment, confirm the production commit SHA, canonical redirects,
security headers, and live runtime SEO checks. Re-validate the share cards with
Facebook's Sharing Debugger and LinkedIn's Post Inspector, both of which cache
aggressively and need a manual re-scrape to pick up the new images. Do not
submit a real or fake patient lead as a deployment smoke test.
