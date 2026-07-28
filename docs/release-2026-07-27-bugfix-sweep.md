# Bug-Fix Sweep — July 27, 2026

A three-track review (lead-capture backend, client UX from the recent
conversion/navigation refresh, SEO/structured data) of the codebase as of
`0e685d8`, shipped as commit `68b9461`. As with the July 24 audit, the starting
point was a clean board — every gate and all 33 Playwright mobile tests passed —
so each fix below notes why the gates missed it.

## Lead-capture APIs

- `POST /api/newsletter` reported success after only a storage write. On
  serverless, storage without `DATABASE_URL` is a per-lambda in-memory fallback,
  so a signup could return `201`, fire the conversion event, and vanish when the
  instance recycled — the same "success but the lead is dropped" failure the
  contact form fixed in June. The route now posts to the Formspree office inbox
  (`form_key: "newsletter_signup"`) before reporting success; the duplicate
  check and DB write are best-effort, and both the duplicate-check and delivery
  failure paths now log.
- The legacy schedule payload allows 1–5 `preferredDays` but the v2 schema caps
  the field at 3, and the legacy→v2 conversion re-parses through the v2 schema.
  A legacy client (an old cached bundle — the only reason the path exists)
  submitting 4 or 5 days passed legacy validation and then got a `400` from the
  conversion itself, losing the lead. The conversion now trims to the first
  three days instead of rejecting.

*Why the gates missed it:* `test:api` mocks storage and vendors, so an
in-memory write looks identical to a durable one, and its legacy fixtures never
pick more than three days.

## Dead navigation on dedicated Next routes

The site renders pages two ways: the legacy catch-all shell mounts a full
wouter `<Switch>`, but dedicated App Router routes (`/contact`, `/thank-you`,
…) render a fixed page component with **no** wouter route table. A wouter
`<Link>` on one of those pages calls `preventDefault()` and `pushState`, so the
URL and header state update but the page content never swaps.

The July UX refresh added two such links to `ContactForm` (privacy policy,
HIPAA notice), and `Contact.tsx` / `ThankYou.tsx` carried older ones
("Request an appointment", service cards, back-to-home). All now use
`next/link`, which works in both shells. The same latent pattern remains in the
`Dentist*.tsx` city pages, deliberately untouched: middleware 301s those URLs,
so the components are unreachable.

*Why the gates missed it:* the Playwright CTA specs assert `toHaveURL`, which
passes even when the content never swaps.

## Social share images

- Blog posts with generated `.webp` art (six posts) emitted that WebP as both
  `og:image` and `twitter:image` — and WebP cards are silently dropped by
  X/Twitter and LinkedIn. Root cause worth remembering: **config metadata from
  `generateMetadata` takes precedence over the file-based `opengraph-image.tsx`
  convention**, so the PNG title-card route existed but never won. Both tags on
  every post now point at `/blog/<slug>/opengraph-image` explicitly.
- `/patient-stories` was the one page the July 24 og:image fix missed: its
  `ogImage` was a remote Cloudinary WebP, which `og:generate` skips by design.
  It now uses a local JPEG derivative (`/images/og/patient-stories.jpg`,
  500x375 — faithful to the Cloudinary original, which is only that large).
- Residual share/schema fallbacks (`app/[...slug]/page.tsx`, the Dentist schema
  `image`, `Contact.tsx` `schemaImage`) still referenced the 1.6 MB
  `dr_wong_polaroids.png`; all now use the 29 KB `/images/og/` JPEG.

*Why the gates missed it:* `test:seo:onpage` checks that `og:image` resolves,
not what format the crawlers will accept; the July 24 sweep fixed the
`shared/seo.ts` literals the generator could see and the blog/remote paths
lived elsewhere.

## Structured data

The legacy shell (`App.tsx`) still published the Dentist schema with a
5.0/319 `aggregateRating` built from Google+Yelp reviews on every route, while
`AppPageShell` had already dropped the rating in the July security pass —
two divergent schemas under the same `@id`
(`…/#organization`), one of them asserting a rating Google's guidelines
disallow (aggregates copied from third-party platforms). The legacy shell now
matches, and the stale comments in `shared/reviewStats.ts` that still claimed
the count "drives the aggregateRating" are corrected.

*Why the gates missed it:* `test:seo:schema` validates well-formedness, and the
two shells never render on the same page, so the divergence never collided in
one document.

## Mobile

The UX refresh grew the mobile action bar items from `3.25rem` to `min-h-14`
(3.5rem) and added a top border, but the under-footer spacer that reserves
space for the fixed bar stayed at `3.25rem` — so the bar covered the last ~5px
of the footer at full scroll. The spacer now matches at `3.5rem`.

*Why the gates missed it:* the touch-target spec asserts the bar's links are
tall enough, not that the bar clears the footer.

## Verification

`pnpm run check`, all twelve audit suites (`test:images` and the server-side
SEO audits against a local `next start`), `test:bundle`, the mobile-UX source
guards, and the full 33-test Playwright mobile suite pass. Fixed metadata,
endpoints, and share routes were re-verified against production after deploy.

## Known issues left open on purpose

- `NewsletterForm` is still not mounted on any page; the endpoint now delivers
  durably, but wiring the form into a surface (or retiring the endpoint) is
  still owed.
- The newsletter duplicate check only dedupes within a single lambda instance
  when running on memory storage. Harmless: Formspree receives every signup
  either way, and a Postgres deployment restores real dedupe via the unique
  index.
- `Dentist*.tsx` components still import wouter `Link` (unreachable, see
  above).
