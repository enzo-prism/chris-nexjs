# 2026-09-22 Conversion Redesign Release

Status: released and verified in production on 2026-09-23. Production readback is recorded at
the end of this file.

## Why

A 90-day read of Vercel Web Analytics (2026-06-23 → 2026-09-22) showed the site
mostly reassures people who already chose Dr. Wong:

- About 1,450 visitors (~100 a week), with 77% of page views arriving with no
  referrer.
- About one online appointment request a week (14 `appointment_request_submit`),
  39 tracked phone-link clicks, and 1 contact-form message.
- Google-referred page views landed 65% on `/` and 12% on `/about`, which means
  branded searches. Invisalign, implants, veneers, the three remaining city pages,
  and ~39 blog posts drew almost no Google visits. `/emergency-dental` was the
  only non-brand page that did (25).

The work below targets conversion of those visitors, the out-of-network cost
objection, and measurement that can separate Google Business Profile traffic.

## What shipped

### 1. `/schedule` first screen and funnel

- Removed the "Back to home" link, the eyebrow, and the separate "not instant
  booking" line. The copy is now one sentence plus three chips ("New patients
  welcome", "PPO benefits checked first", "No account needed").
- The large rose emergency banner with a red "Call now" button is now a single
  inline "In pain? Calling is fastest: (650) 326-6319" call link.
- On an iPhone 13, step 1 of the form, including the first appointment option,
  now appears in the first screen (`tests/mobile/conversion.spec.ts`).
- The contact step shows the insurance field instead of hiding it in a
  collapsed "insurance or note" drawer. Helper text explains out-of-network
  coverage. Only the scheduling note stays collapsible.
- The confirmation screen adds a "While you wait" block with a link to the
  patient forms and a note about insurance.

### 2. Insurance and cost clarity

- New homepage `CostClaritySection` ("Know your cost before you commit"):
  PPO out-of-network explained, the in-house dental plan, and Visa /
  MasterCard / FSA/HSA. Payment copy follows the AGENTS.md lockstep rule.
