# SEO Implementation Backlog (2026)

Technical SEO execution plan and ticket queue for `chris-nextjs`.

## Scope

This backlog covers:
- Internal linking quality and crawl path depth.
- Structured data completeness and validation coverage.
- Crawl-priority tuning for sitemap and robots behavior.

## Completed in this pass

- Added `SearchAction` to global `WebSite` schema with `urlTemplate` target `/blog?q={search_term_string}`.
- Wired `/blog` query handling for `q` so schema search target maps to real page behavior.
- Added `CollectionPage` + `ItemList` schema on `/services`.
- Added `CollectionPage` + location `ItemList` schema on `/locations`.
- Upgraded footer service links from hash anchors to canonical treatment URLs to strengthen internal link equity distribution.
- Tuned sitemap defaults by SEO cluster (`service`, `location`, `blog`, `trust`, `legal`) for better crawl-priority signals.
- Tuned blog sitemap priority/changefreq dynamically by recency.
- Expanded schema regression checks to enforce:
  - homepage `WebSite` includes `SearchAction`
  - `/services` includes `CollectionPage` and `ItemList`
  - `/locations` includes `CollectionPage` and `ItemList`

## Prioritized next tickets

## P0 (ship in next release cycle)

1. Ticket: Add `MedicalBusiness` profile enrichment
- Goal: strengthen local entity understanding for dentist intent.
- Change:
  - Extend organization/dentist schema with `founder`, `knowsAbout`, `availableService`, and `serviceArea` harmonized with location pages.
  - Ensure all `@id` references resolve to canonical URLs.
- Acceptance criteria:
  - `pnpm run test:seo:schema` passes.
  - No `JSON-LD url points to non-canonical host` failures.
  - Rich Results Test shows no critical errors on `/`, `/services`, `/locations`.

2. Ticket: Add explicit blog index schema (`Blog` + `ItemList`)
- Goal: improve blog hub comprehension and article discoverability.
- Change:
  - Add `Blog` schema to `/blog` plus ordered `ItemList` of latest posts.
  - Include article canonical URLs and `datePublished` where available.
- Acceptance criteria:
  - `/blog` contains `Blog` and `ItemList` nodes.
  - Schema audit extended to enforce these nodes.

3. Ticket: Internal links QA guardrail by cluster
- Goal: prevent weak linking regressions.
- Change:
  - Extend `scripts/seo-links-audit.ts` with per-cluster thresholds:
    - service pages: minimum 3 contextual links to other indexable service/location pages.
    - location pages: minimum 3 links to service pages.
- Acceptance criteria:
  - audit fails on threshold miss and reports exact route + deficit count.

## P1 (high value, lower urgency)

4. Ticket: Build sitemap partitioning (`/sitemap-services.xml`, `/sitemap-locations.xml`, `/sitemap-blog.xml`)
- Goal: improve crawler efficiency and diagnostic clarity.
- Change:
  - Create segmented sitemap routes and include all in `robots.txt` sitemap list.
- Acceptance criteria:
  - each sitemap validates and returns only expected segment URLs.
  - robots references all sitemap endpoints.

5. Ticket: Add topical in-content link modules for legal/trust pages
- Goal: route authority from low-commercial pages into service/location hubs.
- Change:
  - Add curated links from `/privacy-policy`, `/terms`, `/hipaa`, `/accessibility` to `/services`, `/locations`, `/contact`.
- Acceptance criteria:
  - pages remain policy compliant.
  - links audit confirms those pages now contribute internal link equity.

6. Ticket: Add stale-content watchdog for `lastmod`
- Goal: keep sitemap freshness signals trustworthy.
- Change:
  - Add script that flags any indexable page with stale `lastmod` older than target threshold for its cluster.
- Acceptance criteria:
  - script produces machine-readable report and non-zero exit on stale critical routes.

## P2 (strategic enhancements)

7. Ticket: Add schema graph consistency checks
- Goal: enforce schema graph integrity at scale.
- Change:
  - Add tests for orphan `@id` references, duplicate IDs, and type/profile conflicts.
- Acceptance criteria:
  - schema audit emits route-level diagnostics for graph violations.

8. Ticket: Add crawl-budget simulation report
- Goal: identify low-value crawl sinks and link depth bottlenecks.
- Change:
  - Extend link audit to output depth, in-degree, out-degree, and near-orphan warnings in `docs/reports/seo-link-graph.json`.
- Acceptance criteria:
  - report generated in CI and attached as artifact.

## Operational checklist

Run these after each SEO release:

```bash
pnpm run check
pnpm run test:routes
pnpm run test:seo:all
SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all
```

Optional deeper verification:

```bash
LIGHTHOUSE_BASE_URL=https://www.chriswongdds.com LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```
