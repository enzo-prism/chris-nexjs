# Deployment Runbook (Vercel)

Release procedure for production-safe deployments.

## Production topology (source of truth)

As of 2026-03-04, this repository is connected to three Vercel production environments that track the same `main` branch commits:

- Primary public production:
  - Project: `chris-wong-dds`
  - Domains: `https://www.chriswongdds.com`, `https://chriswongdds.com`
- Secondary production mirror:
  - Project: `chris-nextjs`
  - Domain: `https://chris-nextjs.vercel.app`
- Legacy production mirror:
  - Project: `chriswongdds`
  - Domain: `https://chriswongdds.vercel.app`

Repository of record:

- GitHub: `https://github.com/enzo-prism/chris-nexjs`
- Release branch: `main`

## Preconditions

- For the default Git-based release flow, local repo may contain unrelated work, but the release commit must be intentionally committed and pushed.
- For a manual local `vercel --prod --yes` deploy, local repo must be clean and synced.
- Release commit is already on `origin/main`.
- Required quality gates pass.
- Required environment variables are configured in Vercel when needed.

## Required environment variables

Core:

- `DATABASE_URL` (required for Postgres/Neon mode; app can fall back to memory mode without it).

Metadata and SEO:

- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (defaults to `G-94WRBJY51J` if omitted).

Lead forms:

- `NEXT_PUBLIC_FORM_ENDPOINT` (client-side Formspree target)
- `SCHEDULE_FORM_ENDPOINT` (server-side Formspree target)

Optional script variables (for audits):

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

1. Run the same preflight checks listed above.
2. Link CLI to the primary production project:

```bash
vercel link --yes --scope enzo-design-prisms-projects --project chris-wong-dds
```

3. Deploy to production:

```bash
vercel --prod --yes
```

4. Verify deployment and aliases:

```bash
vercel inspect www.chriswongdds.com
```

5. Verify host behavior:

```bash
curl -I https://chriswongdds.com
curl -I https://www.chriswongdds.com
curl -sS https://www.chriswongdds.com/robots.txt
curl -I https://www.chriswongdds.com/about
```

## Optional mirror sync deploys

If you want all connected production mirrors to receive a fresh deployment immediately (instead of waiting for platform hooks), deploy each project explicitly:

```bash
vercel link --yes --scope enzo-design-prisms-projects --project chris-nextjs
vercel --prod --yes

vercel link --yes --scope enzo-design-prisms-projects --project chriswongdds
vercel --prod --yes
```

## GitHub + Vercel release verification

Use SHA parity plus production alias inspection (reliable for manual CLI deploys and auto-deploys):

```bash
git fetch origin
printf "local HEAD: " && git rev-parse HEAD
printf "origin/main: " && git rev-parse origin/main
gh repo view enzo-prism/chris-nexjs --json nameWithOwner,defaultBranchRef,url
vercel inspect https://www.chriswongdds.com
vercel inspect https://chris-nextjs.vercel.app
vercel inspect https://chriswongdds.vercel.app
```

Confirm:

- local `HEAD` equals `origin/main`.
- all three `vercel inspect` commands show `target production` and `status Ready`.
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
- `/api/rss.xml`
- `/api/schedule-request`

Verify form flows:

- submit `/contact` form
- submit `/schedule` appointment request

Verify analytics tag install:

```bash
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -o 'googletagmanager.com/gtag/js\\?id=G-94WRBJY51J' \
  | wc -l
curl -sL https://www.chriswongdds.com/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -n "gtag\\('consent', 'default'|wait_for_update: 500|analytics_consent|analytics-consent-updated|gtag\\('config', 'G-94WRBJY51J'|send_page_view: false|allow_google_signals: false|allow_ad_personalization_signals: false"
```

Expected:

- First command returns `1` (exactly one GA4 tag in `<head>`).
- Consent mode and privacy-hardening markers are present (`consent default`, `analytics_consent`, `analytics-consent-updated`, `wait_for_update`, `allow_google_signals: false`).

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
- For safest release behavior in this repo, keep local link pointed at primary public production (`chris-wong-dds`) unless intentionally working on mirror-specific deploy tasks.
- Before any manual CLI deploy, inspect `git status --short` so unrelated local changes are not accidentally shipped.

## Editorial compliance note

Allowed doctor naming:

- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Do not combine `Dr.` and `DDS` on one line.
