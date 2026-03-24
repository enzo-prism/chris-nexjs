# Analytics Guide

Operational guide for the two analytics layers currently installed on the site.

## What is live

- GA4 is installed for consent-aware marketing analytics and custom event tracking.
- Vercel Web Analytics is installed for privacy-friendly page-view reporting in Vercel, plus a small set of key custom events.
- The internal `/analytics` route is a staff-facing dashboard page and is unrelated to Vercel Web Analytics.

## Current architecture

### 1. GA4

Files:

- `app/layout.tsx`
- `client/src/components/common/GoogleAnalytics.tsx`
- `client/src/lib/analytics.ts`
- `shared/analytics.ts`

Behavior:

- The Google tag bootstrap is injected globally from the root layout.
- `gtag('config', ...)` sets `send_page_view: false`, so page views are not auto-fired by GA.
- SPA page views are sent manually by `GoogleAnalytics.tsx` after consent is granted.
- Manual page views include `page_referrer`, so GA4 can reconstruct in-app navigation correctly.
- Consent defaults to denied and is persisted in `localStorage` under `analytics_consent`.
- Consent updates emit `analytics-consent-updated`, which re-triggers a page view for the current route once analytics is granted.
- Custom GA events only fire after analytics consent is granted.
- High-value link interactions are tracked globally from the document layer:
  - `tel_click`
  - `email_click`
  - `book_appointment_click`
  - `outbound_click`
- Lead forms emit GA4 `generate_lead` for contact, newsletter, and appointment-request completions.
- Internal staff/test routes (`/analytics`, `/ga-test`) are excluded from GA4 page-view and click-event reporting.
- The hardcoded GA fallback is only honored on known production hosts; local or ad-hoc environments must set `NEXT_PUBLIC_GA_MEASUREMENT_ID` explicitly to emit GA hits.

### 2. Vercel Web Analytics

Files:

- `app/layout.tsx`
- `client/src/components/common/VercelAnalytics.tsx`
- `client/src/components/common/GoogleAnalytics.tsx`
- `client/src/lib/analytics.ts`
- `server/vercelAnalytics.ts`
- `package.json`

Behavior:

- `<Analytics />` from `@vercel/analytics/next` is mounted through `VercelAnalytics.tsx`.
- Vercel Web Analytics automatically tracks page views on Vercel deployments.
- `beforeSend` drops staff/test routes (`/analytics`, `/ga-test`) from Vercel page-view reporting.
- It does not track traffic in local development mode.
- Client-side key events are emitted for:
  - `phone_call_click`
  - `email_click`
  - `book_appointment_click`
  - `outbound_click`
- Server-side key events are emitted after successful API writes for:
  - `contact_form_submit`
  - `newsletter_signup`
  - `appointment_request_submit`
- Vercel custom-event properties are kept flat and intentionally exclude phone numbers, email addresses, message text, and full external URLs.
- It is additive to GA4 and does not replace the current GA consent/event implementation.

Event ownership map:

- Add or update client-side click events in:
  - `client/src/components/common/GoogleAnalytics.tsx`
  - `client/src/lib/analytics.ts`
- Add or update server-confirmed conversion events in:
  - `server/vercelAnalytics.ts`
  - the corresponding `app/api/*/route.ts` handler after successful writes
- Keep shared names, exclusions, and sanitization helpers aligned in:
  - `shared/analytics.ts`

## Privacy model

- GA4 is consent-gated in this app and should stay that way.
- Vercel page views remain lightweight and independent from the site's GA consent plumbing.
- Vercel custom key events are gated behind the same client-side analytics consent checks as GA4 when they originate in the browser.
- Vercel server-side lead events do not include personal data and only fire after successful server-side writes.
- Do not remove the existing GA consent controls just because Vercel Web Analytics is present.

## Verification workflow

### Local verification

Use local runs to verify compilation and routing integrity:

```bash
pnpm run check
pnpm run build
```

Local development is not sufficient to validate Vercel Web Analytics collection because the package does not emit tracking in dev mode.

### Preview or production verification

1. Deploy to Vercel preview or production.
2. Open the deployed site in a browser and confirm the Vercel Web Analytics script is present after hydration:

- Browser console:

```js
document.head.querySelector('script[data-sdkn^="@vercel/analytics"]')
```

- Network tab:
  - look for `/_vercel/insights/script.js`
  - then look for subsequent requests under `/_vercel/insights`

3. Confirm the GA bootstrap is still present:

```bash
curl -sL https://DEPLOYMENT_URL/ \
  | perl -0ne 'if (/<head>(.*?)<\\/head>/s) { print $1 }' \
  | rg -n "googletagmanager.com/gtag/js\\?id=G-94WRBJY51J|gtag\\('consent', 'default'|analytics_consent|analytics-consent-updated"
```

4. Visit multiple pages on the deployment and then confirm Vercel Analytics starts receiving page views in the Vercel dashboard.

5. Trigger the key actions on the deployed site and confirm the Vercel Analytics dashboard begins showing custom events:

- `phone_call_click`
- `email_click`
- `book_appointment_click`
- `outbound_click`
- `contact_form_submit`
- `newsletter_signup`
- `appointment_request_submit`

Notes:

- Vercel Web Analytics is injected client-side from the app layout bundle, so a raw `curl` of the SSR HTML may not show the final script tag.
- If the deployment is preview-protected by Vercel SSO, use an authenticated browser session instead of CLI-only checks.

## Release checklist

- Keep GA4 bootstrap in `app/layout.tsx`.
- Keep `GoogleAnalytics.tsx` mounted so consent-aware SPA page views continue working.
- Keep `VercelAnalytics.tsx` mounted in the root layout.
- Run `pnpm run check`, `pnpm run test:api`, `pnpm run test:routes`, and `pnpm run test:seo:all` before a production push.
- After deployment, verify both:
  - GA4 bootstrap markers are present in the HTML.
  - Vercel Web Analytics runtime is present in the browser after hydration and requests `/_vercel/insights/script.js`.
  - Vercel custom events appear in the Analytics dashboard after real interactions on a deployed environment.
