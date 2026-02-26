# Testing Guide

Command reference for contract, UI, SEO, and performance checks.

## Fast summary

- Use `pnpm run test:production` for a one-command baseline gate.
- Add runtime SEO/image/perf checks before production promotion.
- Run `pnpm run test:gallery` whenever media inventory or gallery behavior changes.

## Script matrix

### Type and safety

- `pnpm run check`
  - Runs hard-coded business-info guard and TypeScript compile checks.

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

### SEO checks

- `pnpm run test:seo`
  - Static SEO regression checks.
- `pnpm run test:seo:onpage`
  - Runtime title/description/h1/canonical/robots checks.
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

## Release workflows

Baseline gate:

```bash
pnpm run test:production
```

Extended release gate:

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

Then, in one terminal, start perf server:

```bash
PORT=3101 pnpm run start:perf
```

And in another terminal:

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```
