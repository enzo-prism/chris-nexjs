# Invisalign release review

Updated October 28, 2026. The Invisalign campaign page and accepted-lead event
implementation were released October 24 at
`ec5354575faffd3e1eec28daa8ccd581521d9e16` (PRs #19 and #20). They do not need
to be rebuilt. Paid traffic remains a separate approval. This document update
does not deploy or change office systems.

## Review together

- `/invisalign-consult`: focused campaign destination, preselected Invisalign
  appointment type, change-visit disclosure, direct form CTA and office phone.
- Existing `/invisalign`: indexable informational page remains unchanged.
- [Office follow-up workflow](office-follow-up.md) and [blank tracker](outcome-tracker.csv).
- Capacity is confirmed at 2–3 new consults per week. Front desk can respond
  within one business day if inquiries arrive like Formspree.
- Named owner/backup, approved private tracker location, exact ad variants,
  approved asset access and budget cap remain unresolved. No campaign is launched
  by this change.

## Tracking contract

- `source` and GA `form_name`: `invisalign_consult`.
- `page_path`: `/invisalign-consult`; never a full URL or query string.
- First-party inquiry receives bounded source/UTM fields for staff reconciliation.
- Paid ChatGPT (`utm_source=chatgpt&utm_medium=cpc`) is `campaign`, not Google Ads.
- Production `generate_lead` fires once only after an explicit accepted JSON
  response. Invalid fields, rejected inbox response, timeout, honeypot, rate
  limit and repeated submit attempts do not create leads.
- GA4/Google Ads/Hotjar/Vercel tracking loads or sends only on the exact production
  custom domains. Preview and localhost traffic stay silent even with a measurement
  ID configured. Captured mock `gtag` events in tests are not real GA collection proof.
- Browser production-host tests intercept all requests and serve the built local
  app at a virtual canonical URL; no production form is submitted by the tests.

## Preview form behavior

On Vercel preview deployments, the scheduling API runs real field, source and
rate-limit validation, then returns `{ok:true,accepted:false,preview:true}`.
It never calls Formspree, CRM, Slack or conversion analytics. A production URL
in the body cannot override this server-owned environment guard.

The preview banner requests made-up details. Its confirmation says that nothing
was sent and no appointment was booked. No staff member receives these demos.
The released production deployment runs the inbox dispatch path. Historical
preview evidence is not proof of an actual office delivery or GA ingestion;
both remain unresolved. Do not create fake production conversions to fill that gap.

## Remaining pilot readiness

1. Enzo reviews the released page and the remaining office follow-up proposal.
2. Confirm the current production recipients and intended form endpoint remain
   correct; preserve the existing spam-review safeguard.
3. Retain the October 24 release evidence. Verify public routes read-only;
   establish actual office-delivery and GA ingestion proof from a genuine,
   authorized inquiry without generating fake acquisition conversions.
4. Name the inquiry owner/backup and approve a private tracker location. Plan
   around 2–3 new consults per week and the confirmed one-business-day response
   target, conditional on Formspree-like inquiry delivery.
5. Separately approve exact ads, assets and budget before paid traffic starts.

## Scope boundaries

No office or patient messages, patient imports, live tracker records, Dentrix or
ReviewFlow changes, Places setup, new assets or further production publication
are authorized by this preparation. The
blank tracker and workflow require office review before real-data use.

## Validation

See the PR description for final check results and preview screenshots.

Historical pre-release preview readback confirmed the page, noindex/nofollow/noarchive metadata,
working CTA anchor, preselected Invisalign form and synthetic demo confirmation.
The actual hosted API returned status 200 with `accepted:false, preview:true`;
no GA/Hotjar/Vercel tracking scripts were loaded and no horizontal overflow was
present at 390px. The form accessibility scan found zero automated violations;
gradient-background contrast retains a manual-review category.

Preview captures: [desktop](screenshots/desktop.png), [mobile](screenshots/mobile.png),
[demo confirmation](screenshots/demo-confirmation.png).
