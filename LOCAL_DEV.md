# Local Development with pnpm (Next.js)

A reliable local setup for the migrated Next.js version. Use this during development and testing.

## 1. Prerequisites

- Node.js **18.18+**
- pnpm **8.7+** (`npm install -g pnpm` if needed)
- Optional: PostgreSQL/Neon `DATABASE_URL` for persistence tests

## 2. Install and configure

1. Install dependencies

```bash
pnpm install
```

2. Copy environment template

```bash
cp .env.example .env
```

3. Set values used by the app (especially in Vercel-style env mode)
- `DATABASE_URL` (optional while validating in-memory fallback)
- `NODE_ENV`
- any analytics/test IDs already used by your runtime

## 3. Run

```bash
pnpm run dev
```

The Next.js app serves on `http://localhost:3000`.

If you run into port conflicts, ensure nothing else is bound to 3000.

## 4. Verification commands

Run these before pushing a change:

- `pnpm run check`
- `pnpm run test:api`
- `pnpm run test:seo`
- `pnpm exec tsx scripts/og-meta-check.ts`
- `pnpm exec tsx client/src/lib/analytics.test.ts` (legacy smoke check)

## 5. Production preview

```bash
pnpm run build
pnpm run start
```

Open the production-equivalent runtime to spot SSR, route, and metadata regressions.

## 6. Troubleshooting

- **Build includes old caches**: remove stale artifacts
  - `rm -rf .next`
- **Redirect confusion while debugging**: middleware/`vercel.json` are authoritative for canonicalization in production.
- **SEO route metadata mismatch**: validate with `pnpm run test:seo` and `scripts/og-meta-check.ts`.
