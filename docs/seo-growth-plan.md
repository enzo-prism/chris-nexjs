# SEO Growth Program (Local Lead Focus)

This document operationalizes the SEO implementation in this repository so delivery can be tracked as product work, not one-off fixes.

## Objectives

1. Increase non-brand local organic clicks by 25% in 90 days.
2. Increase organic CTR on core service/location pages by 15%.
3. Increase organic conversions (calls + form submissions) by 20%.

## Technical Success Criteria

1. All indexable routes from `getIndexablePaths()` are crawlable and self-canonical.
2. No noindex route appears in sitemap output.
3. At least 95% of indexable routes have title lengths in target bounds.
4. At least 95% of indexable routes have description lengths in target bounds.
5. Every indexable route has exactly one `<h1>`.
6. Zero orphan indexable routes in internal crawl.
7. JSON-LD blocks parse successfully with no page-type schema regressions.

## Test Gates

Run all SEO gates together:

```bash
pnpm run test:seo:all
```

Run individually:

```bash
pnpm run test:seo
pnpm run test:seo:onpage
pnpm run test:seo:links
pnpm run test:seo:schema
```

`test:seo:onpage`, `test:seo:links`, and `test:seo:schema` require a running app URL. By default they use:

- `SEO_AUDIT_BASE_URL=http://localhost:3000`

Override in CI/preview:

```bash
SEO_AUDIT_BASE_URL=https://preview-domain.vercel.app pnpm run test:seo:all
```

## CI Policy

CI should fail if any SEO test gate fails. The current CI workflow runs:

1. Static checks (`test:seo`).
2. Runtime audits (`test:seo:onpage`, `test:seo:links`, `test:seo:schema`) against a built app.

## Content + Local Operations Cadence

1. Publish 2-4 intent-driven posts monthly.
2. Refresh top service/location pages every 6-8 weeks.
3. Weekly Search Console review:
   - Coverage/indexing changes
   - Query opportunities
   - CTR drops on priority pages
4. Weekly Google Business Profile updates aligned to service taxonomy.

## Ownership

1. Engineering owns metadata/canonical/schema/link integrity and CI gates.
2. Marketing/content owns copy freshness, FAQ expansion, and query-driven edits.
3. Operations owns Search Console + GBP cadence and monthly performance readouts.
