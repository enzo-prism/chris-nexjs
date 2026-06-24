# Review Data Runbook

Operational guide for importing, auditing, and publishing review content used on the website (Google reviews via the import pipeline, plus hand-curated Yelp reviews).

## Source of truth

- Raw Google export file: `attached_assets/google-reviews-export-320.txt`
- Google import script: `scripts/import-google-reviews.ts`
- Generated Google dataset: `shared/googleReviewsData.ts` (machine-generated — do not hand-edit; `test:reviews` asserts it matches the export)
- Hand-curated Yelp dataset: `shared/yelpReviewsData.ts`
- Published review counts: `shared/reviewStats.ts` (`GOOGLE_REVIEW_COUNT` and `PUBLISHED_REVIEW_COUNT`)
- Public testimonial seed source: `shared/testimonialsData.ts`
- Client-featured subset: `client/src/data/featuredTestimonials.ts`

`shared/testimonialsData.ts` merges the Yelp seed (`yelpReviewSeedData`, listed first so it surfaces on page 1 of `/testimonials`) with the generated Google seed (`googleReviewSeedData`) and publishes only 5-star entries. The Google export remains the source of truth for the Google pipeline (count/audit); Yelp reviews are maintained by hand.

## Current data profile (2026-06-23 published snapshot)

- Raw imported Google review export count: `320`
- Published Google 5-star reviews (`GOOGLE_REVIEW_COUNT`): `309`
- Hand-curated Yelp reviews: `10`
- Total published testimonial count on the website (`PUBLISHED_REVIEW_COUNT`): `319`
- Published testimonial rating policy:
  - `5-star`: `319` (309 Google + 10 Yelp)
  - non-5-star reviews are retained in the raw import history but excluded from public testimonial rendering
- 5-star reviews with no text in source still use the normalized placeholder sentence internally for transport consistency.
  - UI rendering suppresses that placeholder sentence and shows rating + reviewer metadata only.

## Website rendering behavior

- `/testimonials` renders the full published 5-star review set in batched pagination (`24` at a time) to avoid initial page bloat.
- `/api/testimonials` enforces a minimum dataset floor:
  - if storage returns fewer rows than the published 5-star seed count, it serves the full published seed set.
- Client pages consume testimonials via API to avoid shipping the entire review seed bundle to the browser.
- Structured review schema is intentionally capped via `buildReviewSchemas(..., limit = 8)` to avoid over-large JSON-LD payloads.
- Review counts split by surface: Google-branded surfaces (hero badge, Google reviews widget) use `GOOGLE_REVIEW_COUNT` (309); the Dentist-schema `aggregateRating` and the `/testimonials` total use `PUBLISHED_REVIEW_COUNT` (319). Never use the raw import total. A build-time guard in `shared/testimonialsData.ts` throws if the published count drifts from `PUBLISHED_REVIEW_COUNT`, so bump it when adding reviews.
- Homepage spotlight carousel (`client/src/pages/Home.tsx`) uses:
  - width-aware slide-track translation (`translateX(active * 100 / count)`) to keep arrow navigation aligned with single-card increments
  - pointer swipe detection (45px horizontal threshold, vertical-swipe rejection) for mobile and trackpad/mouse drags
  - no-comment review suppression via `isNoAdditionalCommentPlaceholder(...)`

## Refresh workflow

1. Replace `attached_assets/google-reviews-export-320.txt` with the latest export text.
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
- If parsing drops unexpectedly below `300` reviews, treat it as a format break and inspect the source export structure before release.
