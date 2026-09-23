# Testing Guide

Command reference for contract, UI, SEO, and performance checks.

## Fast summary

- Use `pnpm run test:production` for a one-command baseline gate.
- Run `pnpm audit --prod --audit-level=high` for the production dependency gate.
- CI also runs the 34-test mobile browser suite plus focused mobile-source,
  contact-UX, OG metadata, gallery, and review-data guards.
- Add `test:gallery` and perf checks when affected surfaces change.
- Run `pnpm run test:gallery` whenever media inventory or gallery behavior changes.
- For gallery frame/layout updates, perform manual viewport QA (`sm` to `xl`)
  to confirm editorial crops keep their subjects legible and the lightbox shows
  the complete source frame.

## Script matrix

### Type and safety

- `pnpm run check`
  - Regenerates current Next route types, then runs the hard-coded business-info guard and TypeScript compile checks.
  - Do not run it in parallel with `build`, `build:perf`, `test:bundle`, or `test:production`, because `.next/types` can be missing or mid-regeneration and produce misleading failures.

### API and routing contracts

- `pnpm run test:api`
  - Verifies API handlers for status codes and key payload semantics.
  - Includes schedule-request compatibility checks (legacy + v2 payloads).
  - Includes `scripts/attribution.test.ts`: lead-channel derivation (Google
    Business Profile tags, Ads click IDs, referrer hosts), the optional
    `attribution` wire field, and Vercel event property priority. The
    schedule and contact contract tests assert the channel reaches the office
    inbox payload and that a malformed value never blocks a lead.
  - Mocks all outbound delivery. A contract test must never contact Formspree,
    CRM, Slack, or another production vendor.
- `pnpm run test:routes`
  - Verifies canonical metadata, redirects, and dynamic blog route behavior.

### Feature-specific checks

- `pnpm exec tsx scripts/contact-form-ux.test.ts`
  - Statically verifies the contact-flow schema, consent, accessible status,
    and submission-state affordances.
- `pnpm exec tsx scripts/og-meta-check.ts`
  - Verifies representative pages and seeded blog content have usable Open
    Graph metadata and images.

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
  - Also runs `scripts/homepage-proof.test.ts`: every homepage review quote in
    `client/src/data/homeProof.ts` must be a verbatim excerpt of a 5-star
    Google review by the named reviewer.

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
- `pnpm run llms:generate`
  - Regenerates both tracked `llms.txt` copies; CI reruns it and rejects drift.

Runtime SEO scripts use `SEO_AUDIT_BASE_URL` and default to `http://localhost:3000`.
If local dev is on port `5000`, set `SEO_AUDIT_BASE_URL=http://localhost:5000`.

### UI and media checks

- `pnpm run test:design-system`
  - Enforces design-system usage in shared component directories.
- `pnpm run test:images`
  - Scans source image references and runtime image responses.
  - Uses `IMAGE_AUDIT_BASE_URL` (default `http://localhost:3000`).

### Mobile UX checks

- `node scripts/mobile-ux-source.test.mjs`
  - Static source guards: form-field font sizes (≥16px on mobile), 44px touch targets, sticky funnel CTA, contact-form delivery, landing-page H1 sizing, etc.
- `pnpm run test:mobile`
  - Playwright suite under `tests/mobile/` (builds + serves the app, runs against an iPhone-class viewport via system Chrome): no horizontal overflow, touch targets, homepage proof content, the `/office-tour` page, and more.
  - `conversion.spec.ts` guards the conversion path: step 1 of the `/schedule`
    form must start inside the first iPhone 13 screen, the insurance field is
    visible on the contact step, a `utm_campaign=gbp_*` landing keeps its
    source through a client-side hop to `/schedule` into the request payload,
    a later direct visit never erases a known source, the homepage intro video
    plays the self-hosted clip, and the cost section keeps accepted-payment
    copy. Every submission is intercepted with `page.route`; no real lead is
    sent.
  - Navigate through `gotoAndHydrate` in `tests/mobile/_helpers.ts`. It asserts the response is `200` before anything else, and that assertion is load-bearing: the 404 page renders a `main` element, has one `h1`, and never overflows, so a spec naming a route that does not exist will otherwise pass while testing nothing. `overflow.spec.ts` asserted against `/dentist-palo-alto` — a route the site has never had — for exactly this reason. Whenever you add a route to a spec's list, the guard is what tells you the route is real.

### Performance checks

- `pnpm run test:bundle`
  - Enforces route-level JS bundle thresholds.
- `pnpm run perf:smoke`
  - Confirms route health before Lighthouse.
- `pnpm run perf:lighthouse`
  - Executes Lighthouse budget checks.

### Production dependency security

- `pnpm audit --prod --audit-level=high`
  - Fails when the production dependency graph contains a high or critical
    advisory.
  - Runs in CI after the frozen-lockfile install.

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

- Keep `check` and build-backed scripts sequential, not parallel.
- If route-type generation itself fails, run it directly for a focused error:

```bash
pnpm exec next typegen
```

Extended release gate:

```bash
pnpm run test:production
pnpm audit --prod --audit-level=high
node scripts/mobile-ux-source.test.mjs
pnpm exec tsx scripts/contact-form-ux.test.ts
pnpm exec tsx scripts/og-meta-check.ts
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
  [scheduling-audit-2026-03-04.md](scheduling-audit-2026-03-04.md))
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
curl -I https://chriswongdds.com
curl -I https://www.chriswongdds.com
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -o 'googletagmanager.com/gtag/js\\?id=G-94WRBJY51J' \
  | wc -l
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -n "gtag\\('consent', 'default'|analytics_storage: analyticsConsent|ad_storage: 'denied'|gtag\\('config', 'G-94WRBJY51J'|send_page_view: false"
```

Expected:

- local `HEAD` equals `origin/main`
- the `www.chriswongdds.com` production deployment is `Ready`
- apex host (`chriswongdds.com`) redirects permanently (`301` or `308`) to `https://www.chriswongdds.com/`
- canonical host returns `200`
- GA head-tag count command returns `1`
- the head bootstrap makes analytics storage follow stored consent, keeps advertising consent fields denied, uses `send_page_view: false`, and configures the expected GA ID

Production lead safety:

- Do not use fake names, addresses, phone numbers, emails, newsletter signups,
  or appointment requests against the public production site.
- Use mocked contract tests locally and validation-only browser QA in
  production. A real live submission requires explicit authorization and a
  bona fide operational purpose.

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
