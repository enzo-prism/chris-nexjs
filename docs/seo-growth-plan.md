# SEO Growth Program (Local Lead Focus)

Operational SEO plan for sustained local lead growth while preserving technical quality.

## Current baseline snapshot

- Canonical SEO definitions: `46`
- Indexable routes: `35`
- Noindex or retired routes: `11`
  - `/zoom-whitening/schedule`
  - `/thank-you`
  - `/analytics`
  - `/ga-test`
  - `/dentist-atherton`
  - `/dentist-los-altos`
  - `/dentist-menlo-park`
  - `/dentist-mountain-view`
  - `/dentist-portola-valley`
  - `/dentist-stanford`
  - `/dentist-woodside`
- Metadata source of truth: `shared/seo.ts`

The seven retired city URLs permanently redirect to `/locations`. They are not
canonical pages and must not reappear in metadata definitions or the sitemap.

## 90-day growth targets

1. Increase non-brand local organic clicks by 25%.
2. Increase CTR on priority service/location pages by 15%.
3. Increase organic conversions (calls + forms) by 20%.

## Technical success criteria

1. Every indexable route in `getIndexablePaths()` is reachable and self-canonical.
2. No noindex route appears in sitemap.
3. At least 95% title compliance and 95% description compliance.
4. Exactly one `<h1>` per indexable route.
5. Zero orphan indexable routes.
6. JSON-LD parses cleanly across audited routes.
7. Redirect chains resolve to canonical destinations in one hop when possible.

## SEO gate commands

Full suite:

```bash
pnpm run test:seo:all
```

Individual:

```bash
pnpm run test:seo
pnpm run test:seo:onpage
pnpm run test:seo:links
pnpm run test:seo:schema
pnpm run test:seo:freshness
```

Runtime base URL:
- default scripts use `http://localhost:3000`
- local dev often runs on `5000`, so use:

```bash
SEO_AUDIT_BASE_URL=http://localhost:5000 pnpm run test:seo:all
```

Preview verification example:

```bash
SEO_AUDIT_BASE_URL=https://<preview-domain>.vercel.app pnpm run test:seo:all
```

## Content and entity strategy

1. Service pages:
- keep one clear primary intent per URL
- maintain unique value proposition and FAQ scope
2. Location pages:
- use `/locations` for the consolidated service-area intent
- create a standalone city page only when the practice can support genuinely
  distinct clinical, logistical, and local content for that location
3. Blog:
- publish 2 to 4 high-intent posts monthly
- each post must link to at least one service page and one related post
4. Gallery page:
- preserve accessibility metadata (`alt`, `title`, `description`) in media data model
- keep media performance behavior stable (hero autoplay muted; in-grid click-to-play)
5. Changelog page:
- keep update transparency while maintaining clean metadata and crawl behavior

## Weekly operating cadence

1. Search Console:
- coverage/indexing drift review
- query opportunity review
- CTR loss review by landing page
2. Google Business Profile:
- category and service alignment check
- update posting cadence and response hygiene
3. Content updates:
- update priority pages when Search Console, conversion evidence, or substantive
  clinical changes justify it
- never change dates or copy solely to manufacture a freshness signal

## Editorial guardrails

Doctor naming:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Never use `Dr.` and `DDS` on one line.

Person schema:
- Use `name: "Christopher B. Wong"` with `honorificPrefix` / `honorificSuffix`.
- Do not put SEO keyword phrases like “Wong dentist in Palo Alto” into Person
  `alternateName`.

Body copy and CTAs:
- No keyword-stuffed openers such as “Looking for a … dentist in Palo Alto?” in
  patient-facing body copy. Keywords belong in metadata and planning docs;
  body copy must read naturally.
- Prefer “preventive” spelling.
- Keep schedule/appointment CTAs as request language when forms do not book
  instantly (`/schedule` is an appointment request, not instant booking).

Payments:
- Payment copy must match accepted methods: Visa, MasterCard, FSA/HSA, and the
  in-house dental plan.
- Do not list CareCredit, Amex, or Discover unless those methods are
  reintroduced as accepted payment options.

Clinical consistency:
- Implant messaging must stay consistent with surgical partners for placement
  plus in-office restoration when that is the clinical model.

## Ownership

1. Engineering:
- metadata, canonical, schema, redirects, SEO gate maintenance
2. Content/marketing:
- local intent pages, blog cadence, copy refreshes
3. Operations:
- Search Console and GBP workflow, monthly KPI reporting
