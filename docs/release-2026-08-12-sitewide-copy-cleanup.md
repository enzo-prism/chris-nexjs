# Sitewide Copy Cleanup — August 12, 2026

Editorial and SEO-trust pass on branch `cursor/sitewide-copy-fixes-3222`
([PR #6](https://github.com/enzo-prism/chris-nexjs/pull/6)). **Merged to
`main` / production** on the primary Vercel project (`chris-wong-dds` /
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
- Payment language targets accepted methods: Visa, MasterCard, FSA/HSA, and the
  in-house dental plan. A follow-up brought the `data.ts` payment FAQ into
  FSA/HSA lockstep with `Insurance.tsx` (see residuals below).

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

- Patient-friendly 404 body copy (H1 remains the standard “404 Page Not Found”).
- Team bio polish and featured/home testimonial curation.
- ZOOM! nav label corrected; holiday hours spacing fixed.
- Light location-page lead differentiation without inventing thin city content.

## Follow-up residuals (docs audit branch)

Docs-vs-code audit follow-ups on `cursor/docs-copy-audit-followup-3222`:

- WebSite schema `alternateName` no longer uses the keyword-stuffed
  “Dr. Christopher Wong Palo Alto Dentist”; it uses the office name.
- `/thank-you` meta no longer says “Appointment Scheduled”; title/description
  use request-received language.
- Payment FAQ in `data.ts` includes FSA/HSA (lockstep with Insurance UI).
- `LASTMOD_OVERRIDES` bumped for `/about`, `/schedule`, `/insurance`,
  `/dental-implants`, `/thank-you`, `/`, and `/services` to `2026-08-12`.
- Invisalign “years of experience” softened; `ScheduleRequestFunnel` “booking”
  → “visit requests”.

Standing editorial rules live in `docs/seo-growth-plan.md` (Editorial
guardrails).

## Verification

Core gates used on the copy-cleanup branch:

```bash
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo
```

For future operators, prefer the fuller SEO suite after substantive copy or
metadata changes:

```bash
pnpm run test:seo:all
```

## Tracking

- Primary ship branch: `cursor/sitewide-copy-fixes-3222`
- Pull request: [#6 — fix: sitewide copy cleanup for trust and accuracy](https://github.com/enzo-prism/chris-nexjs/pull/6)
- Docs/audit follow-up: `cursor/docs-copy-audit-followup-3222`
