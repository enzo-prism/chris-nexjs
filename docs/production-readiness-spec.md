# Production Readiness Spec (Next.js + Vercel)

## Scope
This spec defines what "production ready" means for this repository and how readiness is enforced with repeatable tests.

## Product Goals
- Preserve route and API behavior from the legacy stack while running fully on Next.js App Router.
- Keep SEO correctness for indexable pages and noindex pages.
- Standardize shared UI interaction patterns on shadcn/ui primitives.
- Keep performance and safety guardrails measurable in CI/local runs.

## Success Criteria
### 1) Routing and redirect compatibility
- Every canonical path in `shared/seo.ts` returns valid metadata (title, description, canonical URL).
- Legacy aliases resolve correctly (`/about-us`, `/dr-chris-wong`, `/post/*`, `/services/*`).
- Dynamic blog canonical URLs resolve from seeded data.

Pass gate:
- `pnpm run test:routes`

### 2) API contract stability
- Existing API endpoints preserve status and validation semantics.
- Error contracts remain stable for invalid payloads and missing slugs.

Pass gate:
- `pnpm run test:api`

### 3) SEO and crawlability correctness
- Sitemap and robots remain aligned with indexable/noindex definitions.
- Indexable routes remain indexable in metadata.
- Noindex routes do not leak into sitemap.

Pass gate:
- `pnpm run test:seo`

### 4) Design-system consistency (shared UI)
- Shared interactive components in `client/src/components/{common,forms,layout,sections}` must use shadcn primitives instead of raw `<button>`, `<input>`, `<select>`, `<textarea>`.
- Prevents drift and ensures consistent focus/ring/disabled behavior.

Pass gate:
- `pnpm run test:design-system`

### 5) Image reliability
- Every locally referenced image path in source resolves to an asset in `public/`.
- Runtime image URLs rendered across canonical routes and blog pages return valid image responses (no 404/HTML fallbacks).

Pass gate:
- `pnpm run test:images`

### 6) Type/build/security baseline
- TypeScript checks and business-info safety checks pass.
- Next production build completes.
- Bundle budget stays within configured route thresholds.

Pass gate:
- `pnpm run check`
- `pnpm run build`
- `pnpm run test:bundle`

### 7) Performance benchmark reliability
- Dedicated perf build output is used for repeatable local/CI measurements.
- Core route health checks pass before Lighthouse execution.
- Lighthouse budget checks pass against preview/local perf server.

Pass gate:
- `pnpm run build:perf`
- `pnpm run perf:smoke`
- `pnpm run perf:lighthouse`

### 8) Production gate (aggregate)
- All required gates pass in sequence.

Pass gate:
- `pnpm run test:production`

## Test Suite Map
- `scripts/api-contract.test.ts`: API response/status contract.
- `scripts/seo-regression.ts`: sitemap/robots/metadata regression.
- `scripts/route-contract.test.ts`: route metadata and redirect matrix contract.
- `scripts/design-system.test.ts`: shadcn shared UI compliance guard.
- `scripts/image-audit.test.ts`: source + runtime image integrity audit.
- `scripts/check-business-info.ts`: PII/business-info leak prevention.
- `scripts/bundle-budget.test.mjs`: app route JavaScript budget guard.
- `scripts/perf-smoke.mjs`: pre-Lighthouse route health guard.

## Operational Recommendations
- Run `pnpm run test:production` before every push to `main`.
- Run `LIGHTHOUSE_BASE_URL=<preview-or-prod-url> pnpm run check:lighthouse-budget` before release promotion.
- Keep `vercel.json`, `shared/redirects.ts`, and `shared/seo.ts` synchronized when introducing routes.

## External References Used
- [Next.js App Router migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js metadata file conventions (robots/sitemap)](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Vercel redirects configuration](https://vercel.com/docs/redirects)
- [shadcn/ui docs](https://ui.shadcn.com/docs)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Core Web Vitals guidance](https://web.dev/articles/vitals)
