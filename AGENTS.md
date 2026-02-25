# Repository Guidelines

## Tooling Restrictions
Do not use MCP tools for this project.

## Project Structure & Module Organization
The workspace splits into `client`, `server`, and `shared`. `client/src` contains the Vite React app—UI primitives in `components`, pages in `pages`, hooks in `hooks`, utilities in `lib`. Express lives in `server` (`index.ts` bootstrap, `routes.ts` handlers, `storage.ts` in-memory data, `vite.ts` dev wiring) and shares schema types from `shared/schema.ts`; deployable assets sit in `public`, while `attached_assets/` is reference-only.

## Build, Test, and Development Commands
Workflows are pnpm-first. Install dependencies with `pnpm install`, copy `.env.example` to `.env`, then run `pnpm run dev` to boot the Express+Vite dev server on port 5000. Use `pnpm run build` to create both the client bundle and esbuild server bundle (output in `dist/`) and `pnpm run start` to serve that production build. Guard type safety with `pnpm run check`, and when modifying `shared/schema.ts` sync the database via `DATABASE_URL=… pnpm run db:push`. The analytics smoke test still runs through `pnpm exec tsx client/src/lib/analytics.test.ts`.

## Coding Style & Naming Conventions
Strict TypeScript is enabled, so prefer explicit return types and readonly data. Name React components in PascalCase, hooks with a `use` prefix, and shared helpers with camelCase filenames. Tailwind drives styling—extend tokens in `tailwind.config.ts` and rely on editor Prettier/Tailwind plugins to keep formatting aligned with existing files.

## Testing Guidelines
Tests are minimal; run the analytics smoke check with `pnpm exec tsx client/src/lib/analytics.test.ts`. Co-locate new `.test.ts` or `.test.tsx` files beside the code they cover so Vite or tsx can execute them. Favour direct imports of handler functions from `server/routes.ts` for integration coverage and keep `pnpm run check` as the required pre-push gate.

## Commit & Pull Request Guidelines
With no Git history in this snapshot, adopt Conventional Commits (`feat: add booking form validation`) and keep subject lines under 72 characters. Pull requests should explain motivation, outline key code paths, flag schema or env changes, and add UI screenshots when relevant. Confirm `pnpm run build` or at minimum `pnpm run check` before requesting review.

## Security & Configuration Tips
`drizzle.config.ts` requires `DATABASE_URL`; load it through a local, untracked `.env`. Avoid logging patient identifiers or session data, especially when touching `server/storage.ts`. Update the redirect guard in `server/index.ts` when new domains are introduced and keep `public/` assets optimized for the one-year cache header.

## Local Preview Tips
`LOCAL_DEV.md` documents the exact pnpm workflow (install prerequisites, copy `.env.example`, run `pnpm run dev`, and troubleshooting REUSE_PORT, fallback ports, or analytics cache issues). Follow it when spinning up a localhost preview.
