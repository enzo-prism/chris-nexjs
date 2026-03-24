# Analytics Guide

Operational guide for the two analytics layers currently installed on the site.

## What is live

- GA4 is installed for consent-aware marketing analytics and custom event tracking.
- Vercel Web Analytics is installed for privacy-friendly page-view reporting in Vercel.
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
- `package.json`

Behavior:

- `<Analytics />` from `@vercel/analytics/next` is mounted in the root layout so all App Router routes are covered.
- Vercel Web Analytics automatically tracks page views on Vercel deployments.
- It does not track traffic in local development mode.
- It is additive to GA4 and does not replace the current GA consent/event implementation.

## Privacy model

- GA4 is consent-gated in this app and should stay that way.
- Vercel Web Analytics is intentionally lightweight and does not use the site's GA consent storage/event plumbing.
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

Notes:

- Vercel Web Analytics is injected client-side from the app layout bundle, so a raw `curl` of the SSR HTML may not show the final script tag.
- If the deployment is preview-protected by Vercel SSO, use an authenticated browser session instead of CLI-only checks.

## Release checklist

- Keep GA4 bootstrap in `app/layout.tsx`.
- Keep `GoogleAnalytics.tsx` mounted so consent-aware SPA page views continue working.
- Keep `<Analytics />` mounted in the root layout.
- Run `pnpm run check`, `pnpm run test:api`, `pnpm run test:routes`, and `pnpm run test:seo:all` before a production push.
- After deployment, verify both:
  - GA4 bootstrap markers are present in the HTML.
  - Vercel Web Analytics runtime is present in the browser after hydration and requests `/_vercel/insights/script.js`.
