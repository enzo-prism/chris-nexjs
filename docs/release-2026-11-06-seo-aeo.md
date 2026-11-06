# November 6, 2026 — SEO and answer discovery

## Problem and scope

The August 5–November 4 audit found search demand concentrated on the homepage
and About, while high-intent services received impressions with very few
clicks. The October 22 GSC index report listed 18 indexed URLs and 52 excluded
URLs, including legitimate redirects. On November 6, `/invisalign` was indexed
and self-canonical, while `/dental-veneers` and the Invisalign timeline article
had no recorded crawl in their inspection results. All 60 sitemap URLs were
publicly reachable with matching canonicals; no new crawler block was proven.

This release improves the usefulness and discovery of existing pages. It does
not manufacture new city pages, prices, clinical reviews, patient cases, or a
second analytics implementation.

## Changes

- Homepage and services hub: four server-rendered decision-guide links, each
  paired with the relevant canonical service. They work without JavaScript.
- Invisalign: consultation and fee-inclusion questions, written-estimate
  expectations, current-fee phone link, and an official cost/coverage resource.
- Emergency dentistry: online request versus confirmed appointment, published
  hours/current examination fee, and escalation language for medical
  emergencies. Knocked-out-tooth headings now specify a permanent tooth.
- Implants: surgical-partner placement versus in-office restoration and the
  components to compare across the complete treatment plan.
- Sources: visible ADA/Align Technology reading links on the three services
  and seven related existing articles, plus article schema citations. A source
  link is not a new clinical review or an endorsement.
- Dates: original publication dates and existing clinical-review provenance
  are preserved. The seven source additions carry their actual November 6
  editorial update consistently in HTML, JSON-LD, Open Graph and sitemap.
  Only the five changed static routes receive a new `lastmod`.
- Verification: a fetch-readiness ledger for eleven priority pages and three
  crawler user agents, focused AEO regressions, and six phone/desktop browser
  tests. These checks also run in the existing CI workflow.
- Operations: corrected the inventory to 31 static pages plus 29 articles
  (60 sitemap URLs), retained 15 noindex/retired definitions, replaced the
  fixed article quota with evidence-based improvements to existing URLs, and
  documented the historical GA4 hostname/conversion caveats.

No new environment variables, dependencies, database migrations, tracking
events, or production form submissions are required.

## Local verification

Tests use the optimized production build on `127.0.0.1:3240`. All lead API
contracts mock external delivery. Browser checks block inquiry and acquisition
telemetry endpoints. Screenshots were reviewed at 390px and 1440px widths.

| Gate | Result |
| --- | --- |
| Type/safety, API contracts, route metadata | Passed |
| AEO/source/date regressions | 4 passed |
| Phone/desktop browser suite | 6 passed |
| Existing mobile and conversion browser suite | 78 passed; outbound submissions intercepted |
| Analytics unit and intercepted network checks | Passed; 4 network cases |
| Reviews, design system, seasonal rules, blog index | Passed |
| Mobile source, contact UX, social metadata guards | Passed |
| Production dependency audit (high/critical threshold) | Passed; one moderate advisory remains |
| Bundle budgets | Passed; services hub 172 KB against 187 KB limit |
| Full runtime SEO/schema | Passed; 60 routes; no orphan static page |
| Images and route smoke checks | Passed; 60 routes / 71 unique images; nine smoke routes |
| Priority fetch readiness | 33/33 checks passed; Google index status explicitly not checked |
| Performance build and Lighthouse | Passed; six routes × three runs; all median performance scores 1.00, CLS 0.000 and TBT 0 ms |

Lighthouse uses the repository's provided-throttling configuration and the
median of three runs per route. These local lab results do not establish
field Core Web Vitals or promise rankings.

Median LCP: homepage 672 ms, services 486 ms, Invisalign 162 ms, Menlo Park
183 ms, gallery 245 ms, schedule 660 ms. No performance threshold was relaxed.

Visual evidence:

- [Decision guides, phone](seo-aeo/guides-phone.png)
- [Decision guides, desktop](seo-aeo/guides-desktop.png)
- [Invisalign cost, phone](seo-aeo/invisalign-cost-phone.png)
- [Invisalign cost, desktop](seo-aeo/invisalign-cost-desktop.png)

## Release and rollback

Target: `enzo-design-prisms-projects/chris-wong-dds`, project
`prj_GZsqvnpwTizkAtHD1Ujj4dg7KT7V`, canonical
<https://www.chriswongdds.com>. Repository:
<https://github.com/enzo-prism/chris-nexjs>, release branch `main`.

The release follows the existing Git-based production workflow after local
gates. Post-deploy verification must confirm exact commit/deployment identity,
permanent apex redirect, live SEO/schema and fetch-readiness results, the
rendered changes and runtime errors. Deployment receipt is recorded in the
existing client Performance Dashboard after verification.

Pre-release rollback target, verified November 6:
`dpl_bsqxp2QZQb8dze8qQBVHq6RTxE2i`
(`chris-wong-8ts52glhe-enzo-design-prisms-projects.vercel.app`). If a regression
appears, re-promote this known production deployment with the explicit team
scope and rerun host/SEO smoke checks. Revert the source commit as appropriate
so the next Git deployment cannot reintroduce the regression.

## Remaining work with external dependencies

1. GSC: inspect the excluded priority pages live, selectively request indexing
   after successful tests, and record subsequent actual crawl/selected-canonical
   changes. The new CSV verifies HTTP/HTML only; a user-agent string does not
   authenticate a bot or prove indexing. Index selection remains Google's.
2. Practice: approve exact consultation/emergency fees, inclusions, after-hours
   instructions, permitted case details and any new licensed review. Current
   copy directs readers to the office for individual fees and availability.
3. Operations: verify tagged GBP links and resolve the existing Apple listing
   login/access dependency. No external listing change is claimed here.
4. Outcomes: use the existing office workflow to reconcile accepted requests,
   bookings and attendance without sending patient fields to analytics. Never
   sum several schedule-success events from the same submission as extra leads.
5. Authority: use genuine local and professional relationships for accurate
   references. No affiliations, backlinks or unsolicited outreach were invented.

Measure production-host organic sessions and non-brand query/page performance
over comparable windows after a clean baseline. Track assistant referrals
separately from GSC AI impressions; they are not a shared funnel denominator.
