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
`drizzle.config.ts` requires `DATABASE_URL`; load it through a local, untracked `.env`. Avoid logging patient identifiers or submission payloads. Keep canonical/redirect behavior synchronized between `shared/redirects.ts`, middleware behavior, and `vercel.json`. Keep doctor name formatting compliant in content updates: use either `Dr. Christopher B. Wong` or `Christopher B. Wong, DDS` (never both in one line). Payment-method copy must match accepted methods: Visa, MasterCard, FSA/HSA, and the in-house dental plan (no CareCredit unless product changes); keep Insurance UI and the `data.ts` payment FAQ in lockstep. Avoid keyword-stuffed body openers and do not put SEO phrases into Person **or** WebSite `alternateName`. Person schema `name` is `Christopher B. Wong` with honorificPrefix/Suffix — do not duplicate Dr. in the name string. `/thank-you` meta must not claim a scheduled appointment. After substantive copy changes, update `LASTMOD_OVERRIDES` in `shared/seo.ts` for touched routes. Patient quotes shown anywhere on the site live in `client/src/data/reviewHighlights.ts` (homepage), `client/src/data/serviceReviews.ts` (service/location pages), and `client/src/data/team.ts` (team cards); every quote must be a verbatim excerpt of the named reviewer's 5-star review in the Google export, and "named in N+ reviews" counts must never overstate (`pnpm test:reviews` enforces both). Lead attribution (`shared/attribution.ts`, `client/src/lib/attribution.ts`) may carry only a channel, landing path, referrer host, and `utm_*` tags. Never add identifiers.

## Local Preview Tips
`LOCAL_DEV.md` documents local setup, port behavior, runtime SEO audit usage, and troubleshooting. Use it as the source of truth for localhost setup.

## Seasonal layer (October)
A small, optional Halloween layer that switches itself on October 1–31 (America/Los_Angeles) and off on November 1 with no redeploy. It is delight on top of the design system, never a re-theme.
- **Switch:** `shared/seasonal.ts` builds an inline `<head>` script (`SeasonScript`, rendered in `app/layout.tsx`) that sets `<html data-cw-season="halloween">` before first paint and swaps the favicon to `public/seasonal/<id>/icon.svg`. It also re-applies the attribute if React resets `<html>` after a hydration error (several routes throw React #418 today). `?season=halloween` previews in any month (rest of the tab session), `?season=off` opts a browser out, `?season=auto` resets.
- **Art:** every piece is hidden by default (`.cw-season-only`) and keyed off that attribute in the "Seasonal layer" block of `app/globals.css`. Art is static SVG in `public/seasonal/<id>/`, used as CSS backgrounds so it only downloads in season. `.cw-season-only` is unlayered and beats Tailwind's `hidden`, so put breakpoint visibility on an inner wrapper.
- **Where:** homepage hero (greeting chip, a dusk tint, the candlelit "Palo Alto" underline, harvest moon, once-per-session bats, desktop ghost-tooth with a hover note), jack-o'-lanterns in the homepage redwood band, a spider that drops beside the review ribbon (`SpiderDrop`), cobweb corners on cards (`.cw-cobweb`, only inside a non-quiet `<main>`), a homepage treat-tips band, the "Ready when you are" band (crescent and stars), the default footer greeting (pure CSS `::before`), and the 404 page. `/schedule` (conversion chrome), `/emergency-dental`, `/thank-you`, legal pages, CTAs, phone links, forms, the header, and the mobile action bar stay undecorated (AppPageShell marks those routes `<main data-cw-quiet>` and the footer opts out with `data-cw-quiet`).
- **Budgets:** shared chrome must stay JS-free. Footer.tsx must not import `components/seasonal` or `@shared/seasonal`; client pieces (`SeasonalClient.tsx`) are homepage/404 only. `pnpm test:seasonal` guards this, the calendar boundaries, and the undecorated surfaces.
- **Motion:** transform/opacity/clip only, no layout shift, every one-off animation ends within 5s, skipped for reduced motion (and bats/twinkles for Save-Data).
- **Treat tips copy:** keep it general, ADA-aligned home-care guidance. Never present it as Dr. Wong's personal advice or make outcome claims.
- **Next year:** add a new `SeasonalTheme` (new `id` and dates) and a new versioned `public/seasonal/<id>/` folder, then update the CSS `url()`s. To retire it, set `activeSeason = null`, which ships no head script.
