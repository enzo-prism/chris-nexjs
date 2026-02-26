# Performance and Responsiveness Workflow

Repeatable performance process for local validation and deployment readiness.

## Performance goals

- Keep marketing routes fast on mobile devices.
- Prevent JavaScript bundle growth regressions.
- Keep Lighthouse checks deterministic and actionable.
- Preserve gallery experience quality without autoplay-heavy overhead.

## Target routes

Primary routes:
- `/`
- `/services`
- `/invisalign`
- `/dentist-menlo-park`

Feature route:
- `/gallery`

## Budget targets

- Key marketing routes: target `<= 170kB` first-load JS.
- Secondary marketing routes: target `<= 220kB`.
- `/analytics` may exceed marketing route budget due intentional isolation.
- Lighthouse guidance:
  - CLS `<= 0.10`
  - TBT `<= 250ms`

## Gallery-specific performance policy

- Hero video: autoplay + muted + loop.
- In-grid clips: paused by default, user-initiated playback only.
- Pause in-grid clips when out of viewport.
- Non-hero clips use `preload="none"`.

## Scripts

- `scripts/bundle-budget.test.mjs`
  - route-level JS budget enforcement.
- `scripts/perf-smoke.mjs`
  - route health precheck.
- `scripts/lighthouse-budget.mjs`
  - Lighthouse budget gate.

## Local benchmark procedure

1. Build isolated perf artifacts:

```bash
pnpm run build:perf
```

2. Start isolated perf server:

```bash
PORT=3101 pnpm run start:perf
```

3. Precheck routes:

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
```

4. Validate bundle budgets:

```bash
NEXT_DIST_DIR=.next-perf pnpm run test:bundle
```

5. Run Lighthouse budget checks:

```bash
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## If budgets fail

- `perf:smoke` failed:
  - fix route 404/500 or startup configuration first.
- `test:bundle` failed:
  - inspect route client boundaries and heavy imports.
- `perf:lighthouse` failed:
  - rerun with fixed runs (`LIGHTHOUSE_RUNS=3`) and stable local conditions.

## Operating notes

- Use `.next-perf` artifacts for perf checks to avoid contaminating normal `.next`.
- Pair performance checks with route, SEO, and image audits before release.
