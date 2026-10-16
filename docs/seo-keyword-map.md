# SEO Keyword Map

Primary keyword mapping for canonical indexable URLs. This is the anti-cannibalization source of truth for metadata and content planning.

Generated from `primaryKeyword` / `secondaryKeywords` in `shared/seo.ts`
(2026-10-16 "Rooted" redesign, per the local-SEO strategy). Trust and legal
pages not listed here (`/contact`, `/schedule`, `/testimonials`, `/gallery`,
`/office-tour`, `/patient-stories`, `/patient-resources`, legal pages) use the
cluster defaults in `shared/seo.ts`; they are navigational, not ranking targets.

| URL | Cluster | Primary keyword | Secondary keywords |
| --- | --- | --- | --- |
| `/` | service | dentist palo alto | family dentist palo alto, cosmetic dentist palo alto, new patient dentist palo alto, dentist california ave |
| `/about` | trust | christopher b wong dds | dr christopher wong palo alto, kris hamamoto dds |
| `/services` | service | dental services palo alto | general dentistry palo alto |
| `/preventive-dentistry` | service | preventive dentistry palo alto | dental exam palo alto, oral cancer screening palo alto, fluoride and sealants for adults |
| `/restorative-dentistry` | service | restorative dentistry palo alto | broken tooth repair, dental bridge palo alto, replace missing tooth |
| `/pediatric-dentistry` | service | kids dentist palo alto | children's dentist palo alto, child's first dental visit, sealants for kids |
| `/insurance` | trust | dental insurance palo alto | out-of-network ppo dentist, dentist without insurance palo alto, in-house dental plan |
| `/blog` | blog | dental health blog | dental health tips, oral health education |
| `/invisalign` | service | invisalign palo alto | invisalign dentist palo alto, clear aligners palo alto, invisalign cost palo alto, invisalign for teens |
| `/emergency-dental` | service | emergency dentist palo alto | same day dentist palo alto, toothache, broken tooth dentist, urgent dental care |
| `/teeth-whitening-palo-alto` | service | teeth whitening palo alto | zoom whitening palo alto, in-office whitening, take-home whitening trays, whitening cost palo alto |
| `/dental-cleaning-palo-alto` | service | teeth cleaning palo alto | dental cleaning palo alto, dental checkup palo alto, deep cleaning palo alto |
| `/cavity-fillings-palo-alto` | service | cavity filling palo alto | tooth colored fillings, replace silver fillings palo alto |
| `/crowns-palo-alto` | service | dental crowns palo alto | porcelain crown, zirconia crown, crown cost palo alto, cracked tooth crown, crown after root canal |
| `/dentist-menlo-park` | location | dentist menlo park | family dentist near menlo park |
| `/dentist-stanford` | location | dentist near stanford | stanford dentist, dentist for stanford students |
| `/dentist-mountain-view` | location | dentist mountain view | family dentist near mountain view |
| `/locations` | location | palo alto family dentist | nearby dentist palo alto, dental office near me palo alto |
| `/dental-implants` | service | dental implants palo alto | implant crown palo alto, missing tooth replacement, implant cost palo alto, implants vs bridge |
| `/dental-veneers` | service | veneers palo alto | porcelain veneers palo alto, veneers cost palo alto, cosmetic dentist palo alto |

## Merged and redirected URLs (2026-10-16)

One hop each, declared in `staticLegacyRedirects` (`shared/redirects.ts`) and
marked non-indexable in `seoByPath`, so they stay out of the sitemap:

| Retired URL | Now | Why |
| --- | --- | --- |
| `/zoom-whitening` | `/teeth-whitening-palo-alto` | ZOOM! is a brand variant of the same whitening intent; the page absorbed the ZOOM! section and an in-office vs take-home comparison. `/zoom-whitening/schedule` (invite-only campaign, noindex) still works. |
| `/invisalign/resources` | `/invisalign` | Timeline, attachments, aftercare, and retainers now live on `/invisalign`. |
| `/blog/invisalign-palo-alto` | `/invisalign` | Duplicated the service page's head term. |
| `/blog/dental-veneers-palo-alto` | `/dental-veneers` | Duplicated the service page's head term. |
| `/blog/in-office-whitening-vs-take-home-trays` | `/blog/zoom-vs-take-home-whitening-palo-alto` | Duplicate comparison post; the newer, longer post is canonical. |
| `/pediatric-dentist-palo-alto` | `/pediatric-dentistry` | Duplicate children's page (already redirected; route code deleted). |
| `/locations/dentist-menlo-park` | `/dentist-menlo-park` | Legacy nested URL that returned 404. |
| `/locations/dentist-redwood-shores` | `/locations` | Legacy nested URL that returned 404. |

Legacy aliases that would have chained were retargeted (`/whitening`,
`/services/zoom-whitening`, `/post/<slug>` and `/blog/post/<slug>` for merged posts).

## Children's page wording

Use "children's dentistry" / "kids" in copy. "Pediatric dentist" is a specialist
title the practice does not hold.

## Blog template keyword policy

- URL pattern: `/blog/[slug]`
- Primary keyword: one intent keyword per article.
- Required linking: at least one service page and one related post link per article.
- Naming style rule in authored content:
  - use `Dr. Christopher B. Wong` or `Christopher B. Wong, DDS`
  - do not use `Dr. ... DDS` in the same line
- Body-copy anti-stuffing:
  - Primary keywords belong in metadata, titles, and this planning map — not as
    unnatural phrases in patient-facing body copy (no “Looking for a …
    dentist…?” openers).
  - The `/wong-dentist` → `/about` redirect may exist as branded SEO routing,
    but that phrase must never appear as stuffed body text on About or service
    pages.
  - Do not put SEO phrases into schema `alternateName` for Person **or**
    WebSite (use real alternate doctor names / office name only).
  - Request-not-book: `/schedule`, schedule CTAs, funnel copy, thank-you meta,
    and blog CTAs to `/schedule` describe a visit/appointment *request*, not
    instant booking. Avoid “book online” / “appointment scheduled” framing
    unless the product actually books instantly.

## Consolidated location policy

The Los Altos, Los Altos Hills, Sunnyvale, Cupertino, Redwood City, Redwood Shores, and Atherton URLs permanently redirect to `/locations`. Do not recreate standalone city pages without demonstrated search demand and genuinely original visit-planning or practice-specific content. Menlo Park, Stanford, and Mountain View remain the only indexable nearby-city pages.
