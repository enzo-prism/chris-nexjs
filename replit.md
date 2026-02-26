# Replit.md

## Overview

Next.js App Router website for Christopher B. Wong, DDS with:
- service/location marketing pages
- blog and RSS
- lead forms (appointments, contact, newsletter)
- SEO automation
- media-rich gallery and changelog pages

## Architecture

- Framework: Next.js 14 (App Router).
- UI: React 18 + TypeScript + Tailwind + shadcn/ui.
- Rendering: explicit routes plus catch-all compatibility route.
- API handlers: `app/api/*`.
- SEO: `shared/seo.ts`, `app/sitemap.ts`, `app/robots.ts`, metadata in route generation.
- Redirects/canonical:
  - host-level in `vercel.json`
  - path-level in `middleware.ts` + `shared/redirects.ts`
- Storage mode:
  - Postgres/Neon via `DATABASE_URL` when available
  - memory fallback when DB is unavailable

## Development workflow

- Install: `pnpm install`
- Env setup: `cp .env.example .env`
- Start dev: `pnpm run dev`
- Main quality checks:
  - `pnpm run check`
  - `pnpm run test:api`
  - `pnpm run test:routes`
  - `pnpm run test:gallery`
  - `pnpm run test:design-system`
  - `pnpm run test:images`
  - `pnpm run test:seo:all`

## Deployment strategy

- Platform: Vercel
- Build: `pnpm run build`
- Start: `pnpm run start`
- Canonical domain: `https://www.chriswongdds.com`

## Editorial rule

Allowed doctor naming:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Never combine `Dr.` and `DDS` on one line.
