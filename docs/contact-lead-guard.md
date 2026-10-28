# Contact accepted-delivery guard

Verified against main `fd5e9effd17c6a97de2510f8bdd8d1facf502a5d` on
October 28, 2026. This fix is separate from the reviews draft (#13).

## Reproduced behavior

The contact API returned `201 {ok:true}` for honeypots without delivering or
persisting them. The contact client treated every HTTP success as a lead,
without reading JSON. A browser regression captured `contact_form_submit`
and `generate_lead` after an intercepted `{ok:true,accepted:false}` response.
All requests were served from localhost or intercepted; no vendor collection
or live form submission occurred. The tested baseline ContactForm blob is
`4d383c310f9870f1fb229c6fe907ad6568b41df8`, identical to current main.

This proves a counting path in the code. It does not explain the historical
measurement discrepancy or establish that any recorded contact event represents
a new prospective patient.

## Resulting contract

- Production office acceptance requires a 2xx inbox response containing explicit
  `ok:true` or `success:true`, with no rejection, preview or test marker.
- Only after that acknowledgement does the API persist best effort, emit its
  existing server `contact_form_submit`, and return `201 {ok:true,accepted:true}`.
  The API no longer returns the stored contact object or logs provider bodies.
- The client reads JSON and counts its existing `contact_form_submit`,
  `generate_lead`, and configured Ads conversion only for explicit accepted
  success. Bare HTTP/legacy success, HTML, malformed JSON and explicit rejection
  do not qualify. Errors keep entries available for retry.
- Honeypots retain a quiet 201 acknowledgement with `accepted:false`, without
  inbox delivery, storage, server/client lead events, or a `/thank-you` redirect.
  Their visible confirmation remains neutral: “Message sent.”
- Server preview deployments and submissions marked `_codex_test:true` or
  `_codex_test:"true"` validate fields, then return `accepted:false` with a
  preview/test marker, without delivery, persistence or events. The client
  displays “Demo complete. Nothing was sent to the office.” and stays on contact.
  Request flags cannot enable production delivery in a preview environment.
- Existing subject categories and genuine delivered-contact event names are
  preserved. An accepted inquiry is not proof of a booking, office response,
  attendance, or prospective-patient status.

## Verification

`test:api` includes contact route and result-policy regressions. Eight browser
cases intercept every form/vendor request and exercise the production hostname
guard against the local build: quiet honeypot, explicit acceptance, preview,
test, HTTP rejection, JSON rejection, ambiguous legacy success, and HTML success.
The positive case requires exactly one of each existing acquisition event.
The neutral/demo cases must also avoid the confirmation URL.

[Local preview/demo confirmation](contact-lead-guard/demo-status.png)

The new route regression failed on the previous API's missing `accepted:false`;
the browser honeypot regression failed on the unchanged client by observing
the two acquisition events. Final checks are recorded in the draft PR.

No measurement account settings, production deployment, merge, real inquiry,
client message, credentials or billing were changed by this preparation.
