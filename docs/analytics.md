# Analytics Guide

Operational guide for GA4, Vercel Web Analytics, and custom lead-funnel events.

## What is live

- GA4 is installed for marketing analytics and key-event reporting.
- Vercel Web Analytics is installed for page views on Vercel plus a small set of custom events.
- The internal `/analytics` route is a staff dashboard and is excluded from analytics collection.

## Privacy model

- There is no consent pop-up. Consent Mode v2 defaults to **granted** (analytics + advertising), so GA4 page views, GA4 custom events, and browser-originated Vercel custom events fire for all visitors by default. (US/CCPA does not require opt-in cookie consent; revisit if meaningful EU traffic is expected.)
- Vercel page views remain mounted globally through `<Analytics />`.
- Server-originated Vercel lead events fire only after successful API handling and never include patient identifiers.
- Analytics payloads must not include emails, phone numbers, names, message text, notes, full URLs, or nested objects.

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
- `book_appointment_click`
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

1. Confirm the GA bootstrap and the granted consent default are present in the page head.
2. Verify GA4 receives a manual `page_view` on load and on route change (consent is granted by default — there is no cookie banner to accept).
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

Notes:

- Local development is not sufficient to prove Vercel event ingestion because the Vercel dashboard only reflects deployed environments.
- Keep `GoogleAnalytics.tsx` mounted for GA4 consent-aware SPA page views.
- Keep `VercelAnalytics.tsx` mounted in the root layout for Vercel page views.
