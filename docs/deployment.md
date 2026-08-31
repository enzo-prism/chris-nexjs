# Deployment Runbook (Vercel)

Release procedure for production-safe deployments.

## Production topology (source of truth)

As of 2026-08-30, one Vercel production project is verified for this repository:

- Project: `chris-wong-dds`
- Canonical domain: `https://www.chriswongdds.com`
- Apex redirect: `https://chriswongdds.com`

Do not treat historical project names or unverified `*.vercel.app` aliases as
release targets.

Repository of record:

- GitHub: `https://github.com/enzo-prism/chris-nexjs`
- Release branch: `main`

## Preconditions

- For the default Git-based release flow, local repo may contain unrelated work, but the release commit must be intentionally committed and pushed.
- For a manual local `vercel --prod --yes` deploy, local repo must be clean and synced.
- Release commit is already on `origin/main`.
- Required quality gates pass.
- Required environment variables are configured in Vercel when needed.
- Automated checks mock outbound form vendors. Never send synthetic, dummy, or
  fake patient/contact submissions to production as a smoke test.

## Environment variable inventory

The tracked `.env.example` is the source of truth. Configure only the values
needed for the target environment.

Local runtime settings:

- `HOST`
- `PORT`
- `REUSE_PORT_ENABLED`
- `ALLOW_LOCAL_PORT_FALLBACK`
- `DEV_FALLBACK_PORT`

Storage:

- `DATABASE_URL` (required for Postgres/Neon mode; app can fall back to memory mode without it).

Lead delivery:

- `NEXT_PUBLIC_FORM_ENDPOINT` (optional client-side Formspree override)
- `SCHEDULE_FORM_ENDPOINT` (optional server-side Formspree override)
- `SCHEDULE_CRM_WEBHOOK_URL` (optional forwarding target)
- `SCHEDULE_SLACK_WEBHOOK_URL` (optional forwarding target)

Analytics and advertising:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`

Use `.env.example` as the configuration inventory. The following are command
overrides for audit runs, not required application environment variables:

- `SEO_AUDIT_BASE_URL`
- `IMAGE_AUDIT_BASE_URL`
- `LIGHTHOUSE_BASE_URL`
- `LIGHTHOUSE_RUNS`

## Vercel project settings

- Framework preset: Next.js.
- Install command: `pnpm install`.
- Build command: `pnpm run build`.
- Output directory: default Next.js output.
- Node version: `24.x` on production projects.

## Sync checks before deploy

Run these from repo root:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
gh repo view --json nameWithOwner,defaultBranchRef,isPrivate,url
```

Expected:

- `HEAD` equals `origin/main` SHA.
- Repo is `enzo-prism/chris-nexjs`.
- Default branch is `main`.

## Default deploy process (primary public production)

Preferred path: push a reviewed commit to `main` and verify the Git-triggered Vercel deployment for `chris-wong-dds`.

1. Run preflight checks locally (or in CI):
   - `pnpm run test:production`
   - `pnpm audit --prod --audit-level=high`
   - `node scripts/mobile-ux-source.test.mjs`
   - `pnpm exec tsx scripts/contact-form-ux.test.ts`
   - `pnpm exec tsx scripts/og-meta-check.ts`
   - `pnpm run test:gallery` (if gallery media changed)
   - `pnpm run test:reviews` (if review source/import changed)
   - perf suite (`build:perf`, `test:bundle`, `perf:smoke`, `perf:lighthouse`) for performance-sensitive releases
2. Confirm the release commit is on `origin/main`:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
```

3. Wait for or inspect the production deployment:

```bash
vercel ls chris-wong-dds --prod
vercel inspect https://www.chriswongdds.com
```

4. Verify host behavior:

```bash
curl -I https://chriswongdds.com
curl -I https://www.chriswongdds.com
curl -sS https://www.chriswongdds.com/robots.txt
curl -I https://www.chriswongdds.com/about
```

Expected:

- `https://chriswongdds.com/*` returns a permanent redirect (`301` or `308`) to `https://www.chriswongdds.com/*`.
- `https://www.chriswongdds.com/*` returns `200`.

## Manual CLI production deploy (use sparingly)

Only use this path when the local workspace is clean and you intentionally want the deploy to come from local CLI state rather than a pushed Git commit.

This repository does not track `.vercel/project.json`, and the current checkout
may not have one. Therefore every manual release must explicitly link and then
inspect the project before running a production deploy.

1. Run the same preflight checks listed above.
2. Link CLI to the primary production project:

```bash
vercel link --yes --scope enzo-design-prisms-projects --project chris-wong-dds
```

3. Inspect `.vercel/project.json` and confirm that its project identifier is for
   `chris-wong-dds`. Stop if it points anywhere else.

4. Deploy to production:

```bash
vercel --prod --yes
```

5. Verify deployment and aliases:

```bash
vercel inspect www.chriswongdds.com
```

6. Verify host behavior:

```bash
curl -I https://chriswongdds.com
curl -I https://www.chriswongdds.com
curl -sS https://www.chriswongdds.com/robots.txt
curl -I https://www.chriswongdds.com/about
```

## GitHub + Vercel release verification

Use SHA parity plus production alias inspection (reliable for manual CLI deploys and auto-deploys):

