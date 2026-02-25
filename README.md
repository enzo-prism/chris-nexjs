# Christopher B. Wong, DDS Website (Next.js + Vercel)

Production web app for Christopher B. Wong, DDS in Palo Alto, built on Next.js App Router with API route handlers, SEO automation, and CI quality gates.

## Architecture

- Runtime: Next.js 14 App Router
- UI: React + Tailwind + shadcn/ui primitives
- API: Next route handlers under `/app/api/*`
- Shared contracts and SEO map: `/shared/*`
- Data/repository layer: `/server/storage/*`
- Legacy compatibility: catch-all route + redirect mapping
- Deploy target: Vercel

## Repository map

- `/app`: route segments, metadata, sitemap, robots, API handlers
- `/client/src`: reusable components, pages, hooks, UI utilities
- `/server`: storage/repository and data-access utilities
- `/shared`: shared schema, redirects, SEO definitions
- `/scripts`: automated checks and test gates
- `/docs`: operations, performance, SEO, and release specs

## Quick start

1. Install dependencies.

```bash
pnpm install
```

2. Create local env file.

```bash
cp .env.example .env
```

3. Start local dev.

```bash
pnpm run dev
```

Dev port behavior:
- If `PORT` is set in `.env`, Next uses that.
- If not set, Next defaults to `3000`.

## Environment variables

Required in production:
- `DATABASE_URL` for Postgres/Neon persistence.

SEO/Search tooling:
- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console verification.

Perf/SEO script overrides:
- `SEO_AUDIT_BASE_URL` for runtime SEO audits.
- `PERF_BASE_URL` for perf smoke checks.
- `LIGHTHOUSE_BASE_URL` and `LIGHTHOUSE_RUNS` for Lighthouse gating.

## Commands

Core:
- `pnpm run dev`
- `pnpm run build`
- `pnpm run start`
- `pnpm run check`

API/route/SEO:
- `pnpm run test:api`
- `pnpm run test:routes`
- `pnpm run test:seo`
- `pnpm run test:seo:onpage`
- `pnpm run test:seo:links`
- `pnpm run test:seo:schema`
- `pnpm run test:seo:all`

Design/perf/images:
- `pnpm run test:design-system`
- `pnpm run test:images`
- `pnpm run test:bundle`
- `pnpm run build:perf`
- `pnpm run start:perf`
- `pnpm run perf:smoke`
- `pnpm run perf:lighthouse`

Aggregate release gate:
- `pnpm run test:production`

## API endpoints

- `GET /api/services`
- `GET /api/services/:slug`
- `GET /api/blog-posts`
- `GET /api/blog-posts/:slug`
- `GET /api/search`
- `POST /api/appointments`
- `POST /api/contact`
- `POST /api/newsletter`
- `GET /api/appointments`
- `GET /api/contact`

## SEO and canonical behavior

- Canonical host: `https://www.chriswongdds.com`
- Redirect mapping: `/shared/redirects.ts`
- Metadata source of truth: `/shared/seo.ts` + Next metadata API
- Sitemap: `/app/sitemap.ts`
- Robots: `/app/robots.ts`
- Canonical host redirect: `/vercel.json` + middleware behavior

## Vercel deployment

1. Connect repo to Vercel.
2. Set env vars (`DATABASE_URL`, verification/analytics values).
3. Build command: `pnpm run build`.
4. Start command: `pnpm run start`.
5. Validate preview with SEO and route checks before promoting.

## Content/style rule (important)

Doctor name format must follow one of these:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Do not combine `Dr.` and `DDS` in the same line.

## Documentation index

- Local workflow: `/Users/enzo/chris-nextjs/LOCAL_DEV.md`
- Testing matrix: `/Users/enzo/chris-nextjs/docs/testing.md`
- Deployment runbook: `/Users/enzo/chris-nextjs/docs/deployment.md`
- Performance workflow: `/Users/enzo/chris-nextjs/docs/performance.md`
- Production readiness: `/Users/enzo/chris-nextjs/docs/production-readiness-spec.md`
- SEO growth program: `/Users/enzo/chris-nextjs/docs/seo-growth-plan.md`
- SEO keyword mapping: `/Users/enzo/chris-nextjs/docs/seo-keyword-map.md`
