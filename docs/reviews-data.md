# Review Data Runbook

Operational guide for importing, auditing, and publishing Google review content used on the website.

## Source of truth

- Raw export file: `attached_assets/google-reviews-export-319.txt`
- Import script: `scripts/import-google-reviews.ts`
- Generated dataset: `shared/googleReviewsData.ts`
- Public testimonial seed source: `shared/testimonialsData.ts`
- Client-featured subset: `client/src/data/featuredTestimonials.ts`

`shared/testimonialsData.ts` now maps directly to `googleReviewSeedData`, so imported review data is the primary source for testimonial fallback rendering.

## Current data profile (2026-03-04 snapshot)

- Total reviews: `319`
- Rating distribution:
  - `5-star`: `308`
  - `4-star`: `7`
  - `3-star`: `0`
  - `2-star`: `0`
  - `1-star`: `4`
- Reviews with no text in source (`[No text]`): `113`
  - Converted during import to: `Left a X-star Google review with no additional comment.`
- Reviews with truncated excerpt marker: `68`
  - Normalized to clean ellipsis output (`...`) for display consistency

## Website rendering behavior

- `/testimonials` keeps all imported reviews available, but renders them in batched pagination (`24` at a time) to avoid initial page bloat.
- `/api/testimonials` enforces a minimum dataset floor:
  - if storage returns fewer rows than the imported seed count, it serves the full imported seed set.
- Client pages consume testimonials via API to avoid shipping the entire 319-review seed bundle to the browser.
- Structured review schema is intentionally capped via `buildReviewSchemas(..., limit = 8)` to avoid over-large JSON-LD payloads.

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
```

## Guardrails

- Keep all star ratings represented (do not selectively remove low ratings).
- Do not manually hand-edit `shared/googleReviewsData.ts`; regenerate from source export instead.
- If parsing drops unexpectedly below `300` reviews, treat it as a format break and inspect the source export structure before release.
