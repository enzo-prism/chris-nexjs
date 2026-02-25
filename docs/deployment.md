# Deployment Runbook (Vercel)

This runbook defines how to deploy and verify this repository on Vercel.

## Preconditions

- `main` contains all required changes.
- CI checks are green.
- Required environment variables are available.

## Required environment variables

- `DATABASE_URL` for Postgres/Neon persistence.
- `GOOGLE_SITE_VERIFICATION` or `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` for Search Console metadata verification.
- Analytics identifiers used by your active tracking setup.

## Vercel project settings

- Framework preset: Next.js
- Build command: `pnpm run build`
- Install command: `pnpm install`
- Output: Next default output

## Deploy process

1. Push changes to `main` (or open preview PR).
2. Wait for Vercel build + deployment completion.
3. Validate canonical redirect behavior:
- apex host redirects to `www` host.
4. Validate core routes:
- `/`
- `/services`
- `/invisalign`
- `/blog`
- `/contact`
5. Validate API smoke:
- `/api/services`
- `/api/blog-posts`

## Post-deploy verification

Run these checks against preview or production URL:

```bash
SEO_AUDIT_BASE_URL=https://<deployment-domain> pnpm run test:seo:all
LIGHTHOUSE_BASE_URL=https://<deployment-domain> pnpm run check:lighthouse-budget
```

## Rollback strategy

1. Re-promote last known-good deployment in Vercel.
2. Re-run SEO and route smoke checks on rolled-back deployment.
3. Open follow-up fix PR for root cause.

## Operational notes

- Keep `/shared/seo.ts`, `/shared/redirects.ts`, middleware behavior, and `/vercel.json` synchronized for route/canonical changes.
- Keep doctor naming format compliant in content updates:
  - `Dr. Christopher B. Wong`
  - `Christopher B. Wong, DDS`
  - never `Dr. ... DDS` on one line.