```bash
git fetch origin
printf "local HEAD: " && git rev-parse HEAD
printf "origin/main: " && git rev-parse origin/main
gh repo view enzo-prism/chris-nexjs --json nameWithOwner,defaultBranchRef,url
vercel inspect https://www.chriswongdds.com
```

Confirm:

- local `HEAD` equals `origin/main`.
- `vercel inspect` shows `target production` and `status Ready` for
  `www.chriswongdds.com`.
- deployment timestamps are at/after release execution time for the intended rollout.

## Runtime smoke checks

Smoke key pages:

- `/`
- `/services`
- `/invisalign`
- `/gallery`
- `/blog`
- `/changelog`
- `/contact`

Smoke key APIs:

- `/api/services`
- `/api/blog-posts`
- `/api/testimonials`
- `/rss.xml`

Confirm legacy `/api/rss.xml` permanently redirects to `/rss.xml` rather than
serving a duplicate feed.

Verify lead-flow UI without submitting synthetic data:

- confirm `/contact` and `/schedule` return `200`
- confirm labels, validation, keyboard focus, and error summaries work
- confirm the automated API contract suite used mocked outbound delivery
- do not submit fake contact, newsletter, or appointment payloads to the live
  domain; a real production submission requires an explicitly authorized,
  bona fide workflow

Verify the mobile navigation and homepage service presentation after UI releases:

- at 320 × 568 and 390 × 844, open the navigation and confirm the menu remains
  scrollable with its appointment, call, and directions actions reachable
- confirm the menu is exposed as a modal dialog, initial focus moves inside it,
  `Tab`/`Shift+Tab` remain contained, `Escape` closes it, and focus returns to
  the menu button
- expand Services and Locations, confirm active-page states remain clear, and
  verify the bottom content clears the iOS safe area
- confirm the homepage `#services` cards contain purpose-matched icons and no
  service lifestyle images, while the full `/services` catalog keeps its image
  treatment
- confirm the verified-real Dr. Wong hero/about portraits and office courtyard
  photo still render on the homepage

Verify analytics tag install:

```bash
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -o 'googletagmanager.com/gtag/js\\?id=G-94WRBJY51J' \
  | wc -l
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -n "gtag\\('consent', 'default'|analytics_storage: analyticsConsent|ad_storage: 'denied'|gtag\\('config', 'G-94WRBJY51J'|send_page_view: false"
```

Expected:

- First command returns `1` (exactly one GA4 tag in `<head>`).
- Consent defaults and GA config markers are present: analytics storage follows the stored opt-out state, advertising consent fields are denied, `send_page_view` is false, and the GA config uses `G-94WRBJY51J` unless overridden.

Verify Vercel Web Analytics install:

Open `https://www.chriswongdds.com` in a browser and verify one of the following after hydration:

- browser console returns a script element:

```js
document.head.querySelector('script[data-sdkn^="@vercel/analytics"]')
```

- or DevTools Network shows:
  - `/_vercel/insights/script.js`
  - follow-up requests under `/_vercel/insights`

Expected:

- The client runtime injects the Vercel Web Analytics script after hydration.
- Page views begin appearing in the Vercel Analytics dashboard after navigating the live deployment.

Verify Google crawl surfaces after SEO-affecting releases:

- `robots.txt` contains explicit allow groups for `Googlebot`, `Google-InspectionTool`, and `User-agent: *`
- `robots.txt` contains no `Crawl-delay`, no `Host` directive, and no duplicate static copy in `client/public` or `public`
- `sitemap.xml` includes `https://www.chriswongdds.com/about`
- `sitemap.xml` excludes retired city routes and the duplicate implant-versus-bridge URL
- retired city URLs return one-hop `301` redirects to `/locations`
- `/analytics`, `/ga-test`, and `/api/appointments` return `404`
- Search Console live test for `/about` reports:
  - crawl allowed
  - page fetch successful
  - not blocked by robots.txt
- If `www` looks clean but Search Console still reports blocked:
  - verify `https://chriswongdds.com/*` redirects permanently (`301`/`308`) and not temporarily (`307`)

## Verification commands against preview or production

```bash
SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all
IMAGE_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:images
LIGHTHOUSE_BASE_URL=https://www.chriswongdds.com LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```

## Rollback

1. Re-promote last known-good deployment in Vercel for the affected project.
2. Re-run route and SEO smoke checks on rolled-back build.
3. Open a follow-up fix PR with root-cause notes.

## Canonical and redirect ownership

Keep these files aligned whenever routes or SEO paths change:

- `shared/seo.ts`
- `shared/redirects.ts`
- `middleware.ts`
- `vercel.json`
- `app/robots.ts`

## Local link policy

- `.vercel/project.json` determines the default target for `vercel` commands run without explicit project relinking.
- `.vercel/project.json` is not tracked and is absent in a fresh checkout.
- Before every manual deployment, explicitly link and verify
  `chris-wong-dds`; never infer the target from a previous session.
- Before any manual CLI deploy, inspect `git status --short` so unrelated local changes are not accidentally shipped.

## Editorial compliance note

Allowed doctor naming:

- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Do not combine `Dr.` and `DDS` on one line.

Also keep payments, Person/WebSite `alternateName`, request-not-book CTAs, and
implant partner wording aligned with practice reality. Standing rules:
`docs/seo-growth-plan.md` Editorial guardrails.
