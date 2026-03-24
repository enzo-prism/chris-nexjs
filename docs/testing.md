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
  - Do not run it in parallel with `build`, `build:perf`, `test:bundle`, or `test:production`, because `.next/types` can be missing or mid-regeneration and produce misleading failures.

### API and routing contracts

- `pnpm run test:api`
  - Verifies API handlers for status codes and key payload semantics.
  - Includes schedule-request compatibility checks (legacy + v2 payloads).
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
- SVG animation surfaces (manual QA):
  - verify decorative accents are visible but non-blocking on desktop/tablet/mobile
  - verify `prefers-reduced-motion: reduce` disables SVG movement
  - verify no CTA or readable copy is obscured by animated SVG layers
- `pnpm run test:reviews`
  - Verifies generated Google review seed data integrity:
    - generated count matches raw export count
    - rating distribution matches source
    - no-text placeholder conversion counts match source
    - minimum count floor (`>=300`) is maintained

### SEO checks

- `pnpm run test:seo`
  - Static SEO regression checks.
  - Rejects `robots` configs that use `crawlDelay`, because Google ignores it and it can make grouped crawler rules ambiguous in live inspection.
  - Rejects duplicate static `robots.txt` files and missing explicit `Google-InspectionTool` rules.
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

Sequencing note:

- `pnpm run check` depends on `.next/types`.
- Keep `check` and build-backed scripts sequential, not parallel.
- If `check` suddenly reports missing Next route types, run:

```bash
rm -rf .next
pnpm run build
pnpm run check
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

## Scheduling release checklist

Run this when scheduling flow or `/schedule` UX is changed:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo:all
```

Manual QA:

- Validate `first_available` step-skip submit path.
- Validate `choose_preferences` path (required day/time preferences).
- Validate field-error summary focus links and inline messaging.
- Validate sticky mobile action bar in common phone viewports.
- Validate deferred reviews load on scroll and via explicit click.

Audit reporting:

- After schedule-related releases, write or refresh a dated schedule audit report in `docs/` (example:
  [scheduling-audit-2026-03-04.md](/Users/enzo/chris-website/docs/scheduling-audit-2026-03-04.md))
  with:
  - localhost runtime status checks (`/schedule` and `/api/schedule-request`)
  - Lighthouse category scores + key timing metrics
  - prioritized remediation backlog

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
- apex host (`chriswongdds.com`) redirects permanently (`301` or `308`) to `https://www.chriswongdds.com/`
- canonical host returns `200`
- GA head-tag count command returns `1`
- consent/privacy markers are present in head bootstrap script (`wait_for_update`, `analytics-consent-updated`, `allow_google_signals: false`)

Search Console-specific follow-up after SEO releases:

```bash
curl -sS https://www.chriswongdds.com/robots.txt
curl -I https://chriswongdds.com/about
curl -I https://www.chriswongdds.com/about
curl -I -A 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)' https://www.chriswongdds.com/about
```

Then verify URL Inspection live tests for `/` and `/about` show:

- crawl allowed
- page fetch successful
- not blocked by robots.txt
- If `www` is clean but live tests still fail, inspect apex-host redirects separately and confirm they are permanent (`301`/`308`) rather than temporary (`307`)
