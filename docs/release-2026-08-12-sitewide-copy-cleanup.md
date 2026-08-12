# Sitewide Copy Cleanup — August 12, 2026

Editorial and SEO-trust pass on branch `cursor/sitewide-copy-fixes-3222`
([PR #6](https://github.com/enzo-prism/chris-nexjs/pull/6)). Merged to `main`
for production on the primary Vercel project (`chris-wong-dds` /
`www.chriswongdds.com`). The work followed an About-page typo audit
(Wong→one) and widened into a full-site cleanup: remove remaining SEO stuffing,
fix factual drift, align payment and implant messaging with practice reality,
and keep the calm patient-facing voice.

## About, Person schema, and doctor naming

- Removed remaining “Wong dentist” SEO stuffing from the About hero and meta
  after the earlier Wong→one typo fix.
- Cleaned Person `alternateName` so keyword phrases like “Wong dentist in Palo
  Alto” no longer appear as alternate names.
- Person schema `name` is `Christopher B. Wong`, with `honorificPrefix` /
  `honorificSuffix` for Dr. / DDS — not a single string that duplicates both.
- Visible copy never combines `Dr.` and `DDS` on one line (AuthorBox,
  Invisalign, and related surfaces corrected).

## Payments and insurance

- CareCredit was already dropped from accepted methods earlier, but Insurance
  and payment UI copy had drifted back. CareCredit mentions were removed from
  those surfaces.
- Payment language now matches accepted methods: Visa, MasterCard, FSA/HSA, and
  the in-house dental plan.

## Clinical accuracy

- Replaced inaccurate “decades of clinical experience” framing (Dr. Wong
  graduated in 2018) with copy that matches actual tenure.
- Implant messaging aligned with the clinical model: surgical partners for
  placement, in-office restoration — not wording that implies every implant
  step happens solely in-house when that is not the model.
- Safety FAQ updated: removed outdated COVID temperature-check and social-
  distancing language.

## Service openers and CTAs

- Softened keyword-stuffed openers on Invisalign, Emergency, Pediatric, and
  similar service pages so patient-facing body copy reads naturally instead of
  “Looking for a … dentist in Palo Alto?” stuffing.
- `AppointmentSection` and related schedule CTAs use request-not-book language,
  matching forms that submit an appointment request rather than instant booking.
  Schedule meta description updated to match (no “easy online booking”).

## UX polish

- Patient-friendly 404 messaging.
- Team bio polish and featured/home testimonial curation.
- ZOOM! nav label corrected; holiday hours spacing fixed.
- Light location-page lead differentiation without inventing thin city content.

## Verification

The following passed on this branch before documentation:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo
```

## Tracking

- Branch: `cursor/sitewide-copy-fixes-3222`
- Pull request: [#6 — fix: sitewide copy cleanup for trust and accuracy](https://github.com/enzo-prism/chris-nexjs/pull/6)
