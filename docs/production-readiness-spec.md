# Production Readiness Spec (Next.js + Vercel)

Release quality standard for this repository.

## Core release objectives

- Preserve route and API compatibility.
- Keep metadata, canonical behavior, and crawlability correct.
- Maintain design-system consistency and media integrity.
- Protect runtime performance on primary marketing routes.
- Keep operational runbooks accurate with the current implementation.

## Readiness criteria and gates

### 1. Routing and redirect integrity

Must pass:
- canonical routes return expected metadata and canonical URL
- legacy aliases map correctly
- dynamic blog metadata works for seeded slugs

Gate:
- `pnpm run test:routes`

### 2. API contract stability

Must pass:
- endpoint status code behavior remains stable
- validation and error semantics remain stable
- read and write handlers for lead flows are operational

Gate:
- `pnpm run test:api`

### 3. Gallery/media contract stability

Must pass:
- media inventory is valid
- no duplicate IDs/URLs
- all media URLs are HTTPS
- required metadata fields exist for accessibility and SEO

Gate:
- `pnpm run test:gallery`

### 4. SEO integrity

Must pass:
- sitemap and robots align with `shared/seo.ts`
- indexable pages remain indexable
- noindex routes remain excluded from sitemap

Gates:
- `pnpm run test:seo`
- `pnpm run test:seo:onpage`
- `pnpm run test:seo:links`
- `pnpm run test:seo:schema`

### 5. Design-system and UI guardrails

Must pass:
- shared component layers keep design-system consistency

Gate:
- `pnpm run test:design-system`

### 6. Image/runtime media integrity

Must pass:
- source image references resolve
- runtime image URLs respond correctly
- key page image budgets remain within thresholds

Gate:
- `pnpm run test:images`

### 7. Type and safety baseline

Must pass:
- TypeScript compiles
- business-info hardcoding guard passes
- production build succeeds

Gates:
- `pnpm run check`
- `pnpm run build`

### 8. Performance baseline

Must pass:
- perf build starts correctly
- bundle budgets pass
- perf smoke route health passes
- Lighthouse budget passes

Gates:
- `pnpm run build:perf`
- `pnpm run test:bundle`
- `pnpm run perf:smoke`
- `pnpm run perf:lighthouse`

### 9. Convenience aggregate gate

Current script coverage:
- `pnpm run test:production`

Note:
- `test:production` is a convenience gate and does not replace full perf/build verification.

## Recommended release command sequence

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:gallery
pnpm run test:design-system
pnpm run test:images
pnpm run test:seo:all
pnpm run build
pnpm run build:perf
NEXT_DIST_DIR=.next-perf pnpm run test:bundle
```

Start perf server in a separate terminal:

```bash
PORT=3101 pnpm run start:perf
```

Then run:

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## Editorial consistency rule

Doctor name format must be one of:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Never combine `Dr.` and `DDS` in the same line.

## Operational sync requirement

Keep route and canonical configuration aligned across:
- `shared/seo.ts`
- `shared/redirects.ts`
- `middleware.ts`
- `vercel.json`
