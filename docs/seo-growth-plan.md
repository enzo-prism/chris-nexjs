# SEO Growth Program (Local Lead Focus)

Operational SEO plan for sustainable local lead growth while protecting technical quality in CI.

## 90-day objectives

1. Increase non-brand local organic clicks by 25%.
2. Increase organic CTR on primary service/location pages by 15%.
3. Increase organic conversions (calls + forms) by 20%.

## Technical success criteria

1. All indexable routes from `getIndexablePaths()` are reachable and self-canonical.
2. No noindex routes leak into sitemap output.
3. At least 95% title-length compliance on indexable pages.
4. At least 95% description-length compliance on indexable pages.
5. Exactly one `<h1>` on each indexable page.
6. Zero orphan indexable pages from root crawl.
7. JSON-LD parses cleanly across audited routes.

## Enforced SEO gates

Run all:

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

Runtime audit base URL:
- default: `SEO_AUDIT_BASE_URL=http://localhost:3000`
- preview override:

```bash
SEO_AUDIT_BASE_URL=https://preview-domain.vercel.app pnpm run test:seo:all
```

## CI policy

CI must fail if any SEO gate fails.

Current pipeline includes:
1. Static SEO regression check.
2. Runtime on-page audit.
3. Runtime link-graph audit.
4. Runtime structured-data audit.

## Content operations cadence

1. Publish 2-4 high-intent posts monthly.
2. Refresh top service/location pages every 6-8 weeks.
3. Weekly Search Console review:
- coverage/indexing drift
- query opportunity mining
- CTR drops by landing page
4. Weekly Google Business Profile updates aligned to service taxonomy.

## Editorial guardrails

1. Doctor naming style:
- `Dr. Christopher B. Wong` or `Christopher B. Wong, DDS`
- never `Dr. ... DDS` in the same line
2. Every new blog article must include:
- one internal service-page link
- one related-post link
- intent-aligned title/H1 and structured summary

## Ownership

1. Engineering: metadata/canonical/schema/link integrity and gate maintenance.
2. Marketing/content: content refreshes, FAQ updates, intent coverage.
3. Operations: Search Console and GBP workflow plus monthly reporting.
