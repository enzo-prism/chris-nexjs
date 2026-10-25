# Invisalign release review

Prepared October 24, 2026. Preview only; publication and paid traffic are held
for Enzo's review. No changes to production domains or office systems are part
of this release preparation.

## Review together

- `/invisalign-consult`: focused campaign destination, preselected Invisalign
  appointment type, change-visit disclosure, direct form CTA and office phone.
- Existing `/invisalign`: indexable informational page remains unchanged.
- [Office follow-up workflow](office-follow-up.md) and [blank tracker](outcome-tracker.csv).
- Exact ad variants, approved asset access, weekly capacity and budget cap remain
  subject to the existing client review. No campaign is launched by this change.

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
After review, a production deployment runs the actual inbox dispatch path; this
preview is deliberately not evidence of a fresh office delivery.

## Before publication

1. Enzo approves the preview/copy and the office follow-up proposal.
2. Confirm the current production recipients and intended form endpoint remain
   correct; preserve the existing spam-review safeguard.
3. Review CI and release evidence on the final source revision. Deploy only after
   approval, then verify canonical routes and the approved live form path.
4. Office confirms capacity, inquiry owner/backup and response target. No exact
   response deadline is promised on the campaign page while this is unconfirmed.
5. Separately approve exact ads, assets and budget before paid traffic starts.

## Scope boundaries

No office or patient messages, patient imports, live tracker records, Dentrix or
ReviewFlow changes, Places setup, new assets or production publication. The
blank tracker and workflow require office review before real-data use.

## Validation

See the PR description for final check results and preview screenshots.

Hosted preview readback confirmed the page, noindex/nofollow/noarchive metadata,
working CTA anchor, preselected Invisalign form and synthetic demo confirmation.
The actual hosted API returned status 200 with `accepted:false, preview:true`;
no GA/Hotjar/Vercel tracking scripts were loaded and no horizontal overflow was
present at 390px. The form accessibility scan found zero automated violations;
gradient-background contrast retains a manual-review category.

Preview captures: [desktop](screenshots/desktop.png), [mobile](screenshots/mobile.png),
[demo confirmation](screenshots/demo-confirmation.png).
