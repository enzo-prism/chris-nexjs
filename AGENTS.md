# Repository Guidelines

## Tooling Restrictions
Do not use MCP tools for this project.

## Project Structure & Module Organization
The app now runs on Next.js App Router. `app/` holds route segments, metadata, sitemap/robots, and API route handlers. `client/src` contains shared UI components, route page components, hooks, and utilities used by the Next route shell. `server/` contains repository/storage utilities, while `shared/` stores shared contracts, schema, redirects, and SEO definitions. Deployable static assets are in `public/`; `attached_assets/` is reference-only.

## Build, Test, and Development Commands
Workflows are pnpm-first. Install dependencies with `pnpm install`, copy `.env.example` to `.env`, then run `pnpm run dev` for local Next development. Build with `pnpm run build` and run production mode locally with `pnpm run start`. Use `pnpm run check` for type/safety checks. Core contract checks are `pnpm run test:api`, `pnpm run test:routes`, and `pnpm run test:seo:all`. Performance gates are `pnpm run build:perf`, `pnpm run test:bundle`, `pnpm run perf:smoke`, and `pnpm run perf:lighthouse`. Aggregate release gate: `pnpm run test:production`.

## Coding Style & Naming Conventions
Strict TypeScript is enabled, so prefer explicit return types and readonly data. Name React components in PascalCase, hooks with a `use` prefix, and shared helpers with camelCase filenames. Tailwind drives styling—extend tokens in `tailwind.config.ts` and rely on editor Prettier/Tailwind plugins to keep formatting aligned with existing files.

## Testing Guidelines
Keep checks script-driven under `scripts/` and prefer deterministic CLI gates over ad hoc manual checks. For runtime SEO checks, set `SEO_AUDIT_BASE_URL` when not running on default localhost. Before merge, run at least `pnpm run check`, `pnpm run test:api`, `pnpm run test:routes`, and `pnpm run test:seo:all`.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat: ...`, `fix: ...`, `docs: ...`) with concise subjects. Pull requests should explain intent, summarize changed surfaces (routes/API/SEO/UI), and call out env/config updates. Include screenshots for UI changes and note any script gates run locally.

## Security & Configuration Tips
`drizzle.config.ts` requires `DATABASE_URL`; load it through a local, untracked `.env`. Avoid logging patient identifiers or submission payloads. Keep canonical/redirect behavior synchronized between `shared/redirects.ts`, middleware behavior, and `vercel.json`. Keep doctor name formatting compliant in content updates: use either `Dr. Christopher B. Wong` or `Christopher B. Wong, DDS` (never both in one line).

## Local Preview Tips
`LOCAL_DEV.md` documents local setup, port behavior, runtime SEO audit usage, and troubleshooting. Use it as the source of truth for localhost setup.

## Cursor Cloud specific instructions
- Dependencies are refreshed automatically on startup via `pnpm install` (the update script). Standard commands live in `package.json`, `README.md`, and `LOCAL_DEV.md`.
- `DATABASE_URL` is not required for dev/testing: `server/storage` falls back to in-memory storage, so read/write API routes (e.g. `POST /api/newsletter`, `POST /api/contact`) work end-to-end without a database. Only set `DATABASE_URL` when exercising Drizzle/Postgres mode.
- Non-obvious port gotcha: `pnpm run dev` (`next dev`) serves on `http://localhost:3000` even though `.env` sets `PORT=5000` (Next dev does not bind the listen port from `.env`). When running runtime audit scripts against dev, point `SEO_AUDIT_BASE_URL`/`IMAGE_AUDIT_BASE_URL` at `http://localhost:3000`, or pass `next dev -p 5000` if you specifically need port 5000.
- `pnpm install` logs "Ignored build scripts: bufferutil, esbuild, sharp"; this is expected and harmless — `pnpm run check`, `test:api`, `test:routes`, and the dev server all work with the prebuilt binaries.
