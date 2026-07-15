# Growth and Hardening Release — July 15, 2026

This release improves local search quality, patient conversion paths, privacy,
lead delivery, mobile usability, and regression coverage.

## Search and discovery

- Consolidated seven thin city pages into the stronger `/locations` page.
- Corrected local business data and removed unsupported review structured data.
- Improved metadata, internal linking, related content, sitemap accuracy, and
  duplicate-article redirects.
- Added `llms.txt` generation plus structured-data, link, on-page, and freshness
  regression checks.

## Conversion and patient experience

- Strengthened calls to action and reassurance across major service journeys.
- Simplified and instrumented scheduling so `schedule_start` represents actual
  engagement instead of a page view.
- Improved mobile form behavior, tap targets, error focus, and sticky actions.
- Deferred heavy review content and reduced avoidable client-side work.

## Privacy and delivery safety

- Preserved analytics opt-out and denied advertising storage by default.
- Removed internal analytics pages from the public application.
- Added JSON content-type checks, request-size limits, delivery timeouts, and
  honeypot handling for public lead endpoints.
- Kept patient details out of analytics events and public read APIs.

## Release gates

The release must pass the aggregate production gate plus focused media, review,
and mobile checks:

```bash
pnpm run test:production
pnpm run test:gallery
pnpm run test:reviews
pnpm run test:mobile
```

After deployment, confirm the production commit SHA, canonical redirects,
security headers, sitemap exclusions, retired route behavior, and live runtime
SEO checks. Do not submit a real or fake patient lead as a deployment smoke test.
