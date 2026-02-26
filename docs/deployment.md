# Deployment Runbook (Vercel)

Release procedure for production-safe deployments.

## Preconditions

- Changes are merged to `main` or available in a preview branch.
- Local or CI quality checks pass.
- Required environment variables are configured in Vercel.

## Required environment variables

Core:
- `DATABASE_URL` (required for Postgres/Neon mode; app can fall back to memory mode without it).

Metadata and SEO:
- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

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

## Deploy process

1. Push changes or merge PR.
2. Wait for Vercel build and deployment success.
3. Verify canonical host behavior:
  - `https://chriswongdds.com/*` redirects to `https://www.chriswongdds.com/*`.
4. Smoke key pages:
  - `/`
  - `/services`
  - `/invisalign`
  - `/gallery`
  - `/blog`
  - `/changelog`
  - `/contact`
5. Smoke key APIs:
  - `/api/services`
  - `/api/blog-posts`
  - `/api/testimonials`
  - `/api/rss.xml`

## Push-domain deployment notes

After a production push:

- Confirm the main production URL for this project in Vercel (typically `https://chris-nextjs.vercel.app` in this environment).
- Confirm redirect and canonical behavior from push domain to canonical host:
  - `https://chris-nextjs.vercel.app/` should render the app successfully.
  - Canonical redirect for `https://chriswongdds.com/*` should still land on `https://www.chriswongdds.com/*`.
- Confirm API reachability from push domain:
  - `https://chris-nextjs.vercel.app/api/chat`
  - `https://chris-nextjs.vercel.app/api/schedule-request`

Useful commands:

```bash
vercel alias list
vercel inspect chris-nextjs
```

## Vercel CLI workflow

From a synced `main` branch:

```bash
vercel link
vercel env pull .env.local
```

Optional: sync local environment for preview validation:

```bash
VERCEL_ORG_ID=... VERCEL_PROJECT_ID=... vercel deploy --prebuilt
```

Production deploy:

```bash
vercel deploy --prod
```

Useful flags:

- `vercel deploy --dry-run` to validate config before upload.
- `vercel deploy --confirm` to skip interactive prompts in CI.
- `vercel logs <deployment-url>` to inspect runtime errors.
- `vercel --scope=<team-slug> --prod` for team-scoped projects.

## Verification commands against preview or production

```bash
SEO_AUDIT_BASE_URL=https://<deployment-domain> pnpm run test:seo:all
IMAGE_AUDIT_BASE_URL=https://<deployment-domain> pnpm run test:images
LIGHTHOUSE_BASE_URL=https://<deployment-domain> pnpm run check:lighthouse-budget
```

## Rollback

1. Re-promote last known-good deployment in Vercel.
2. Re-run route and SEO smoke checks on rolled-back build.
3. Open a follow-up fix PR with root-cause notes.

## Canonical/redirect ownership

Keep these files aligned whenever routes or SEO paths change:
- `shared/seo.ts`
- `shared/redirects.ts`
- `middleware.ts`
- `vercel.json`

## Deployment source of truth check

- Keep `.vercel/project.json` aligned with your selected production project.
- Verify any new routing, environment, or redirects through the Vercel dashboard after each deploy.

## Editorial compliance note

Allowed doctor naming:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Do not combine `Dr.` and `DDS` on one line.
