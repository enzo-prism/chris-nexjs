# SEO Implementation Backlog (2026)

Current technical and editorial SEO work for `chris-nexjs`.

## Completed November 6, 2026

- Added server-rendered patient decision guides on the homepage and services hub, linking directly to existing articles and their canonical service pages.
- Clarified Invisalign fee questions, emergency request/fee expectations, and implant placement/restoration responsibilities with matching visible FAQ answers and JSON-LD.
- Added visible primary-source reading lists to three service pages and seven existing articles. Preserved original publication dates and existing clinical-review provenance; actual editorial modification dates agree across article HTML, JSON-LD, Open Graph, and blog sitemap.
- Added a repeatable fetch-readiness CSV for eleven priority URLs and three crawler user agents. It explicitly does not claim Google indexing or actual bot access.
- Added AEO/date/source regressions and phone/desktop browser checks. See `release-2026-11-06-seo-aeo.md` for validation and release evidence.
- Corrected the route inventory and shifted the operating plan from a fixed publication quota to improving and measuring existing high-intent pages first.

### Remaining dependencies after this release

1. Google: run actual GSC live inspections and selectively request indexing for excluded priority URLs, then record recrawl/selected-canonical changes. Fetch readiness is already testable; index selection remains Google's decision.
2. Practice: approve exact consultation/emergency fees and inclusions, after-hours instructions, real case details with permissions, and any new clinician review. No estimates or review attestations were invented for this release.
3. Operations: confirm GBP tagged website/appointment links, resolve Apple listing access, and maintain accurate entity details. Existing Apple access was blocked at login; this release does not claim the listing was corrected.
4. Outcomes: reconcile accepted requests with booked and attended visits in the existing office workflow. Never upload patient fields to GA4 or count several events from one submission as several leads.
5. Authority: obtain accurate local/professional citations through existing relationships. The limited GSC links report is not a complete backlink inventory; outreach/publication remains a separate authorized workflow.

## Completed July 15, 2026

- Consolidated seven thin city pages into `/locations` with permanent one-hop redirects.
- Corrected practice coordinates and centralized business/entity details.
- Removed `Review` and `aggregateRating` structured data that the site could not
  safely substantiate as first-party review content.
- Limited homepage structured data to the primary business/entity graph and
  added route-specific schema where it accurately describes the page.
- Removed artificial sitemap `priority` and `changefreq` hints.
- Made sitemap `lastModified` values reflect known content changes and added a
  freshness regression audit.
- Reached complete title and description compliance across indexable routes.
- Removed orphan indexable routes and improved related-content selection using
  topic relevance instead of a static list.
- Redirected the duplicate dental-implant comparison article to its canonical article.
- Added generated `llms.txt` and `llms-full.txt` files with CI drift protection.
- Added automated checks for canonicals, robots, sitemap membership, on-page
  headings, link integrity, structured data, and freshness.

## Completed August 12, 2026

Sitewide copy and SEO-trust cleanup on `cursor/sitewide-copy-fixes-3222`
(PR #6); see `docs/release-2026-08-12-sitewide-copy-cleanup.md`.

- Removed remaining “Wong dentist” stuffing from About hero/meta and Person
  `alternateName`.
- Aligned payment copy with accepted methods (no CareCredit drift).
- Corrected inaccurate experience claims, implant partner/restoration wording,
  and outdated COVID safety FAQ language.
- Enforced doctor-name formatting and Person schema name without duplicated
  Dr./DDS on one line.
- Softened keyword-stuffed service openers; schedule CTAs use request language.
- Polished 404 body copy, team bios, testimonials, ZOOM! nav label, holiday
  hours, and light location lead differentiation.
- Note: Menlo Park, Stanford, and Mountain View are **not** retired — only the
  seven thin city URLs redirect to `/locations`. Correct noindex list:
  `docs/seo-growth-plan.md` baseline snapshot.

### Follow-up (docs audit residuals)

On `cursor/docs-copy-audit-followup-3222`: WebSite `alternateName` cleaned to
office name; `/thank-you` meta request-received language; payment FAQ FSA/HSA
lockstep; `LASTMOD_OVERRIDES` bumped for touched Aug 12 routes; Invisalign /
  ScheduleRequestFunnel wording softened.

## P0: evidence and entity accuracy

1. Establish a clinical editorial workflow.
   - Record author, reviewer, source, and review date for clinical content.
   - Require a licensed reviewer for treatment claims before publication.
   - Add visible citations where a claim needs external medical support.

2. Keep local entity data synchronized.
   - Reconcile website name, address, phone, hours, services, and profile links
     with the active Google Business Profile.
   - Validate schema `@id` references and canonical URLs after every entity change.

## P1: organic growth and conversion

3. Expand high-intent service pages with original practice evidence.
   - Add clinician-reviewed explanations, real process details, candidacy guidance,
     and approved case examples where patient consent permits.
   - Avoid generic city or treatment copy created only to target a keyword.

4. Use Search Console to maintain one clear query owner per intent.
   - Review query overlap monthly.
   - Consolidate or differentiate pages when two URLs compete for the same intent.
   - Prioritize pages with strong impressions but weak click-through or conversion.

5. Improve conversion evidence.
   - Measure phone-link clicks, accepted requests, and confirmed office outcomes separately by landing page.
   - Test high-impact CTA and reassurance changes one at a time.
   - Do not send form fields or patient details to analytics platforms.

## Release checklist

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo:aeo
pnpm run test:seo:all
SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all
```

Optional deeper performance verification:

```bash
LIGHTHOUSE_BASE_URL=https://www.chriswongdds.com LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```