- A hero trust tile ("PPO insurance welcome · Out-of-network · benefits
  checked first") links to `/insurance`.
- The `/schedule` insurance card copy now states the out-of-network model.
- **Not done: needs the practice.** The in-house plan price and inclusions are
  still "ask our team". Publish them in `CostClaritySection`, `Insurance.tsx`,
  and the `data.ts` payment FAQ together once the office supplies them.

### 3. Homepage design and writing

- The H1 changed from the SEO string "Dentist in Palo Alto — Christopher B.
  Wong, DDS" to "Unhurried, conservative dentistry in Palo Alto". The name
  stays in the subhead, the title tag, and schema. "Unhurried" and
  "conservative" come straight from reviews ("never rushes appointments";
  "conservative in his approach").
- The hero photo now carries a "Watch Dr. Wong's 1-minute intro" button that
  plays the self-hosted `meet-dr-wong.mp4` (`IntroVideoButton`, dialog loaded
  on demand). This also removed a caption that put "Dr." and "DDS" on one line.
- A "For current patients" strip links to patient forms, hours and closures,
  and the phone number.
- `CarePathsSection` ("What brings you in?") replaces three stacked
  ServiceCards, which showed six buttons on a phone. It has eight
  single-action links to the existing service pages and a two-column grid on
  phones.
- `DoctorTeamSection` replaces `AboutDoctorSection` + `FeaturesSection`. The
  generic "Prevention Before Intervention / Clear Recommendations" cards are
  gone. In their place are specific, bio-sourced facts: Dr. Pearl Tran
  (Diplomate, American Board of Periodontology), Angelisa (with the practice
  since 2008), Helen (15+ years), and the garden-facing treatment rooms. On
  desktop it uses the intro video's courtyard frame, so the hero photo is not
  repeated. On phones the portrait is hidden because the hero already shows
  Dr. Wong.
- `PatientProofSection` now reads "Families have trusted this office for
  decades". The quotes live in `client/src/data/homeProof.ts` and are
  verified verbatim against the Google export by `pnpm test:reviews`.
- Visit section: a new heading ("In Palo Alto's California Avenue district")
  and a duplicate CTA row removed. Home FAQs trimmed from 6 to 4, dropping
  location and services, which the new sections answer.
- Homepage phone height: 11,688px → 9,537px (−18%).
- `/invisalign`: removed the generic "Why Choose Invisalign?" benefit cards and
  the duplicate "Dr. Wong's Personalized Approach" section. Added an "On this
  page" jump bar (cost and insurance, candidacy, process, FAQ). Phone height:
  22,588px → 20,669px.
- **Not done: needs the practice.** Reviews mention patients "since 1982" and
  "nearly 30 years", but the site does not state a founding year or a
  succession story. Confirm the practice history with the office before
  writing it.

### 4. Content and search

- The 8/30 overhaul had already consolidated 7 of 10 city pages into
  `/locations`. Menlo Park, Stanford, and Mountain View remain. They were left
  in place because, from the header, they get internal traffic.
- Blog posts were not pruned or noindexed. Vercel referrers cover only 90 days
  and hide queries, so removing pages needs Google Search Console data first.
  Next step: export Search Console page and query data, then merge or noindex
  posts with no impressions.
- The homepage meta description was rewritten around the new positioning.
  `LASTMOD_OVERRIDES` were bumped for `/`, `/schedule`, and `/invisalign`.
  `llms.txt` was regenerated, which also dropped an expired "closed Fri, Sep 4"
  line.

### 5. Measurement

- Lead-source attribution end to end. See `analytics.md` → "Lead-source
  attribution" for how it works, the channel list, and the tagged Google
  Business Profile URLs.
- **Owner actions (outside the repo):**
  1. Put the tagged Website and Appointment links on the Google Business
     Profile (`analytics.md`).
  2. Set up call tracking. Phone is likely the main new-patient path, and
     GBP calls are invisible to the site.
  3. If Google Ads runs, set `NEXT_PUBLIC_GOOGLE_ADS_ID` (and optionally
     `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`) in Vercel. Advertising consent
     defaults to denied; that is a deliberate policy choice, left unchanged.
  4. Ask whether the office's Demandforce account can enable real online
     booking (Demandforce appears as a referrer).
  5. Have the front desk count new-patient leads and bookings each month.

## Verification (local, 2026-09-22)

- `pnpm run check`, `test:api` (incl. new attribution suite),
  `test:routes`, `test:design-system`, `test:reviews` (incl. homepage proof),
  `node scripts/mobile-ux-source.test.mjs` (29/29, two new guards),
  `contact-form-ux`, `og-meta-check`, `test:gallery`, `analytics.test.ts`:
  all pass.
- `pnpm run test:bundle`: pass. Homepage 179 kB / 189 kB (was 176 kB). Other
  routes unchanged; `/services` sits at its 186 kB ceiling on `main` too.
- `pnpm audit --prod --audit-level=high`: pass (2 pre-existing moderate `qs`
  advisories, identical on `main`).
- `pnpm run test:mobile`: 41/41 (6 new in `conversion.spec.ts`; 4 existing
  specs updated for the new homepage copy and structure).
- Against a local `next start`: `test:seo:all` (34/34 metadata, 0 orphans,
  66 JSON-LD payloads) and `test:images` pass.
- Visual QA at 390px and 1440px for `/`, `/schedule`, `/invisalign`.

## Operator notes

- The internal disk ran out of space mid-session (ENOSPC). Build output for
  this working copy was routed to the UUID-verified PortableSSD by symlinking
  the untracked `.next` and `.next-perf` to
  `/Volumes/PortableSSD/caches/agent-runtime/chris-nexjs-build/`. Both paths
  are gitignored. Remove the symlinks if the SSD is not mounted.

## Final production record

- Released: 2026-09-23 08:40 PDT. Application commit `a9381d7`, pushed to
  `main` (no force push); the Git-triggered deployment `dpl_z19L5wjyK2iMKcvUWveRHVLnDUzh`
  in project `chris-wong-dds` is `Ready` and serves `www.chriswongdds.com`
  (the apex host 308s to `www`).
- GitHub CI run `35883280422`: `test` and `perf` jobs succeeded. The first
  attempt failed only `tests/mobile/gallery-ux.spec.ts:35` (the gallery
  preview play→pause focus step, on a page this release does not touch). It
  passed locally and on rerun, so treat it as flaky. The suite runs with
  `retries: 0`.
- Live readback: `/`, `/schedule`, `/invisalign`, `/services`, `/contact`,
  `/gallery`, `/insurance`, `/llms.txt` return `200`. The homepage HTML has
  one H1 ("Unhurried, conservative dentistry in Palo Alto"), the new meta
  description, the cost and care-path sections, and the `__cwEntry`
  bootstrap. The live `llms.txt` no longer lists the expired Sep 4 closure.
  No test leads were submitted.
- `SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all`:
  34/34 metadata, 0 orphans, 66 JSON-LD payloads.
- `IMAGE_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:images`:
  passed.
- Three-run Lighthouse against the public domain:

| Route | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| `/` | 1.00 | 1,416 ms | 0.000 | 0 ms |
| `/services` | 1.00 | 1,431 ms | 0.036 | 0 ms |
| `/invisalign` | 1.00 | 364 ms | 0.036 | 0 ms |
| `/dentist-menlo-park` | 1.00 | 712 ms | 0.036 | 0 ms |
| `/gallery` | 1.00 | 1,262 ms | 0.036 | 0 ms |
| `/schedule` | 1.00 | 1,038 ms | 0.046 | 0 ms |

Homepage LCP improved from 2,397 ms (2026-08-30). CLS of 0.036 on the other
routes is within the 0.10 budget, but it is above the 0.000 recorded on
2026-08-30 for routes this release did not change. Worth a look in a
follow-up.
