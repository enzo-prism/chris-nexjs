# SEO Implementation Backlog (2026)

Current technical and editorial SEO work for `chris-nexjs`.

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
   - Measure calls, contact submissions, and scheduling completions by landing page.
   - Test high-impact CTA and reassurance changes one at a time.
   - Do not send form fields or patient details to analytics platforms.

## Release checklist

```bash
pnpm run check
pnpm run test:routes
pnpm run test:seo:all
SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all
```

Optional deeper performance verification:

```bash
LIGHTHOUSE_BASE_URL=https://www.chriswongdds.com LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse
```
