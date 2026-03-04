# Testing Guide

Command reference for contract, UI, SEO, and performance checks.

## Fast summary

- Use `pnpm run test:production` for a one-command baseline gate.
- Add `test:gallery` and perf checks when affected surfaces change.
- Run `pnpm run test:gallery` whenever media inventory or gallery behavior changes.
- For gallery frame/layout updates, perform manual viewport QA (`sm` to `xl`) to confirm still images are fully visible and not cropped.

## Script matrix

### Type and safety

- `pnpm run check`
  - Runs hard-coded business-info guard and TypeScript compile checks.
  - Requires generated Next route types in `.next/types`; if missing, run `pnpm run build` once.

### API and routing contracts

- `pnpm run test:api`
  - Verifies API handlers for status codes and key payload semantics.
- `pnpm run test:routes`
  - Verifies canonical metadata, redirects, and dynamic blog route behavior.

### Feature-specific checks

- `pnpm run test:gallery`
  - Validates gallery media contract:
    - unique ids and URLs
    - HTTPS media paths
    - valid kind/layout/interaction values
    - required alt/title/description metadata
    - no duplicate video posters
    - no overlap between video posters and still-image tile sources
- `pnpm run test:reviews`
  - Verifies generated Google review seed data integrity:
    - generated count matches raw export count
    - rating distribution matches source
    - no-text placeholder conversion counts match source
    - minimum count floor (`>=300`) is maintained

### SEO checks

- `pnpm run test:seo`
  - Static SEO regression checks.
- `pnpm run test:seo:onpage`
  - Runtime title/description/h1/canonical/robots checks.
  - Enforces exactly one robots meta tag per indexable page.
  - Verifies RSS discovery link (`rel=\"alternate\" type=\"application/rss+xml\"`).
- `pnpm run test:seo:links`
  - Runtime internal link graph and orphan checks.
- `pnpm run test:seo:schema`
  - Runtime JSON-LD schema validation checks.
- `pnpm run test:seo:all`
  - Runs all SEO checks above.

Runtime SEO scripts use `SEO_AUDIT_BASE_URL` and default to `http://localhost:3000`.
If local dev is on port `5000`, set `SEO_AUDIT_BASE_URL=http://localhost:5000`.

### UI and media checks

- `pnpm run test:design-system`
  - Enforces design-system usage in shared component directories.
- `pnpm run test:images`
  - Scans source image references and runtime image responses.
  - Uses `IMAGE_AUDIT_BASE_URL` (default `http://localhost:3000`).

### Performance checks

- `pnpm run test:bundle`
  - Enforces route-level JS bundle thresholds.
- `pnpm run perf:smoke`
  - Confirms route health before Lighthouse.
- `pnpm run perf:lighthouse`
  - Executes Lighthouse budget checks.

## What `test:production` runs

`pnpm run test:production` executes:

- `pnpm run check`
- `pnpm run test:bundle`
- `pnpm run test:api`
- `pnpm run test:routes`
- `pnpm run test:design-system`
- `pnpm run build`
- starts `pnpm run start` (local production server)
- `pnpm run test:images` against the started server
- `pnpm run test:seo:all` against the started server

Environment knobs:

- `PRODUCTION_TEST_PORT` (default `3000`)
- `PRODUCTION_TEST_BASE_URL` (default `http://localhost:<PRODUCTION_TEST_PORT>`)

## Release workflows

Baseline gate:

```bash
pnpm run test:production
```

Extended release gate:

```bash
pnpm run test:production
pnpm run test:gallery
pnpm run test:reviews
pnpm run build:perf
NEXT_DIST_DIR=.next-perf pnpm run test:bundle
```

Then, in one terminal, start perf server:

```bash
PORT=3101 pnpm run start:perf
```

And in another terminal:

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## Live production alignment checks

Run these after a production release to ensure GitHub, Vercel, and the public domain are aligned:

```bash
git rev-parse HEAD
git rev-parse origin/main
vercel inspect www.chriswongdds.com
vercel inspect https://chris-nextjs.vercel.app
vercel inspect https://chriswongdds.vercel.app
curl -I https://chriswongdds.com
curl -I https://www.chriswongdds.com
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -o 'googletagmanager.com/gtag/js\\?id=G-94WRBJY51J' \
  | wc -l
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -n "gtag\\('consent', 'default'|wait_for_update: 500|analytics_consent|analytics-consent-updated|gtag\\('config', 'G-94WRBJY51J'|send_page_view: false|allow_google_signals: false|allow_ad_personalization_signals: false"
```

Expected:

- local `HEAD` equals `origin/main`
- `www.chriswongdds.com`, `chris-nextjs.vercel.app`, and `chriswongdds.vercel.app` deployments are `Ready`
- apex host (`chriswongdds.com`) redirects to `https://www.chriswongdds.com/`
- canonical host returns `200`
- GA head-tag count command returns `1`
- consent/privacy markers are present in head bootstrap script (`wait_for_update`, `analytics-consent-updated`, `allow_google_signals: false`)
