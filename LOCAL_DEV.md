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
- `NEXT_PUBLIC_FORM_ENDPOINT` and `SCHEDULE_FORM_ENDPOINT` for Formspree-backed forms.

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

Visual motion checks (when SVG/UI animation is touched):

1. Run the app in dev and verify key animated surfaces at `sm`, `md`, and `lg` breakpoints.
2. Toggle OS/browser reduced-motion preference and confirm decorative SVG accents stop animating.
3. Confirm accents do not overlap critical copy or CTA controls.

Scheduling mobile checks (when `/schedule` is touched):

1. Validate both flows:
   - `first_available` (Step 3 skip)
   - `choose_preferences` (Step 3 required)
2. Verify sticky action bar behavior on iOS and Android-sized viewports:
   - `375x812`
   - `390x844`
   - `412x915`
3. Confirm form tap targets remain at least 44px high and easy to hit one-handed.
4. Confirm error summary links move focus to invalid fields.
5. Verify deferred reviews behavior:
   - reviews widget does not load before the reviews section approaches viewport
   - "Load Reviews Now" button loads reviews on demand

SEO checks:

```bash
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:all
```

Release convenience gate:

```bash
pnpm run test:production
```

`test:production` builds and starts the production server automatically, then runs runtime image + SEO audits.
Default runtime base URL is `http://localhost:3000` (override with `PRODUCTION_TEST_PORT` or `PRODUCTION_TEST_BASE_URL`).

## Google reviews refresh workflow

Use this whenever new Google review exports are added to the project.

1. Replace the raw export file:
   - `attached_assets/google-reviews-export-319.txt`
2. Regenerate the typed seed dataset:

```bash
pnpm run reviews:import
```

3. Verify integrity:

```bash
pnpm run reviews:audit
pnpm run test:reviews
```

4. Run contract checks before commit:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
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

Schedule-specific Lighthouse spot check:

```bash
npx --yes lighthouse http://localhost:3101/schedule \
  --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage' \
  --only-categories=performance,seo \
  --output=html \
  --output-path=./.tmp-schedule-lighthouse.html
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
- `ChunkLoadError` for `/_next/static/chunks/app/%5B...slug%5D/page.js` in dev:
  - stop the dev server
  - run `rm -rf .next`
  - restart with `pnpm run dev`
  - hard refresh browser tab
- `pnpm run check` fails with missing `.next/types/*` files:
  - run `pnpm run build` once to regenerate Next route type artifacts
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
