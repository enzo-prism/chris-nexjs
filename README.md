# Christopher B. Wong, DDS Website (Next.js + Vercel)

Production website for Christopher B. Wong, DDS in Palo Alto.  
The app runs on Next.js App Router with API route handlers, centralized SEO metadata, automated quality gates, and Vercel deployment.

## Current product scope

- Marketing pages, location pages, services, and blog content.
- Interactive lead flows: appointment request, contact form, newsletter.
- No production chat widget or `/api/chat` endpoint in current launch scope.
- `/gallery` media showcase with hero video, click-to-play clips, and fullscreen lightbox.
- `/changelog` page that merges update history from current and legacy repositories.

## Architecture at a glance

- Runtime: Next.js 14 App Router.
- UI stack: React 18, TypeScript, Tailwind, shadcn/ui primitives.
- Routing strategy:
  - explicit App Router pages for canonical public URLs
  - catch-all route reserved for legacy compatibility fallback (`app/[...slug]/page.tsx`)
- API layer: Next route handlers under `app/api/*`.
- Data layer: repository pattern under `server/storage/*`.
- Storage mode:
  - Uses Neon/Postgres when `DATABASE_URL` is set.
  - Falls back to in-memory storage when DB is unavailable.
- SEO source of truth: `shared/seo.ts`, `shared/redirects.ts`, Next metadata APIs.
- Deployment target: Vercel.

## Repository map

- `app/`: route segments, metadata, sitemap, robots, API handlers.
- `client/src/`: page components, UI components, hooks, and data modules.
- `server/`: storage contract + DB/memory implementations.
- `shared/`: schemas, redirects, office info, SEO definitions.
- `scripts/`: test gates and operational audit scripts.
- `docs/`: runbooks, quality specs, SEO/perf plans, feature docs.

## Deployment topology

- Repository of record: `enzo-prism/chris-nexjs` on `main`.
- Primary public production:
  - Vercel project: `chris-wong-dds`
  - Domains: `https://www.chriswongdds.com`, `https://chriswongdds.com`
- Secondary production mirror:
  - Vercel project: `chris-nextjs`
  - Domain: `https://chris-nextjs.vercel.app`
- Legacy production mirror:
  - Vercel project: `chriswongdds`
  - Domain: `https://chriswongdds.vercel.app`

Release default:

- Link and deploy to `chris-wong-dds` for public production pushes.
- Use mirror deployments only when explicit cross-project sync is required.

## Quick start

1. Install dependencies.

```bash
pnpm install
```

2. Create local environment file.

```bash
cp .env.example .env
```

3. Start development server.

```bash
pnpm run dev
```

Port behavior:
- `.env.example` sets `PORT=5000`, so local dev will run on `http://localhost:5000` unless changed.
- If `PORT` is removed, Next defaults to `3000`.

## Environment variables

Core:
- `DATABASE_URL` (required for Postgres/Neon mode).

Metadata/SEO:
- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (defaults to `G-94WRBJY51J` when not set).

Lead forms / scheduling:
- `NEXT_PUBLIC_FORM_ENDPOINT` and `SCHEDULE_FORM_ENDPOINT` for Formspree-backed scheduling.

Script URL overrides:
- `SEO_AUDIT_BASE_URL` for runtime SEO scripts.
- `IMAGE_AUDIT_BASE_URL` for image runtime audit.
- `PERF_BASE_URL` for perf smoke.
- `LIGHTHOUSE_BASE_URL`, `LIGHTHOUSE_RUNS`, `LIGHTHOUSE_SKIP_PRECHECK` for Lighthouse runs.

Changelog generation:
- `CHANGELOG_REPOS` to override default repo/branch sources.
- `CHANGELOG_LIMIT` to cap entries.
- `CHANGELOG_OUTPUT` to customize output path.

## Commands

Core:
- `pnpm run dev`
- `pnpm run build`
- `pnpm run start`
- `pnpm run check`

