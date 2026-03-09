# Review Data Runbook

Operational guide for importing, auditing, and publishing Google review content used on the website.

## Source of truth

- Raw export file: `attached_assets/google-reviews-export-319.txt`
- Import script: `scripts/import-google-reviews.ts`
- Generated dataset: `shared/googleReviewsData.ts`
- Public testimonial seed source: `shared/testimonialsData.ts`
- Client-featured subset: `client/src/data/featuredTestimonials.ts`

`shared/testimonialsData.ts` now maps directly to the imported Google review data, but publishes only 5-star entries. Imported review data remains the source of truth for testimonial fallback rendering and counts.

## Current data profile (2026-03-09 published snapshot)

- Raw imported Google review export count: `319`
- Published testimonial count on the website: `308`
- Published testimonial rating policy:
  - `5-star`: `308`
  - non-5-star reviews are retained in the raw import history but excluded from public testimonial rendering
- 5-star reviews with no text in source still use the normalized placeholder sentence internally for transport consistency.
  - UI rendering suppresses that placeholder sentence and shows rating + reviewer metadata only.

## Website rendering behavior

- `/testimonials` renders the full published 5-star review set in batched pagination (`24` at a time) to avoid initial page bloat.
- `/api/testimonials` enforces a minimum dataset floor:
  - if storage returns fewer rows than the published 5-star seed count, it serves the full published seed set.
- Client pages consume testimonials via API to avoid shipping the entire review seed bundle to the browser.
- Structured review schema is intentionally capped via `buildReviewSchemas(..., limit = 8)` to avoid over-large JSON-LD payloads.
- Homepage review/count badges should use the published 5-star count, not the raw import total.
- Homepage spotlight carousel (`client/src/pages/Home.tsx`) uses:
  - width-aware slide-track translation (`translateX(active * 100 / count)`) to keep arrow navigation aligned with single-card increments
  - pointer swipe detection (45px horizontal threshold, vertical-swipe rejection) for mobile and trackpad/mouse drags
  - no-comment review suppression via `isNoAdditionalCommentPlaceholder(...)`

## Refresh workflow

1. Replace `attached_assets/google-reviews-export-319.txt` with the latest export text.
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
