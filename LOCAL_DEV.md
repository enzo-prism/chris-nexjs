# Local Development Guide

Reliable workflow for day-to-day development, QA, and release prep.

## Prerequisites

- Node.js `18.18+`
- pnpm `8.7+`

## Setup

1. Install dependencies.

```bash
pnpm install
```

2. Create local env file from template.

```bash
cp .env.example .env
```

3. Optional env updates.

- `PORT` for local server port (`.env.example` uses `5000`).
- `DATABASE_URL` to enable DB-backed storage mode.
- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## Run development server

```bash
pnpm run dev
```

Port notes:
- With template env unchanged, app runs on `http://localhost:5000`.
- If `PORT` is removed, Next defaults to `http://localhost:3000`.

## Run production locally

```bash
pnpm run build
pnpm run start
```

Use this mode for final behavior checks before deploy.

## Recommended local test flow

Core contract checks:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:gallery
pnpm run test:design-system
pnpm run test:images
```

SEO checks:

```bash
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:all
```

Release convenience gate:

```bash
pnpm run test:production
```

## Performance local flow

Run isolated perf build and server:

```bash
pnpm run build:perf
PORT=3101 pnpm run start:perf
```

Then run checks from another terminal:

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
NEXT_DIST_DIR=.next-perf pnpm run test:bundle
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## Runtime audit URL overrides

If your server is not on the script default port:

```bash
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:onpage
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:links
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:schema
IMAGE_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:images
```

## Troubleshooting

- Stale build artifacts:
  - `rm -rf .next .next-perf`
- Port already in use:
  - change `PORT` in `.env` or stop conflicting process
- Redirect/canonical mismatch:
  - align `vercel.json`, `middleware.ts`, `shared/redirects.ts`, and `shared/seo.ts`
- Metadata issues:
  - run `pnpm run test:routes`
  - run `pnpm run test:seo:all`
- Gallery media issues:
  - run `pnpm run test:gallery`
  - verify media URLs in `client/src/data/galleryMedia.ts`