Contract and quality checks:
- `pnpm run test:api`
- `pnpm run test:routes`
- `pnpm run test:design-system`
- `pnpm run test:images`
- `pnpm run test:gallery`

SEO checks:
- `pnpm run test:seo`
- `pnpm run test:seo:onpage`
- `pnpm run test:seo:links`
- `pnpm run test:seo:schema`
- `pnpm run test:seo:all`

Performance checks:
- `pnpm run build:perf`
- `pnpm run start:perf`
- `pnpm run perf:smoke`
- `pnpm run test:bundle`
- `pnpm run perf:lighthouse`

Release convenience gate:
- `pnpm run test:production`
  - runs `check`, `test:bundle`, `test:api`, `test:routes`, `test:design-system`, `build`
  - starts `next start`, then runs runtime `test:images` and `test:seo:all`
  - default runtime URL is `http://localhost:3000` (override with `PRODUCTION_TEST_PORT` or `PRODUCTION_TEST_BASE_URL`)

Utility:
- `pnpm run changelog:generate`

## API surface

Read endpoints:
- `GET /api/services`
- `GET /api/services/:slug`
- `GET /api/blog-posts`
- `GET /api/blog-posts?service=<service-slug>`
- `GET /api/blog-posts/:slug`
- `GET /api/testimonials`
- `GET /api/search?query=<term>`
- `GET /api/appointments`
- `GET /api/contact`
- `GET /rss.xml`
- `GET /api/rss.xml`

Write endpoints:
- `POST /api/appointments`
- `POST /api/contact`
- `POST /api/newsletter`
- `POST /api/schedule-request`

## SEO and canonical behavior

- Canonical host: `https://www.chriswongdds.com`.
- Canonical host redirect:
  - Host redirect in `vercel.json`.
  - Legacy + protocol/canonical handling in `middleware.ts`.
- Metadata source:
  - `shared/seo.ts`
  - `app/[...slug]/page.tsx` `generateMetadata`
  - `app/layout.tsx` global metadata
- SEO files:
  - `app/sitemap.ts`
  - `app/robots.ts`
  - `app/rss.xml/route.ts` (canonical feed route)
- Current SEO map totals:
  - 44 total canonical definitions
  - 40 indexable
  - 4 noindex (`/zoom-whitening/schedule`, `/thank-you`, `/analytics`, `/ga-test`)

## Analytics behavior (GA4)

- Google tag is installed globally from root layout head for all routes.
- Measurement ID defaults to `G-94WRBJY51J` and can be overridden by `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- SPA page-view events are sent on route transitions via `client/src/components/common/GoogleAnalytics.tsx`.
- Consent Mode v2 defaults:
  - granted outside EEA/UK
  - denied for EEA/UK regions until consent is granted
- Consent choices can be updated from the in-app banner (`Accept Analytics` / `Decline`) and are applied through `window.setAnalyticsConsent(...)`.
- Consent state is persisted in `localStorage` under `analytics_consent`.

## Naming rule (editorial and compliance)

Doctor name format must be one of:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Never combine `Dr.` and `DDS` in the same line.

## Documentation index

- Local development: `/Users/enzo/chris-nextjs/LOCAL_DEV.md`
- Deployment runbook: `/Users/enzo/chris-nextjs/docs/deployment.md`
- Testing guide: `/Users/enzo/chris-nextjs/docs/testing.md`
- Performance workflow: `/Users/enzo/chris-nextjs/docs/performance.md`
- Production readiness spec: `/Users/enzo/chris-nextjs/docs/production-readiness-spec.md`
- SEO growth plan: `/Users/enzo/chris-nextjs/docs/seo-growth-plan.md`
- SEO keyword map: `/Users/enzo/chris-nextjs/docs/seo-keyword-map.md`
- Gallery feature guide: `/Users/enzo/chris-nextjs/docs/gallery.md`
- Changelog operations guide: `/Users/enzo/chris-nextjs/docs/changelog.md`
