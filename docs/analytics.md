# Analytics Guide

Operational guide for GA4, Vercel Web Analytics, and custom lead-funnel events.

## What is live

- GA4 is installed for marketing analytics and key-event reporting.
- Vercel Web Analytics is installed for page views on Vercel plus a small set of custom events.
- The retired `/analytics` and `/ga-test` routes return `404` and are excluded from analytics collection.

## Privacy model

- There is no consent pop-up. Analytics storage defaults to granted unless the visitor has stored an explicit denial. Advertising storage, advertising user data, and advertising personalization default to denied because the site has no advertising-consent UI.
- GA4 custom events and browser-originated Vercel events honor the stored analytics opt-out.
- Vercel page views remain mounted globally through `<Analytics />`.
- Server-originated Vercel lead events fire only after successful API handling and never include patient identifiers.
- Analytics payloads must not include emails, phone numbers, names, message text, notes, full URLs, or nested objects.
- Hotjar does not initialize on `/contact`, `/schedule`, `/thank-you`, or `/zoom-whitening/schedule`; contact and appointment forms also use `data-hj-suppress`.

## Google Ads conversions

- The Ads tag is env-driven and inert until configured: set `NEXT_PUBLIC_GOOGLE_ADS_ID`
  (an `AW-…` id) in Vercel to activate `gtag('config', 'AW-…')` alongside GA4, and
  optionally `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` to attribute leads to a specific
  conversion action.
- When configured, every `trackLeadConversion()` call (schedule funnel submit, contact
  form submit) also fires a Google Ads `conversion` ping with `send_to`. No PII is sent.
- Alternative/complement: import the GA4 `generate_lead` key event into Google Ads as a
  conversion — both paths work; the direct tag gives faster, bid-strategy-grade signals.

## Event contract

Shared event names, page categories, and sanitizers live in `shared/analytics.ts`.

Canonical high-intent events:

- `phone_call_click`
- `email_click`
- `book_appointment_click` (CTA click label for schedule/appointment affordances — not a booking confirmation)
- `outbound_click`
- `schedule_start`
- `schedule_submit_failure`
- `contact_form_submit`
- `newsletter_signup`
- `appointment_request_submit`

GA4 also emits the recommended `generate_lead` event for successful lead completions. We do not send monetary `value` or `currency` until practice economics are explicitly defined.

## Payload policy

GA4 custom events may include stable reporting fields such as:

- `page_path`
- `page_category`
- `cta_context`
- `form_name`
- `lead_type`
- `lead_source`
- `appointment_type`
- `scheduling_mode`
- `urgent_flag`

Vercel custom events are intentionally sparse: at most two flat primitive properties per event. The sanitizer chooses the most useful stable fields for each event, usually `page_path` plus one lead, destination, or scheduling dimension.

## Ownership map

- Root GA bootstrap and consent defaults: `app/layout.tsx`
- Browser page views and global click tracking: `client/src/components/common/GoogleAnalytics.tsx`
- Browser dispatch helpers: `client/src/lib/analytics.ts`
- Shared event contract and sanitizers: `shared/analytics.ts`
- Vercel page-view runtime: `client/src/components/common/VercelAnalytics.tsx`
- Server-confirmed Vercel lead events: `server/vercelAnalytics.ts` and the related `app/api/*/route.ts` handlers

## Schedule funnel tracking

GA4 keeps detailed diagnostic events for the scheduling form: step views, step continues, field errors, back navigation, submit attempts, submit success, submit failure, and abandonment checkpoints.

`schedule_view` records the dedicated scheduling form view. `schedule_start` fires only after the first real field change or Continue action, and abandonment timing begins only after that start. Do not move start or abandonment tracking back to mount-time behavior.

Only lead-funnel-critical schedule events are sent to Vercel custom events:

- `schedule_start`
- `schedule_submit_failure`
- `appointment_request_submit` from the server after successful inbox delivery

## Verification workflow

Local checks:

```bash
pnpm exec tsx client/src/lib/analytics.test.ts
pnpm run check
pnpm run test:api
pnpm run test:routes
pnpm run test:seo:all
```

Preview or production checks:

1. Confirm the GA bootstrap sets `analytics_storage` from stored consent while all advertising consent fields default to `denied`.
2. Verify GA4 receives a manual `page_view` on load and on route change when analytics consent is not denied.
3. Confirm Vercel Web Analytics injects `/_vercel/insights/script.js` after hydration.
4. Trigger and verify custom events:
   - phone click
   - email click
   - appointment CTA click
   - outbound click
   - contact form submit
   - newsletter signup
   - schedule start
   - schedule submit failure
   - appointment request submit
5. Visit each sensitive route and confirm Hotjar is not initialized there and no lead-field values appear in analytics payloads.

Notes:

- Local development is not sufficient to prove Vercel event ingestion because the Vercel dashboard only reflects deployed environments.
- Keep `GoogleAnalytics.tsx` mounted for GA4 consent-aware SPA page views.
- Keep `VercelAnalytics.tsx` mounted in the root layout for Vercel page views.
