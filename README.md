# Chris Wong DDS Website (Next.js Migration)

This repository is the Next.js + Vercel rebuild of the Dr. Christopher Wong dental practice website, migrated from the previous Vite + Express architecture.

## Current architecture (in-flight migration)

- **Frontend**: Next.js App Router in `app/`
- **UI + existing React components**: `client/src/`
- **API routes**: Next.js route handlers in `app/api/*`
- **Shared types/contracts**: `shared/`
- **Storage abstraction**: `server/storage/*` with Drizzle-compatible repository entrypoint
- **Canonical redirects**: handled in `middleware.ts` + `vercel.json`
- **SEO**: generated metadata + `app/sitemap.ts` and `app/robots.ts`

## Route strategy

The migration uses two layers:

1. **Explicit routes** (high-traffic, SEO-critical paths) render through a unified page shell and dedicated page components.
2. A **catch-all route** (`app/[...slug]/page.tsx`) covers legacy/long-tail paths and dynamic blog/article handling while preserving compatibility.

### Route surface implemented

See the following canonical paths from `shared/seo.ts` now implemented with explicit `app/<path>/page.tsx` files:

- `/`, `/about`, `/services`, `/preventive-dentistry`, `/restorative-dentistry`, `/pediatric-dentistry`
- `/patient-resources`, `/testimonials`, `/patient-stories`, `/blog`, `/blog/[slug]`
- `/contact`, `/schedule`, `/invisalign`, `/invisalign/resources`
- `/emergency-dental`, `/zoom-whitening`, `/zoom-whitening/schedule`
- `/teeth-whitening-palo-alto`, `/dental-cleaning-palo-alto`, `/cavity-fillings-palo-alto`, `/crowns-palo-alto`, `/pediatric-dentist-palo-alto`
- `/dentist-menlo-park`, `/dentist-stanford`, `/dentist-mountain-view`, `/dentist-los-altos`, `/dentist-los-altos-hills`, `/dentist-sunnyvale`, `/dentist-cupertino`, `/dentist-redwood-city`, `/dentist-atherton`, `/dentist-redwood-shores`
- `/locations`, `/dental-implants`, `/dental-veneers`
- `/accessibility`, `/hipaa`, `/privacy-policy`, `/terms`, `/thank-you`, `/analytics`, `/ga-test`

Legacy path normalization is still supported by `shared/redirects.ts` and `app/route-utils.ts`.

## Quick start

### Prerequisites

- Node.js 18.18+
- pnpm 8.7+ (or project `packageManager` requirement)

### Setup

```bash
pnpm install
cp .env.example .env
```

### Development

```bash
pnpm run dev
```

Default dev server:
- Next app at `http://localhost:3000`.

### Production

```bash
pnpm run build
pnpm run start
```

### Validation commands

- `pnpm run check`
- `pnpm run test:api`
- `pnpm run test:seo`
- `pnpm run check:business-info`
- `pnpm run check:seo-regression`
- `pnpm exec tsx scripts/og-meta-check.ts`
- `pnpm run check:lighthouse-budget`

## API endpoints (Next route handlers)

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

All endpoints preserve existing contract/validation behavior from `server/routes.ts` and shared schemas in `shared/schema.ts`.

## SEO / deployment

- Metadata generation is centralized in route handlers and shared SEO data (`shared/seo.ts`).
- `app/sitemap.ts` emits canonical static pages + blog slugs.
- `app/robots.ts` excludes noindex routes and `/api/`.
- `middleware.ts` enforces legacy redirect rules and canonical host behavior (`www.chriswongdds.com`).
- `vercel.json` includes protocol/host redirects for Vercel.

## Storage

Storage abstraction now routes through `server/storage/` and repository layer. Seed values remain compatible with existing shared seed data so behavior can be preserved while enabling persistence with PostgreSQL/Neon.

## Useful scripts location map

- app migration + route logic: `app/`
- server repository/API compatibility: `server/`
- SEO + redirects metadata: `shared/`
- migration/tests/docs: `scripts/`, `LOCAL_DEV.md`

## Contributing notes

- Keep canonical SEO path list and route list in sync (`shared/seo.ts` and explicit `app/*/page.tsx` files).
- Keep legacy compatibility for unimplemented paths through `app/[...slug]/page.tsx` until fully migrated.
- Prefer keeping global shell behavior in route shell wrappers to avoid duplicate header/footer/analytics wiring.
