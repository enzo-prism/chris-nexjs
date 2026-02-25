# Performance and Responsiveness Workflow

This workflow defines the performance baseline and repeatable measurement process used by local development, CI, and release checks.

## Primary goals

- Keep marketing routes fast on mobile.
- Prevent JS bundle regressions before merge.
- Keep Lighthouse checks deterministic and debuggable.

## Targets

Core routes: `/`, `/services`, `/invisalign`, `/dentist-menlo-park`

- Lighthouse performance score must satisfy script budget thresholds.
- CLS target: `<= 0.10`.
- TBT target: `<= 250ms`.

Bundle budgets:
- Key marketing routes target `<= 170kB` first-load JS.
- Secondary marketing routes target `<= 220kB`.
- `/analytics` remains isolated and may be higher.

## Scripts and ownership

- `scripts/bundle-budget.test.mjs`: route JS budget enforcement.
- `scripts/perf-smoke.mjs`: route health precheck before Lighthouse.
- `scripts/lighthouse-budget.mjs`: Lighthouse budget checks.

## Local benchmark procedure

1. Build isolated perf output.

```bash
pnpm run build:perf
```

2. Start isolated perf server.

```bash
PORT=3101 pnpm run start:perf
```

3. Run smoke route health in a second shell.

```bash
PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke
```

4. Run bundle budget check.

```bash
NEXT_DIST_DIR=.next-perf pnpm run test:bundle
```

5. Run Lighthouse budget.

```bash
LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## CI expectations

CI should run:

1. `pnpm run build:perf`
2. `NEXT_DIST_DIR=.next-perf pnpm run test:bundle`
3. `pnpm run perf:smoke`
4. `pnpm run perf:lighthouse`

## Debugging failed budgets

- If smoke check fails, resolve route 404/500 or startup issues first.
- If bundle budget fails, inspect route-level client boundaries and imports.
- If Lighthouse fails intermittently, rerun with fixed `LIGHTHOUSE_RUNS=3` and stable CPU/network profile.

## Notes

- Always use `.next-perf` for perf runs to avoid conflicts with normal `.next` dev output.
- Validate perf changes alongside route/SEO checks, not in isolation.
