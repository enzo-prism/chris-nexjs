# SEO Growth Program (Local Lead Focus)

Operational SEO plan for sustained local lead growth while preserving technical quality.

## Current baseline snapshot

- Canonical SEO definitions: `44`
- Indexable routes: `40`
- Noindex routes: `4`
  - `/zoom-whitening/schedule`
  - `/thank-you`
  - `/analytics`
  - `/ga-test`
- Metadata source of truth: `shared/seo.ts`

## 90-day growth targets

1. Increase non-brand local organic clicks by 25%.
2. Increase CTR on priority service/location pages by 15%.
3. Increase organic conversions (calls + forms) by 20%.

## Technical success criteria

1. Every indexable route in `getIndexablePaths()` is reachable and self-canonical.
2. No noindex route appears in sitemap.
3. At least 95% title compliance and 95% description compliance.
4. Exactly one `<h1>` per indexable route.
5. Zero orphan indexable routes.
6. JSON-LD parses cleanly across audited routes.
7. Redirect chains resolve to canonical destinations in one hop when possible.

## SEO gate commands

Full suite:

```bash
pnpm run test:seo:all
```

Individual:

```bash
pnpm run test:seo
pnpm run test:seo:onpage
pnpm run test:seo:links
pnpm run test:seo:schema
```

Runtime base URL:
- default scripts use `http://localhost:3000`
- local dev often runs on `5000`, so use:

```bash
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:all
```

Preview verification example:

```bash
SEO_AUDIT_BASE_URL=https://<preview-domain>.vercel.app pnpm run test:seo:all
```

## Content and entity strategy

1. Service pages:
- keep one clear primary intent per URL
- maintain unique value proposition and FAQ scope
2. Location pages:
- keep city-level uniqueness and internal service links
3. Blog:
- publish 2 to 4 high-intent posts monthly
- each post must link to at least one service page and one related post
4. Gallery page:
- preserve accessibility metadata (`alt`, `title`, `description`) in media data model
- keep media performance behavior stable (hero autoplay muted; in-grid click-to-play)
5. Changelog page:
- keep update transparency while maintaining clean metadata and crawl behavior

## Weekly operating cadence

1. Search Console:
- coverage/indexing drift review
- query opportunity review
- CTR loss review by landing page
2. Google Business Profile:
- category and service alignment check
- update posting cadence and response hygiene
3. Content updates:
- refresh top service/location pages every 6 to 8 weeks
- align updates with query and conversion patterns

## Editorial guardrails

Doctor naming:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Never use `Dr.` and `DDS` on one line.

## Ownership

1. Engineering:
- metadata, canonical, schema, redirects, SEO gate maintenance
2. Content/marketing:
- local intent pages, blog cadence, copy refreshes
3. Operations:
- Search Console and GBP workflow, monthly KPI reporting
