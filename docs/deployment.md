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

- Local repo is clean and synced.
- Release commit is already on `origin/main`.
- Required quality gates pass.
- Required environment variables are configured in Vercel when needed.

## Required environment variables

Core:

- `DATABASE_URL` (required for Postgres/Neon mode; app can fall back to memory mode without it).

Metadata and SEO:

- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

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

## Deploy process (primary public production)

1. Run preflight checks locally (or in CI):
   - `pnpm run test:production`
   - `pnpm run test:gallery` (if gallery media changed)
   - perf suite (`build:perf`, `test:bundle`, `perf:smoke`, `perf:lighthouse`) for performance-sensitive releases
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
```

Expected:

- `https://chriswongdds.com/*` returns a redirect to `https://www.chriswongdds.com/*`.
- `https://www.chriswongdds.com/*` returns `200`.

## Optional mirror sync deploys

If you want all connected production mirrors to receive a fresh deployment immediately (instead of waiting for platform hooks), deploy each project explicitly:

```bash
vercel link --yes --scope enzo-design-prisms-projects --project chris-nextjs
vercel --prod --yes

vercel link --yes --scope enzo-design-prisms-projects --project chriswongdds
vercel --prod --yes
```

## GitHub deployment status verification

Validate that all production environments report success for the same SHA:

```bash
gh api 'repos/enzo-prism/chris-nexjs/deployments?per_page=100' \
  | jq -r '.[] | [.environment, .sha, .created_at] | @tsv' \
  | head -n 20
```

Confirm recent entries for:

- `Production – chris-wong-dds`
- `Production – chris-nextjs`
- `Production – chriswongdds`

with matching SHAs.

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
- `/api/rss.xml`
- `/api/schedule-request`

Verify form flows:

- submit `/contact` form
- submit `/schedule` appointment request

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

## Local link policy

- `.vercel/project.json` determines the default target for `vercel` commands run without explicit project relinking.
- For safest release behavior in this repo, keep local link pointed at primary public production (`chris-wong-dds`) unless intentionally working on mirror-specific deploy tasks.

## Editorial compliance note

Allowed doctor naming:

- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Do not combine `Dr.` and `DDS` on one line.
