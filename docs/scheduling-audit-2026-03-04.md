# Scheduling Audit (2026-03-04)

Post-implementation analysis of the mobile-first scheduling flow using localhost runtime checks and Lighthouse.

## Environment

- Date: 2026-03-04
- Build: commit `b3678db` baseline
- Runtime URL: `http://localhost:3011/schedule`
- Tooling:
  - `npx lighthouse` (headless)
  - route/API smoke checks via `curl`

## Verified Runtime Status

- `GET /schedule`: `200`
- `POST /api/schedule-request` with valid v2 payload: `201`

## Lighthouse Snapshot (`/schedule`)

- Performance: `0.56`
- Accessibility: `0.95`
- Best Practices: `0.96`
- SEO: `1.00`

Core timings:

- LCP: `5459ms`
- TBT: `1205ms`
- CLS: `0.003`
- FCP: `903ms`
- Speed Index: `1274ms`
- TTI: `16219ms`

## Key Findings

1. Performance bottleneck is still main-thread JavaScript work.
- Script evaluation + parse/compile are dominant contributors.
- Long tasks are concentrated in:
  - `/_next/static/chunks/main-app.js`
  - `/_next/static/chunks/app/schedule/page.js`
  - Appointment form chunk

2. Unused payload remains significant.
- Unused JS estimated savings: `~112KiB`
- Unused CSS estimated savings: `~22KiB`

3. Accessibility misses are mostly outside the scheduling form.
- Contrast issues occur in footer mobile text/link combinations.
- Heading order issue is from a `h4` sequence under scheduling benefits (`Why Schedule with Us?` block), not the step form itself.

4. Scheduling architecture improvements are working as intended.
- 3-step progression and first-available skip flow are live.
- Reviews widget is deferred and no longer eagerly loaded at initial schedule interaction.
- API accepts both legacy and v2 request shapes.

## Prioritized Follow-up Backlog

### P0 (next sprint)

1. Reduce `/schedule` JS execution on mobile:
- Keep `AppointmentSection` high-priority and split non-critical schedule-page content where possible.
- Revisit route-level imports in `Schedule.tsx` and lower sections for additional lazy boundaries.

2. Bring LCP under 4s on mobile:
- Minimize blocking work before interactive form render.
- Audit schedule-page hero + initial section style/JS cost.

3. Bring TBT under 300ms:
- Focus on script execution hotspots (`main-app.js`, schedule chunk, form chunk).

### P1

1. Fix footer contrast failures (global styles/content tokens).
2. Resolve heading order sequence in scheduling benefit cards.
3. Re-run Lighthouse with 3-run median and track trend across release candidates.

### P2

1. Evaluate targeted CSS pruning for route-level dead styles.
2. Investigate GA script loading strategy impact on schedule route if privacy/analytics constraints allow.

## Metrics To Track Weekly

- Schedule conversion funnel:
  - `schedule_view`
  - `schedule_step_view`
  - `schedule_step_continue`
  - `schedule_submit_attempt`
  - `schedule_submit_success`
  - `schedule_submit_failure`
  - `schedule_abandonment_checkpoint`
- Device-segmented completion rate (`mobile`, `tablet`, `desktop`)
- Lighthouse trend for `/schedule`:
  - LCP
  - TBT
  - TTI
  - Accessibility score

## Exit Criteria For Next Iteration

- LCP `<= 4000ms` (p75 target proxy in lab trend)
- TBT `<= 300ms`
- Accessibility score remains `>= 0.95` with no contrast/heading-order regressions
- Mobile completion rate uplift versus pre-redesign baseline
