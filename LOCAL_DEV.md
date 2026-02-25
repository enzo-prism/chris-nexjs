# Local Development Guide

Use this guide for reliable local setup, iteration, and pre-push verification.

## Prerequisites

- Node.js `18.18+`
- pnpm `8.7+`

## Setup

1. Install dependencies.

```bash
pnpm install
```

2. Create local env file.

```bash
cp .env.example .env
```

3. Update env values as needed.

Recommended:
- `PORT` if you do not want the default port.
- `DATABASE_URL` when testing Postgres-backed persistence.
- `GOOGLE_SITE_VERIFICATION` for local metadata verification tests.

## Run local app

```bash
pnpm run dev
```

Port behavior:
- Uses `.env` `PORT` if present.
- Otherwise defaults to `3000`.

## Local production smoke

```bash
pnpm run build
pnpm run start
```

## Verification before push

Fast path:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo:all
```

Extended path:

```bash
pnpm run test:design-system
pnpm run test:images
pnpm run test:bundle
pnpm run test:production
```

## Runtime SEO audits

If your app is running on a non-default host/port:

```bash
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:onpage
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:links
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:schema
```

## Troubleshooting

- Stale build artifacts:
  - `rm -rf .next .next-perf`
- Port already in use:
  - change `PORT` in `.env` or stop the existing process.
- Redirect/canonical confusion:
  - verify `/vercel.json`, middleware, and `/shared/redirects.ts` are aligned.
- Metadata mismatch:
  - run `pnpm run test:seo` and `pnpm exec tsx scripts/og-meta-check.ts`.
