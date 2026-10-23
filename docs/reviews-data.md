# Review Data Runbook

Operational guide for importing, auditing, and publishing review content used on the website (Google reviews via the import pipeline, plus hand-curated Yelp reviews).

## Source of truth

- Raw Google export file: `attached_assets/google-reviews-export-320.txt`
- Google import script: `scripts/import-google-reviews.ts`
- Generated Google dataset: `shared/googleReviewsData.ts` (machine-generated — do not hand-edit; `test:reviews` asserts it matches the export)
- Hand-curated Yelp dataset: `shared/yelpReviewsData.ts`
- Published review counts: `shared/reviewStats.ts` (`GOOGLE_REVIEW_COUNT`, `PUBLISHED_REVIEW_COUNT`, and `REVIEW_STATS_LAST_UPDATED`)
- Live Google totals (optional): `shared/googlePlaceReviews.ts` + `server/googlePlaceReviews.ts`. Requires `GOOGLE_PLACES_API_KEY`. The public Place ID already lives on `officeInfo.googlePlaceId` and can be overridden with `GOOGLE_PLACE_ID`.
- Public testimonial seed source: `shared/testimonialsData.ts`
- Client-featured subset: `client/src/data/featuredTestimonials.ts`
- Site quotes: `client/src/data/reviewHighlights.ts` (homepage), `serviceReviews.ts` (service/location pages), `team.ts` (team cards); all verbatim-checked by `pnpm run test:reviews`

`shared/testimonialsData.ts` merges the Yelp seed (`yelpReviewSeedData`, listed first so it surfaces on page 1 of `/testimonials`) with the generated Google seed (`googleReviewSeedData`) and publishes only 5-star entries. The Google export remains the source of truth for the Google pipeline (count/audit); Yelp reviews are maintained by hand.

## Live updates

The visible Google count does **not** refresh by itself. There is no Places API
key in this repo or `.env.example` by default. Counts stay on the committed
literals in `shared/reviewStats.ts` (`REVIEW_STATS_LAST_UPDATED`) until someone:

1. Re-imports the Google export (see Refresh workflow), or
2. Sets `GOOGLE_PLACES_API_KEY` (and optionally `GOOGLE_PLACE_ID`) on the
   server. `/testimonials` then fetches `rating` + `userRatingCount` with a
   ~daily ISR revalidate and falls back to the last committed values on any
   error — never 0 or blank.

Do not create or bill a key from this change. Self-serving `aggregateRating`
JSON-LD is still not emitted; if that ever changes, use
`displayedAggregateRating()` so schema matches the number on the page.

## Current data profile (2026-09-23 published snapshot)

- Raw imported Google review export count: `393`
- Published Google 5-star reviews (`GOOGLE_REVIEW_COUNT`): `382`
- Hand-curated Yelp reviews: `10`
- Total published testimonial count on the website (`PUBLISHED_REVIEW_COUNT`): `392`
- Published testimonial rating policy:
  - `5-star`: `392` (382 Google + 10 Yelp)
  - non-5-star reviews are retained in the raw import history but excluded from public testimonial rendering
- 5-star reviews with no text in source still use the normalized placeholder sentence internally for transport consistency.
  - UI rendering suppresses that placeholder sentence and shows rating + reviewer metadata only.
- Most recent backfill: 2026-09-23 added the 33 reviews (all 5-star, 3 rating-only)
  received Aug 5 – Sep 23, 2026.

## Website rendering behavior

- `/testimonials` renders the full published 5-star review set in batched pagination (`24` at a time) to avoid initial page bloat.
- `/api/testimonials` enforces a minimum dataset floor:
  - if storage returns fewer rows than the published 5-star seed count, it serves the full published seed set.
- Client pages consume testimonials via API to avoid shipping the entire review seed bundle to the browser.
- Self-serving `Review` and `aggregateRating` JSON-LD are intentionally not emitted. Visible reviews remain source-labelled conversion content.
- Review counts split by visible surface: Google-branded surfaces use `GOOGLE_REVIEW_COUNT` (382), while the `/testimonials` total uses `PUBLISHED_REVIEW_COUNT` (392). Never use the raw import total. A build-time guard in `shared/testimonialsData.ts` throws if the published count drifts from `PUBLISHED_REVIEW_COUNT`, so bump it when adding reviews.
- The homepage no longer has a review carousel. `PatientProofSection` shows three
  static quotes from `client/src/data/reviewHighlights.ts`, `serviceReviews.ts`, and `team.ts`. `pnpm run test:reviews`
  (`scripts/homepage-proof.test.ts`) requires each to be a verbatim excerpt of a
  5-star review by the named reviewer in `shared/googleReviewsData.ts`, so
  update both together if a review is ever removed.
- `client/src/data/featuredTestimonials.ts` is a curated Google-only subset that
  seeds `client/src/lib/testimonials.ts` collections (e.g. the `/schedule`
  funnel testimonials).

## Refresh workflow

New reviews usually arrive as Google Business Profile notification emails
(`businessprofile-noreply@google.com`, subjects "<Name> left a review for
Christopher B. Wong, DDS" and "Christopher B. Wong, DDS, you got N new
reviews"). Digest emails list reviewers who never get a single-review email,
so read every digest. The emails show Google's own truncation; keep it.

1. Update `attached_assets/google-reviews-export-320.txt` (the filename is
   historical). Either replace it with a full export, or prepend new blocks
   newest-first in the existing format: continue the `Review #` numbering,
   bump the header count, use the Pacific-time notification date, and write
   `[No text]` for rating-only reviews and `<excerpt>... [truncated]` for cut-off
   text. Then bump `expectedCount` in `scripts/import-google-reviews.ts` and
   both counts plus `REVIEW_STATS_LAST_UPDATED` in `shared/reviewStats.ts`.
2. Regenerate `shared/googleReviewsData.ts`:

```bash
pnpm run reviews:import
```

3. Audit generated data:

```bash
pnpm run reviews:audit
pnpm run test:reviews
```

4. Run standard gates before release:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:reviews
```

## Guardrails

- The website’s published testimonial surface is intentionally 5-star only.
- Do not hand-edit the rating filter in multiple places; keep it centralized around `shared/testimonialsData.ts`.
- Do not manually hand-edit `shared/googleReviewsData.ts`; regenerate from source export instead.
- Do not reintroduce review or aggregate-rating schema for the practice's own Dentist/LocalBusiness entity.
- If parsing drops unexpectedly below `300` reviews, treat it as a format break and inspect the source export structure before release.
