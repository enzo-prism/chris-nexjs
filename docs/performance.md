# Performance and Responsiveness Workflow

This document defines the repeatable flow used to measure and enforce web performance for this repository.

## Goals

- Keep critical marketing routes fast and responsive.
- Catch JavaScript bundle regressions before merge.
- Keep Lighthouse checks deterministic across local and CI runs.

## Route performance targets

- Core routes (`/`, `/services`, `/invisalign`, `/dentist-menlo-park`)
  - Performance score at or above defined budget in `scripts/lighthouse-budget.mjs`
  - CLS `<= 0.10`
  - TBT `<= 250ms`
- Bundle budgets
  - Critical routes: `<= 170kB` JavaScript budget (see `scripts/bundle-budget.test.mjs`)
  - Other marketing routes: `<= 220kB`
  - `/analytics`: higher isolated budget

## Local benchmark flow

1. Build isolated perf output:

```bash
pnpm run build:perf
```

2. Start isolated perf server:

```bash
PORT=3101 pnpm run start:perf
```

3. In another shell, run smoke health:

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
```

4. Run bundle budget:

```bash
NEXT_DIST_DIR=.next-perf pnpm run test:bundle
```

5. Run Lighthouse budget:

```bash
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## Notes

- `perf:smoke` verifies route health before Lighthouse.
- `lighthouse-budget` includes a precheck stage and fails with actionable route diagnostics.
- Keep `NEXT_DIST_DIR=.next-perf` for perf runs to avoid collisions with `.next` used by normal workflows.
