# SEO Technical Architecture (2026)

This runbook defines how technical SEO is implemented and validated in production.

## Canonical SEO source of truth

- Primary mapping: `shared/seo.ts`
  - route-level title/description/canonical/robots/indexability
  - sitemap hints (`priority`, `changefreq`, optional `lastmod`)
  - noindex control via `NOINDEX_ROBOTS`
- Runtime metadata builder: `app/[...slug]/page.tsx` (`generateMetadata`)
  - normalizes requested paths to canonical routes
  - applies metadata from `shared/seo.ts`
  - adds route-level Open Graph / Twitter / canonical / robots
  - adds feed discovery via RSS alternate link type

## Crawl surfaces

- `app/robots.ts`
  - canonical host: `www.chriswongdds.com`
  - primary sitemap: `https://www.chriswongdds.com/sitemap.xml`
  - disallows noindex routes and `/api/`
- `app/sitemap.ts`
  - includes indexable static routes from `shared/seo.ts`
  - includes blog post routes from storage
  - emits `lastModified` only when a parseable date exists
  - never emits current-time fallback timestamps for unknown dates
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

## Automated SEO gates

- Static regression:
  - `pnpm run test:seo`
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
