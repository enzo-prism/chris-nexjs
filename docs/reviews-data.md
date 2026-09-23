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
- Homepage spotlight carousel (`client/src/pages/Home.tsx`) uses:
  - width-aware slide-track translation (`translateX(active * 100 / count)`) to keep arrow navigation aligned with single-card increments
  - pointer swipe detection (45px horizontal threshold, vertical-swipe rejection) for mobile and trackpad/mouse drags
  - no-comment review suppression via `isNoAdditionalCommentPlaceholder(...)`

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
   both counts in `shared/reviewStats.ts`.
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
