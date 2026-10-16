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
(Cloudinary) are skipped by the generator — which means a remote WebP is
**not** an acceptable `ogImage` value; download it and commit a local JPEG
derivative instead (`/patient-stories` broke exactly this way). Re-run the
generator after adding or replacing a source photo, then repoint the `ogImage`
literal at the generated `/images/og/*.jpg`.

Blog posts do not use `shared/seo.ts` images at all: both `og:image` and
`twitter:image` are set explicitly to the `/blog/<slug>/opengraph-image` PNG
title-card route in the catch-all `generateMetadata`. That explicitness is
load-bearing — config metadata takes precedence over the file-based
`opengraph-image.tsx` convention, so pointing config images at a post's
generated `.webp` art ships a WebP card (dropped by X/Twitter and LinkedIn)
even though the PNG route exists.

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
- `app/sitemap.xml/route.ts` (since 2026-10-16)
  - the root `/sitemap.xml` is a `<sitemapindex>` over four segment urlsets
    built in `app/sitemap-xml-utils.ts`: `/sitemap-pages.xml` (home, trust,
    legal), `/sitemap-services.xml`, `/sitemap-locations.xml`, and
    `/sitemap-blog.xml` (the `/blog` hub plus every post), so each URL is
    listed exactly once (the old root urlset duplicated every segment)
  - segment membership follows `seoCluster` in `shared/seo.ts` (the homepage
    is filed under pages)
  - includes only indexable routes and blog posts from storage
  - emits `lastmod` (`YYYY-MM-DD`) only when a parseable date exists; never a
    current-time fallback; no `priority`/`changefreq`
  - `robots.txt` submits only the index
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
8. Retired city pages, merged service pages, and duplicate article URLs must use one-hop redirects (`staticLegacyRedirects` in `shared/redirects.ts`, applied by `middleware.ts`) and remain absent from sitemaps and internal links. The 2026-10-16 merges are listed in `docs/seo-keyword-map.md`; `/zoom-whitening` redirects on an exact match only, so the noindex `/zoom-whitening/schedule` campaign route keeps working.
9. The practice `Dentist`/`Organization` entity schema belongs on the homepage. Nearby-city pages must not represent separate local businesses.
10. Visible third-party reviews may remain for trust, but the practice does not emit self-serving `Review` or `aggregateRating` schema.
11. Schema properties are omitted, never emitted empty. `specialOpeningHoursSpecification` disappears once every temporary-hours entry has expired rather than serializing as `[]`.
12. Display copy is not reused as schema values without checking the relationship it asserts. `doctorInfo.credentials` is About-page copy and names the dental school as "… Graduate"; mapped straight into `memberOf` it invents an organization by that name and duplicates `alumniOf`, so the alumni entry is filtered out in `buildPersonSchema`.
13. Every `ogImage` resolves to a JPEG under `public/images/og/` (see "Social share images").

## Structured data map (2026-10-16 "Rooted" redesign)

Builders live in `client/src/lib/structuredData.ts`; pages emit them through
`<StructuredData>`.

- Homepage: `Dentist`/`Organization` (no founder, priceRange, paymentAccepted,
  or aggregateRating), Dr. Wong `Person`, and `WebSite` **without** a
  `SearchAction` (Google retired the sitelinks search box in 2024, and the site
  has no search results page). `scripts/seo-structured-data-audit.ts` now fails
  if a SearchAction comes back.
- Service pages: `buildServiceSchema` emits a `@graph` with a
  `MedicalWebPage` (`reviewedBy` → Dr. Wong's Person `@id`, `lastReviewed`,
  `specialty` Dentistry, a real office photo as `primaryImageOfPage`), the
  `Service` (provider → practice `@id`), and an optional `MedicalProcedure`.
  Pages also keep their `FAQPage` and `BreadcrumbList`. `HowTo` is gone (Google
  stopped showing HowTo results).
- `/about`: `ProfilePage` → Dr. Wong `Person` (`buildProfilePageSchema`) plus a
  `Person` per team member (`buildTeamPersonSchemas(team)`, `worksFor` the
  practice). The team array is passed in rather than imported so team data
  never ships in the shared shell.
- `/office-tour` (the film's watch page): two `VideoObject`s for *Full Circle*
  (`buildFullCircleVideoSchemas`: 2:14 landscape and 0:56 vertical cut, local
  MP4s and JPEG posters) next to the office-clip VideoObjects.
- `/services` and `/locations`: `CollectionPage` + `ItemList`.
- Blog posts: `BlogPosting` + `BreadcrumbList`.
- Never: `Review` or `AggregateRating` (`buildReviewSchemas` is a deliberate
  no-op), `HowTo`, or separate local-business entities on city pages.

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

## Editorial / release checklist (copy and schema)

When shipping substantive copy or metadata changes:

- Update `LASTMOD_OVERRIDES` in `shared/seo.ts` for each touched route.
- Person schema `name` is `Christopher B. Wong` (honorifics separate) — do not
  duplicate `Dr.` in the name string.
- No keyword-stuffed `alternateName` on Person **or** WebSite.
- `/thank-you` meta must not claim a scheduled appointment (request received
  only). Full standing rules: `docs/seo-growth-plan.md` Editorial guardrails.

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
