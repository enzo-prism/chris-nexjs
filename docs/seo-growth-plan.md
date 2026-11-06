# SEO Growth Program (Local Lead Focus)

Operational SEO plan for sustained local lead growth while preserving technical quality.

## Current baseline snapshot (2026-11-06)

- Canonical SEO definitions: `46`
- Indexable static routes: `31`, plus `29` blog articles: `60` sitemap URLs
- Noindex or retired definitions: `15`
  - `/changelog`
  - `/invisalign-consult` (deliberate campaign landing page)
  - `/invisalign/resources`
  - `/zoom-whitening`
  - `/zoom-whitening/schedule`
  - `/thank-you`
  - `/analytics`
  - `/ga-test`
  - `/dentist-los-altos`
  - `/dentist-los-altos-hills`
  - `/dentist-sunnyvale`
  - `/dentist-cupertino`
  - `/dentist-redwood-city`
  - `/dentist-atherton`
  - `/dentist-redwood-shores`
- Metadata source of truth: `shared/seo.ts`

Seven retired city URLs permanently redirect to `/locations` and must not
reappear as indexable metadata or sitemap entries: Los Altos, Los Altos Hills,
Sunnyvale, Cupertino, Redwood City, Redwood Shores, and Atherton. Menlo Park,
Stanford, and Mountain View remain **indexable** nearby-city pages — they are
not part of that retired set.

## Measurement and 90-day priorities

1. Improve discovery and indexing of existing, useful service pages before expanding article volume. The October 22 Search Console snapshot reported 18 indexed URLs and 52 excluded URLs; exclusions include legitimate redirects and are not all defects.
2. Track non-brand clicks and query/page CTR for emergency dentistry, Invisalign, implants, veneers, and crowns. Compare consistent windows; page-level averages mix queries and positions.
3. Measure production-host organic sessions, accepted requests, and office-confirmed booked/attended visits separately. A phone-link click is an intent signal; a request is not a booking. Do not sum diagnostic schedule success events and `appointment_request_submit` as separate leads.
4. Establish a clean post-hostname-guard baseline. The August 5–November 4 export contained 919 localhost sessions and one preview session alongside 1,214 production-host sessions; unfiltered historical GA4 totals and the historical contact-page-view `generate_lead` rule cannot support conversion-lift claims.

These are priorities, not promised percentage lifts. The November 6 audit and release evidence are recorded in `release-2026-11-06-seo-aeo.md` and the client's existing Notion Performance Dashboard.

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
pnpm run test:seo:aeo
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
- improve existing decision guides and their connection to canonical services first; publish only when query evidence, patient questions, and approved original practice information justify a new URL
- each post must link to at least one service page and one related post
- use visible primary sources where appropriate; adding a citation is an editorial update, not evidence of a new clinical review
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

## Indexing and answer visibility workflow

- `shared/indexingReadiness.ts` maintains eleven priority URLs, including implants. Run `SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm --silent run seo:indexing > readiness.csv` for a timestamped HTTP/HTML check using three crawler user-agent strings. `google_index_status=NOT_CHECKED` is deliberate: spoofing a user agent does not prove a real crawler visited, passed the firewall, or indexed a page.
- For an excluded priority URL, record the actual GSC URL Inspection result, live test, declared/selected canonical, last crawl and decision date. Request indexing selectively after a successful live test; do not repeatedly resubmit unchanged URLs or promise acceptance. Inspect `/dental-veneers` and `/blog/how-long-does-invisalign-take` first (unknown/no recorded crawl in the November 6 inspection); `/invisalign` was indexed and self-canonical then.
- Retain server-rendered content, clear answers, descriptive links, sources, and accurate entities. There is no separate guaranteed AEO schema or citation mechanism. GSC AI impressions and GA4 assistant referrals describe different populations and must not be treated as a conversion funnel.
- Practice approval remains necessary for exact consultation/emergency fees, inclusions, after-hours instructions, case permissions, and any new clinical-review attribution. Maintain real local/professional references through genuine relationships; do not create fictitious affiliations or automate unsolicited outreach.

## Editorial guardrails

Standing rules for authored copy, metadata, and schema. Prefer this section as
the enduring source of truth; release notes capture what changed on a given date.

### Doctor naming

- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`
- Never use `Dr.` and `DDS` on one line.
- Person schema: `name: "Christopher B. Wong"` with `honorificPrefix` /
  `honorificSuffix`. Do not duplicate `Dr.` in the `name` string.

### Schema alternateName (Person and WebSite)

- Do not put SEO keyword phrases into **any** schema `alternateName` —
  Person **and** WebSite.
- Bad examples: “Wong dentist in Palo Alto”, “Dr. Christopher Wong Palo Alto
  Dentist”. Prefer office name or real alternate doctor names only.

### Body copy and anti-stuffing

- No keyword-stuffed body openers such as “Looking for a … dentist in Palo
  Alto?” Keywords belong in metadata and planning docs; body copy must read
  naturally.
- Prefer “preventive” spelling.
- Avoid office “state-of-the-art” clichés and unverifiable Top/#1 claims in
  authored meta or UI.
- The `/wong-dentist` → `/about` redirect may exist as branded SEO routing;
  never use that phrase as stuffed body copy on About or service pages.

### Request-not-book language

Forms submit a visit/appointment **request**, not instant booking. Keep
request language across:

- `/schedule` (page copy and meta)
- `AppointmentSection`
- `ScheduleRequestFunnel`
- `/thank-you` meta (must not claim “Appointment Scheduled”)
- blog CTAs that point to `/schedule`

### Tenure and experience

- Practice framing: since 2018 / graduated 2018.
- Do not claim decades of Dr. Wong’s personal clinical experience.

### Implants

- Surgical partners for placement; in-office restoration when that is the
  clinical model. Do not imply every implant step happens solely in-house.

### Terminology

- **in-house** = the dental plan product.
- **in-office** = where care happens (location of treatment).

### Payments

- Accepted methods in copy: Visa, MasterCard, FSA/HSA, and the in-house dental
  plan.
- Keep `Insurance.tsx`, the payment FAQ in `client/src/lib/data.ts`, and the
  Patient Resources payment FAQ in lockstep.
- Do not list CareCredit, Amex, or Discover unless those methods are
  reintroduced as accepted payment options.

### Sitemap freshness after copy changes

- After substantive copy changes, update `LASTMOD_OVERRIDES` in `shared/seo.ts`
  for the touched routes so sitemap freshness stays honest.

## Ownership

1. Engineering:
- metadata, canonical, schema, redirects, SEO gate maintenance
2. Content/marketing:
- local intent pages, blog cadence, copy refreshes
3. Operations:
- Search Console and GBP workflow, monthly KPI reporting
