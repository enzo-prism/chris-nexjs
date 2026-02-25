# Replit.md

## Overview

This repository now runs as a Next.js App Router application for Christopher B. Wong, DDS in Palo Alto. It includes marketing pages, local SEO pages, blog content, lead forms, and API contracts for services/search/appointments/contact flows.

## Current architecture

### Web app

- Framework: Next.js 14 (App Router)
- UI: React 18 + TypeScript + Tailwind + shadcn/ui
- Routing: App Router segments with compatibility catch-all route
- Metadata/SEO: centralized in shared SEO map + Next metadata API

### API and storage

- API runtime: Next route handlers in `/app/api/*`
- Validation: Zod + shared schema contracts
- Storage: repository layer under `/server/storage/*`
- Database: Postgres/Neon via `DATABASE_URL` when enabled

### Compatibility layer

- Legacy route aliases are mapped in `/shared/redirects.ts`
- Canonical host redirects are configured in `/vercel.json`
- Transitional client shell utilities still exist for incremental migration paths

## Development workflow

- Install: `pnpm install`
- Configure env: `cp .env.example .env`
- Start dev: `pnpm run dev`
- Type/safety check: `pnpm run check`
- Release gate: `pnpm run test:production`

## Key command groups

- Routing/API checks:
  - `pnpm run test:api`
  - `pnpm run test:routes`
- SEO checks:
  - `pnpm run test:seo`
  - `pnpm run test:seo:all`
- UI/asset checks:
  - `pnpm run test:design-system`
  - `pnpm run test:images`
- Performance:
  - `pnpm run build:perf`
  - `pnpm run perf:smoke`
  - `pnpm run perf:lighthouse`

## Deployment strategy

- Primary platform: Vercel
- Build: `pnpm run build`
- Start: `pnpm run start`
- Canonical host: `https://www.chriswongdds.com`

## Content/editorial rule

Doctor name format must be one of:

- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Do not place `Dr.` and `DDS` in the same line.
