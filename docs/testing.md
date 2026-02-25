# Testing Guide

This document maps each test script to its purpose and when to run it.

## Core checks

- `pnpm run check`
  - Runs business-info guard and TypeScript compile checks.

- `pnpm run test:api`
  - Validates API contract behavior and error semantics.

- `pnpm run test:routes`
  - Validates route compatibility, metadata contract, and redirect expectations.

## SEO checks

- `pnpm run test:seo`
  - Static SEO regression checks.

- `pnpm run test:seo:onpage`
  - Runtime on-page checks (title, description, h1, canonical, robots).

- `pnpm run test:seo:links`
  - Runtime crawl/link graph checks (orphans, service links, blog link policy, redirects).

- `pnpm run test:seo:schema`
  - Runtime structured-data validation checks.

- `pnpm run test:seo:all`
  - Runs all SEO checks in sequence.

Runtime SEO scripts read `SEO_AUDIT_BASE_URL` (default `http://localhost:3000`).

## UI and asset checks

- `pnpm run test:design-system`
  - Ensures shared UI consistency with design-system constraints.

- `pnpm run test:images`
  - Verifies image reference and runtime image response integrity.

## Performance checks

- `pnpm run test:bundle`
  - Enforces JS bundle budget thresholds.

- `pnpm run perf:smoke`
  - Confirms route health before Lighthouse.

- `pnpm run perf:lighthouse`
  - Runs Lighthouse budget gate.

## Aggregate release check

- `pnpm run test:production`
  - Runs the repository’s production-grade gate sequence.

## Recommended local sequence before merge

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo:all
pnpm run test:design-system
pnpm run test:images
pnpm run test:bundle
```
