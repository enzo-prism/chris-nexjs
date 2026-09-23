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

## Lead-source attribution

Every appointment request and contact message now tells the office where the
patient came from. As of 2026-09-22 the Vercel project has **no environment
variables** (no Ads ID), and before this change a Google Business Profile (GBP)
visitor who landed on `/` and then opened `/schedule` arrived with no UTM tags,
so the inbox could not separate GBP, organic search, and direct traffic.

How it works:

- `app/layout.tsx`'s inline bootstrap stores the true entry URL and referrer in
  `window.__cwEntry` on first paint, before any client-side navigation.
- `client/src/lib/attribution.ts` (called from `GoogleAnalytics.tsx` once per
  page load) classifies that entry with `deriveLeadChannel` from
  `shared/attribution.ts` and keeps it in `localStorage`
  (`cw_lead_attribution_v1`, 30-day TTL). A tagged or referred visit replaces
  the stored touch; a plain direct visit never erases a known source. Capture
  is skipped when the visitor has opted out of analytics.
- The schedule funnel and contact form send an optional
  `attribution: { channel, landingPath, referrerHost }` object (validated by
  `shared/attributionSchema.ts`; a malformed value is dropped, never
  rejected). Stored `utm_*` tags fill `utmParams` when `/schedule` itself has
  none.
- The office inbox email gains a `Lead channel:` line plus `lead_channel`,
  `landing_page`, and `referrer_host` Formspree fields.
- GA4 `generate_lead` / lead events and phone-link clicks carry `lead_channel`.
  Vercel custom events prioritize `lead_channel` for
  `appointment_request_submit` and `contact_form_submit`, and add it as the
  second property on `phone_call_click`, falling back to the previous
  properties when the channel is absent.

Channels: `google_business_profile`, `google_ads`, `google_organic`,
`other_search`, `ai_assistant`, `social`, `yelp`, `email` (includes
Demandforce), `campaign`, `referral`, `direct`. Stored data is limited to the
channel, landing path, referring host, and `utm_*` values. No identifiers.

### Google Business Profile links (owner action required)

Google search, Maps, and the GBP all arrive as a bare `google.com` referrer.
The site can only separate GBP traffic if the profile's links carry tags. In
Google Business Profile, set:

- Website: `https://www.chriswongdds.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp_website`
- Appointment link: `https://www.chriswongdds.com/schedule?utm_source=google&utm_medium=organic&utm_campaign=gbp_appointment#appointment`

Any `utm_source`, `utm_medium`, or `utm_campaign` value containing a
standalone `gbp` token is classified as `google_business_profile`.

### Reading the numbers

Without GA4 access, the Vercel CLI answers most questions:

```bash
vercel link --yes --scope enzo-design-prisms-projects --project chris-wong-dds
vercel metrics vercel.analytics_event.count --prod --since 2026-09-22T00:00:00Z \
  --group-by event_name --json
vercel metrics vercel.analytics_pageview.count --prod --since 30d \
  --group-by referrer_hostname --json
```

Do not compare `schedule_start` counts from before 2026-07-15 with later
weeks: the event fired at mount-time until then (roughly 60–95 a week) and
drops to single digits once it fires only on real input.

Baseline for 2026-06-23 → 2026-09-22 (90 days): about 1,450 visitors,
14 `appointment_request_submit`, 39 `phone_call_click`, 1
`contact_form_submit`. Google-referred page views landed 65% on `/` and 12% on
`/about` (branded searches). Service pages drew almost no Google traffic.

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
