# Reviews draft preparation — October 28, 2026

PR #13 stays a draft. Current `main` (`fd5e9ef`) was merged into the existing
branch without rewriting its history. The page-hero conflict preserves both
the current `reviewLinkClassName` option and the shared review snapshot.
The October 24 Invisalign implementation and PR #21's photo/bio changes are
retained from `main`.

## Repairs

- The four-second Places deadline now covers both response headers and body.
  A stalled-body regression failed before the fix and passes after it.
- Only validated live snapshots enter the daily cache. Raw Places responses
  use `no-store`, and the request timer is cleared after completion.
- Root-layout HTML revalidates daily even when prerendered with fallback
  counts. The built prerender manifest confirms 86400 seconds on `/`,
  `/about`, `/schedule`, `/invisalign-consult`, and `/testimonials`.
- The bundle gate parses Next's ISR lifetime columns; budgets are unchanged.
- Preparation docs record 2–3 new consults per week and the one-business-day
  front-desk response target, conditional on Formspree-like inquiry delivery.
  The CSV remains headers only. Staff owner/backup, private tracker location,
  actual office delivery and GA ingestion proof remain unresolved.

## Local visual evidence

[Desktop, 1280px](reviews-1280.png) · [Mobile, 390px](reviews-390.png)

The atrium portrait renders at both widths, with no horizontal overflow.
Header and hero display the same fallback Google count (382); the published
Google-plus-Yelp corpus stays 392. Screenshots show the hero only.

## Configuration boundary

No Places key is configured in this fresh local checkout or its environment.
Hosted secret configuration and Google Cloud billing/API status were not
verified. The public Place ID is already in `shared/officeInfo.ts`. The account
owner must supply approved server-only Places access for live totals. No key,
billing change, campaign, client message, merge or manual deployment is part
of this preparation. Public routes were checked only with GET requests.

## Checks

Passed locally: type/business-info checks, API contracts, route/metadata
contracts, 24 review tests plus corpus/quote guards, full SEO suite, design
system and seasonal guards, 29 mobile source guards, production build,
image audit (60 routes / 70 images), unchanged bundle budgets, and performance
smoke checks (9 routes). The production dependency high-severity gate passed;
the audit reports one moderate advisory.

Focused mobile appointment selection/validation passed, as did eight repeated
reviews and scheduling-layout browser checks. Full mobile-suite results are
recorded in the PR description after completion.

Production `/testimonials`, `/schedule`, and `/invisalign-consult` returned 200
in read-only checks. Production still has the prior reviews hero/count markup,
as expected while this PR remains unmerged. No live form was submitted.
