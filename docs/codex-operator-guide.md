# Codex Operator Guide

Start here when you need to get productive in this repo quickly.
This guide is optimized for future Codex/operator sessions and focuses on practical repo behavior, not product requirements.

## What this guide is for

Use this file to avoid re-discovering the same repo-specific rules each session:

- where to start reading
- which commands are safe defaults
- how releases should normally happen
- where analytics ownership lives
- what can produce misleading failures

## Fast orientation path

Read in this order unless the task is very narrow:

1. `README.md`
   - architecture, commands, deployment topology, analytics summary
2. `LOCAL_DEV.md`
   - local ports, build/test flow, troubleshooting
3. `docs/testing.md`
   - release gates and task-specific checks
4. `docs/deployment.md`
   - production verification and Vercel workflow
5. `docs/analytics.md`
   - only if touching tracking, consent, or Vercel Analytics

Then load topic-specific docs only as needed:

- SEO: `docs/seo-technical-architecture.md`, `docs/seo-growth-plan.md`, `docs/seo-keyword-map.md`
- Gallery/media: `docs/gallery.md`
- Reviews data: `docs/reviews-data.md`
- Changelog flow: `docs/changelog.md`
- Scheduling flow: `docs/scheduling-*.md`

## Repo rules that matter in practice

- Do not use MCP tools for this project. Use local shell commands, pnpm scripts, git, and the Vercel CLI instead.
- Prefer `pnpm` for all package and script execution.
- Dev usually runs on `http://localhost:5000` because `.env.example` sets `PORT=5000`.
- Production test scripts usually assume `http://localhost:3000` unless `PRODUCTION_TEST_PORT` or `PRODUCTION_TEST_BASE_URL` is set.
- Allowed doctor naming is:
  - `Dr. Christopher B. Wong`
  - `Christopher B. Wong, DDS`
- Never combine `Dr.` and `DDS` on the same line.

## Safe default workflow

### For most code, content, and SEO work

Run the smallest useful set first:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
```

Then add task-specific checks:

- SEO work: `pnpm run test:seo:all`
- Gallery/media work: `pnpm run test:gallery` and `pnpm run test:images`
- design-system/shared UI work: `pnpm run test:design-system`
- release candidate: `pnpm run test:production`

### For production releases

Default release path:

1. Verify local changes are intentional.
2. Run the required gates.
3. Commit and push to `main`.
4. Let Vercel deploy production from the Git commit.
5. Verify the live deployment with the Vercel CLI and runtime smoke checks.

Why this is the default:

- this repo sometimes has unrelated local dirt
- a direct local `vercel --prod --yes` can upload uncommitted workspace state
- Git-based deploys are easier to audit and reproduce

Use manual local production deploys only when both are true:

- the workspace is clean
- you intentionally want a CLI-driven production deploy

## Important gotcha: `.next/types` can make `check` look flaky

`tsconfig.json` includes:

```json
".next/types/**/*.ts"
```

That means:

- `pnpm run check` depends on generated Next route types
- if `.next/types` is missing, `check` can fail until a build has been run
- if `build` is actively rewriting `.next`, `check` can also fail or become misleading

Safe rule:

- do not run `pnpm run check` in parallel with `pnpm run build`, `pnpm run build:perf`, `pnpm run test:bundle`, or `pnpm run test:production`

Recovery:

```bash
rm -rf .next
pnpm run build
pnpm run check
```

## Deployment reality in this repo

Public production source of truth:

- Vercel project: `chris-wong-dds`
- Domains:
  - `https://www.chriswongdds.com`
  - `https://chriswongdds.com`

Mirrors also exist:

- `chris-nextjs`
- `chriswongdds`

Repository of record:

- GitHub repo: `enzo-prism/chris-nexjs`
- release branch: `main`

Common verification commands:

```bash
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
vercel ls chris-wong-dds --prod
vercel inspect https://www.chriswongdds.com
curl -I https://chriswongdds.com
curl -I https://www.chriswongdds.com
```

## Analytics ownership map

Use this when adding, debugging, or documenting analytics behavior.

### GA4 ownership

Primary files:

- `app/layout.tsx`
- `client/src/components/common/GoogleAnalytics.tsx`
- `client/src/lib/analytics.ts`
- `shared/analytics.ts`

Current behavior:

- GA bootstrap is global
- Consent Mode defaults to denied
- SPA page views are manual
- custom GA events are consent-gated
- `/analytics` and `/ga-test` are intentionally excluded

### Vercel Web Analytics ownership

Primary files:

- `client/src/components/common/VercelAnalytics.tsx`
- `client/src/lib/analytics.ts`
- `server/vercelAnalytics.ts`
- `app/api/contact/route.ts`
- `app/api/newsletter/route.ts`
- `app/api/schedule-request/route.ts`

Current behavior:

- Vercel page views are mounted from the root layout via the wrapper component
- `beforeSend` excludes `/analytics` and `/ga-test`
- browser-side custom events are flat and consent-gated
- server-side lead events fire only after successful writes
- Vercel event payloads must stay free of PII

When adding a new event:

1. Decide whether it belongs in GA4, Vercel, or both.
2. Keep naming intentional and stable.
3. Keep Vercel properties flat and non-sensitive.
4. Update `docs/analytics.md` if the event changes the supported tracking surface.

## Where common changes usually live

### Routing, canonicals, redirects

- `app/`
- `shared/seo.ts`
- `shared/redirects.ts`
- `middleware.ts`
- `vercel.json`

If one changes, verify the others still agree.

### Lead flows and forms

- client UI: `client/src/components/forms/*`
- API routes: `app/api/*`
- storage and contracts: `server/`, `shared/`

### Gallery

- route and UI under `app/` and `client/src`
- data contract under `client/src/data/galleryMedia.ts`
- validate with `pnpm run test:gallery`

### Reviews

- raw source in `attached_assets/`
- import/audit scripts in `scripts/`
- follow `docs/reviews-data.md`

## Recommended task checklists

### Content or metadata update

```bash
pnpm run check
pnpm run test:routes
pnpm run test:seo:all
```

### API or form behavior change

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
```

### Release candidate

```bash
pnpm run test:production
```

Add extras only if touched:

- `pnpm run test:gallery`
- `pnpm run test:reviews`
- perf suite

## When the workspace is dirty

Treat unrelated local changes as real unless you know otherwise.

Before shipping:

- inspect `git status --short`
- avoid bundling unrelated files into the release
- prefer Git-based production deploys over local `vercel --prod --yes`

If a file is dirty and unrelated, leave it alone unless the task explicitly requires it.

## Canonical docs by topic

- project overview: `README.md`
- local workflow and troubleshooting: `LOCAL_DEV.md`
- testing and release gates: `docs/testing.md`
- deployment and verification: `docs/deployment.md`
- analytics and consent: `docs/analytics.md`

If you improve a workflow that future sessions will likely repeat, update the canonical doc rather than leaving the knowledge only in commit history.
