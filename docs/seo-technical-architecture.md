# SEO Technical Architecture (2026)

This runbook defines how technical SEO is implemented and validated in production.

## Canonical SEO source of truth

- Primary mapping: `shared/seo.ts`
  - route-level title/description/canonical/robots/indexability
  - honest route-level `lastmod` where a significant change date is known
  - noindex control via `NOINDEX_ROBOTS`
- Runtime metadata builder: `app/[...slug]/page.tsx` (`generateMetadata`)
  - normalizes requested paths to canonical routes
  - applies metadata from `shared/seo.ts`
  - adds route-level Open Graph / Twitter / canonical / robots
  - adds feed discovery via RSS alternate link type

## Social share images (`og:image`)

Every `ogImage` in `shared/seo.ts` must point into `public/images/og/` and be a
JPEG. Unlike on-page images, `og:image` bypasses `next/image` entirely — the URL
in the meta tag is exactly what Facebook, LinkedIn, Slack, iMessage, and
WhatsApp fetch, so source resolution and format reach the crawler unchanged.

Two rules, both learned from real breakage:

- **Size.** The source photos are 2–4 MB PNGs. Served raw they make unfurls slow
  and, past each crawler's own ceiling, silently imageless.
- **Format.** WebP `og:image` is not rendered by X/Twitter or LinkedIn. A small
  WebP still loses its share card.

`scripts/generate-og-images.mjs` (`pnpm run og:generate`) reads every `ogImage`
and `DEFAULT_OG_IMAGE` literal out of `shared/seo.ts`, writes 1200x675
progressive JPEGs — 16:9, matching the source aspect, so nothing is cropped —
into `public/images/og/`, and reports any missing source. Remote URLs
(Cloudinary) are left alone. Re-run it after adding or replacing a source photo,
then repoint the `ogImage` literal at the generated `/images/og/*.jpg`.

## Crawl surfaces

- `app/robots.ts`
  - canonical host: `www.chriswongdds.com`
  - primary sitemap: `https://www.chriswongdds.com/sitemap.xml`
  - disallows noindex routes and `/api/`
  - keep the file minimal and parser-safe for Google:
    - do not add `Crawl-delay`
    - do not add unsupported `Host` directives
    - do not leave duplicate `robots.txt` files in `client/public` or `public`
    - explicitly include `Google-InspectionTool` because Search Console live tests use that token
    - keep blocked-bot groups isolated after the primary allowlist groups
- `app/sitemap.ts`
  - includes indexable static routes from `shared/seo.ts`
  - includes blog post routes from storage
  - emits `lastModified` only when a parseable date exists
  - omits ignored `priority` and `changefreq` hints
  - never emits current-time fallback timestamps for unknown dates
  - known issue: `sitemap.xml` is still a full `urlset`, not a sitemap index, so
    every URL it lists is also listed by the segment sitemaps
    (`sitemap-services.xml`, `sitemap-locations.xml`, `sitemap-blog.xml`) that
    `robots.txt` submits alongside it. The duplicates also disagree on `lastmod`
    format (`2026-07-15T00:00:00.000Z` vs `2026-07-15`). Converting the root to
    a `sitemapindex` is the right shape but changes what `test:seo` and
    `test:seo:freshness` read, so it needs its own pass.
- RSS feed:
  - canonical feed URL: `/rss.xml` (`app/rss.xml/route.ts`)
  - backward-compatible API route: `/api/rss.xml`
  - implementation: `app/api/rss.xml/route.ts`
  - includes Atom self-link, channel metadata, and cache headers

## Metadata consistency rules

1. Exactly one robots tag per indexable page.
2. Every indexable page has:
   - one canonical URL on `https://www.chriswongdds.com/*`
   - one `<title>`
   - one `<h1>`
3. Noindex routes stay out of sitemap.
4. Blog pages remain indexable and expose `BlogPosting`/`Article` schema.
5. Feed discovery is available through:
   - `<link rel=\"alternate\" type=\"application/rss+xml\" ...>`
   - stable `/rss.xml` route.
6. `robots.txt` must stay compatible with Google Search Console live tests:
   - no unsupported `Crawl-delay`
   - no unsupported `Host`
   - no ambiguous empty user-agent groups
   - explicit allow groups for `Googlebot` and `Google-InspectionTool`
7. Canonical host redirects should be permanent (`301`/`308`), not temporary (`307`).
8. Retired city pages and duplicate article URLs must use one-hop redirects and remain absent from sitemaps and internal links.
9. The practice `Dentist`/`Organization` entity schema belongs on the homepage. Nearby-city pages must not represent separate local businesses.
10. Visible third-party reviews may remain for trust, but the practice does not emit self-serving `Review` or `aggregateRating` schema.
11. Schema properties are omitted, never emitted empty. `specialOpeningHoursSpecification` disappears once every temporary-hours entry has expired rather than serializing as `[]`.
12. Display copy is not reused as schema values without checking the relationship it asserts. `doctorInfo.credentials` is About-page copy and names the dental school as "… Graduate"; mapped straight into `memberOf` it invents an organization by that name and duplicates `alumniOf`, so the alumni entry is filtered out in `buildPersonSchema`.
13. Every `ogImage` resolves to a JPEG under `public/images/og/` (see "Social share images").

## Automated SEO gates

- Static regression:
  - `pnpm run test:seo`
  - rejects `robots` configs that reintroduce `crawlDelay`
  - rejects duplicate static `robots.txt` files
  - rejects missing explicit `Google-InspectionTool` rules
- Runtime on-page:
  - `pnpm run test:seo:onpage`
  - validates title/description thresholds, canonical, H1 count
  - validates single robots meta tag and RSS alternate link
- Runtime link graph:
  - `pnpm run test:seo:links`
- Runtime structured data:
  - `pnpm run test:seo:schema`
- Full suite:
  - `pnpm run test:seo:all`

For non-default hosts:

```bash
SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all
```

## Release checklist (SEO-specific)

1. `pnpm run test:routes`
2. `pnpm run test:seo`
3. production-mode runtime checks via `pnpm run test:production` (includes `test:seo:all`)
4. post-deploy live verification:
   - `https://www.chriswongdds.com/robots.txt`
   - `https://www.chriswongdds.com/sitemap.xml`
   - `https://www.chriswongdds.com/rss.xml`
   - `SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all`
   - Google Search Console live test for `/` and `/about`
   - confirm the live test shows:
     - crawl allowed
     - page fetch successful
     - not blocked by robots.txt

## Search Console incident note

If Search Console reports `Page cannot be crawled: Blocked by robots.txt` while direct `curl` checks still show `Allow: /`, treat the parser itself as suspect before assuming transport is healthy.

Known failure mode:

- unsupported directives like `Crawl-delay` mixed with later bot-specific block groups can be interpreted inconsistently by Google tooling
- duplicate legacy `client/public/robots.txt` files can preserve stale crawler rules even after the App Router robots route is fixed
- Search Console live tests use `Google-InspectionTool`, which should be represented explicitly instead of relying on wildcard matching
- this can surface as:
  - public `robots.txt` looks open
  - page fetch returns `200`
  - Search Console live test still reports `blocked by robots.txt`

First response:

1. remove duplicate static `robots.txt` files and keep one canonical policy source
2. simplify `robots.txt` to explicit `Googlebot`, `Google-InspectionTool`, and `User-agent: *` allow groups plus blocked-bot groups
3. remove unsupported directives
4. redeploy
5. rerun the Search Console live test
