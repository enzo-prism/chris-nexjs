# Release 2026-10-16: "Rooted" full-site redesign

Branch `redesign/2026-10-rooted` → `main`. Every public page was redesigned;
the backend is unchanged (Formspree lead delivery, GA4 + Vercel Web Analytics,
Search Console, the same URLs and canonical rules).

## Goals (from the owner brief)

1. Very easy to use and navigate on any device.
2. Modern, beautiful, delightful: icons, motion graphics, animation.
3. Lean heavily into the reviews and the team; real photos and video of the
   practice, the team, and patients.
4. SEO built around the services to bring in local new patients.
5. Dr. Wong's *Full Circle* motion film, in a custom player that is easy on
   every device.
6. A fun Halloween layer for October.

## What shipped

### Design system ("Rooted")
- Concept: Palo Alto is named for a redwood; the practice mark is a tooth with
  a redwood inside, and *Full Circle* uses redwoods, roots, and growth rings.
  Palette evergreen / cream / gold (+ mint glows on dark), Newsreader headings
  with gold italic accents, Figtree body. Tokens in `tailwind.config.ts`,
  component classes in `app/globals.css`, primitives in
  `client/src/components/ds/`. Full reference: `docs/design-system.md`.
- Custom dental line icons (`ServiceIcon`) that redraw on hover; CSS-only
  motion (scroll reveals, roots that draw themselves, ring ripples, marquee);
  everything respects `prefers-reduced-motion`; no animation library.
- Decorative redwood-roots art (`public/brand/roots-*.svg`) is static SVG with
  internal CSS animation, loaded as CSS backgrounds (zero JS).

### Navigation
- Sticky header: utility bar (hours today, address, review count), services
  mega menu in four groups (Preventive & family, Cosmetic, Restorative,
  Urgent), phone, and "Request a visit".
- Phones: full-screen menu with quick actions and the "What brings you in?"
  finder; a floating Call / Map / Request bar that appears after 280px of
  scroll and steps aside while a film plays.
- Footer: evergreen band with the glowing roots, grouped links, hours, visit
  info. One shared site map (`client/src/data/siteNav.ts`) feeds the header,
  mobile menu, footer, and homepage finder.

### Pages
- **Home:** dusk hero with Dr. Wong, review ribbon (382 five-star Google
  reviews), care finder, *Full Circle* film, team (every person with a real
  photo; verbatim review quotes where patients named them; bios fill the rest),
  the practice's first real **team group photo**, the garden office, cost
  clarity, visit info, FAQ, closing band.
- **13 service pages** on one template: hero with a real photo, quick facts,
  "clinically reviewed by Dr. Christopher B. Wong", is-it-right-for-you, what
  it is, visit steps, comfort and technology (only claims already on the old
  site), options, cost and insurance (PPO out-of-network explained, in-house
  plan, Visa / MasterCard / FSA-HSA), matched patient reviews, who you'll see,
  FAQs (schema kept), related services, nearby communities, closing band.
  Deep copy sits in disclosures so SEO content stays while phones stay short.
  `/emergency-dental` leads with the phone call and six first-aid cards.
- **Trust:** `/about` (story, the 59-second interview in the new player, the
  film, practice lineage Kanemoto → Hamamoto → Wong with no invented years, the
  whole team, a team group photo), `/testimonials` (topic and people filters,
  featured full reviews, "Leave a Google review"), `/patient-stories`,
  `/office-tour` (the film's watch page + four office clips), `/gallery`.
- **Patients:** `/contact` (action tiles, hours, click-to-load map),
  `/insurance` (three-step "how your PPO benefits still work"),
  `/patient-resources` re-scoped as "New patients: your first visit and
  forms", `/schedule` restyled (behavior unchanged), `/thank-you`, legal pages
  on a shared layout, 404, `/changelog` ("Site updates").
- **Locations:** `/locations` hub plus Menlo Park, Stanford, Mountain View on
  one data-driven template (`client/src/data/locations.ts`) with inline-SVG
  route art; each page keeps its own copy and FAQs (no city-name swapping).
- **Blog:** branded CSS/SVG covers, a readable article column, fixed parser
  bugs (lead-in sentences and question paragraphs were rendering as headings
  in ~24 posts; numbered emergency steps), autolinked phone/site URLs, and a
  static related-posts index rendered on the server (fixes React #418 on six
  service pages). Share cards are restyled in the Rooted palette.

### *Full Circle* film and player
Two cuts (2:14 landscape with a WebVTT track; 0:56 vertical with burned-in
captions), encoded to 720p/1080p H.264 at about −14 LUFS, with posters,
storyboard sprites, and silent teaser loops. `StoryPlayer` has custom controls,
chapters, scrub thumbnails, captions with a remembered preference, iOS
fullscreen fallback, double-tap seek, keyboard shortcuts, Media Session, an end
screen, GA4 `video_start` / `video_progress` / `video_complete`, and
bandwidth rules (`preload="none"`, source picked at play time, 720p on
Save-Data or slow networks). Keyboard focus moves to Pause when playback
starts. Details: `docs/full-circle-film.md`.

### Photos
A curated pass over the Drive library produced 45 real selects (Dr. Wong
portraits, candid front-desk moments, team portraits, team-at-work, four team
group photos, office exterior/courtyard/reception/operatories/lounge) with alt
text and focal points. Masters, exports, and the manifest are archived on the
PortableSSD at `01_CLIENTS/Chris Wong DDS/Workspaces/2026-10-16-site-redesign/photos/`;
the files used on the site are in `public/images/redesign/`.

**Removed (AI-generated or stock):** `public/images/generated/*`,
`public/images/services/*`, `stanford-dentist.png`,
`palo-alto-community-serving.png`, `invisalign-step-1…5.png`, `couple.jpg`,
`veneers.jpg`, `invisalign-treatment.jpg`, their `og/*` derivatives, and the
Cloudinary gallery clip "Light-Filled Spaces" (a frame at 7 s shows a clinician
who is not Dr. Wong and garbled signage). Share images for those pages now use
real office photos.

### Halloween (October only)
Dusk hero tint, candlelit underline, harvest moon, bats, ghost-tooth with a
hover note, jack-o'-lanterns in the redwood band, a spider that drops beside
the reviews, cobweb corners on cards, treat-smart tips, footer greeting. Still
date-driven (Oct 1–31 PT) and off on urgent, conversion, and legal pages.
After Oct 31: set `activeSeason = null` in `shared/seasonal.ts`.

## SEO changes
- Titles/descriptions rewritten per the local-SEO strategy (≤60-char titles,
  120–160-char descriptions); `LASTMOD_OVERRIDES` bumped for every redesigned
  route. Keyword map regenerated from `shared/seo.ts`
  (`docs/seo-keyword-map.md`).
- One-hop 301 consolidations: `/zoom-whitening` → `/teeth-whitening-palo-alto`
  (exact match; the invite-only `/zoom-whitening/schedule` still works),
  `/invisalign/resources` and `/blog/invisalign-palo-alto` → `/invisalign`,
  `/blog/dental-veneers-palo-alto` → `/dental-veneers`,
  `/blog/in-office-whitening-vs-take-home-trays` →
  `/blog/zoom-vs-take-home-whitening-palo-alto`, two legacy nested location
  URLs, and the seven retired city URLs now land on their own section of
  `/locations` (e.g. `/locations#sunnyvale`).
- `/sitemap.xml` is now a sitemap index over pages / services / locations /
  blog segments; `robots.txt` submits only the index.
- Structured data: service pages emit `MedicalWebPage` (reviewedBy Dr. Wong,
  lastReviewed) + `Service` (+ `MedicalProcedure`); `/about` emits
  `ProfilePage` + team `Person` nodes; `/office-tour` emits two *Full Circle*
  `VideoObject`s with transcript; the retired `WebSite` SearchAction and all
  `HowTo` were removed; still no `Review`/`AggregateRating`.
- `/changelog` is `noindex, follow`.

## Bugs fixed along the way
- React #418 hydration errors: related-posts hook (six service pages),
  `new Date()` on `/hipaa` and `/accessibility`, holiday notices now resolved
  after mount.
- Wouter `<Link>` trap removed from every page (URL changed, page didn't).
- Terms of Service payment/insurance lines contradicted the accepted-payment
  rule (said cash/credit cards, "participate with many insurance plans");
  corrected to Visa, MasterCard, FSA/HSA, in-house plan, PPO out-of-network.
- Copy that said "book" now says "request" (the site sends requests the office
  confirms).

## Gates
Updated deliberately (each change is commented in the script/spec):
- `scripts/mobile-ux-source.test.mjs` #13: DentalVeneers must not import
  framer-motion (it no longer needs the motion-lite stub; the stub was deleted).
- `scripts/route-contract.test.ts`: canonicals of redirected routes ignore the
  `#fragment` (retired cities redirect to hub anchors).
- `tests/mobile/about-video.spec.ts`, `office-tour.spec.ts`, and the office-tour
  test in `gallery-ux.spec.ts`: target the StoryPlayer (region, Play/Pause,
  focus moves to Pause, `video[poster]` with `preload="none"`).
- Earlier in the redesign: homepage, navigation, seasonal, and conversion
  specs were updated for the new header, hero, and film.
- New: `pnpm run test:blog-index` (also in CI).

Verification evidence: see "Release evidence" below.

## Release evidence

Local, on the release candidate (production build, 2026-10-16):

- Static gates, all pass: `check` (typegen + business info + tsc), `test:api`,
  `test:routes`, `test:seo`, `test:seo:freshness` (31 lastmods, none stale),
  `test:design-system`, `mobile-ux-source` (29/29), `contact-form-ux`,
  `og-meta-check`, `test:gallery` (23 items + hero), `test:reviews` (36
  verbatim quotes, mention counts verified), `test:blog-index`,
  `test:seasonal` (12/12), `analytics.test.ts`, `llms:generate` (no drift).
- `test:mobile` (Playwright, iPhone 13, Chrome): **41/41 pass**.
- Against `next start`: `test:seo:onpage` (31 pages, 100% title and
  description compliance, one SSR H1 each), `test:seo:links` (31 indexable,
  0 orphans), `test:seo:schema` (60 pages), `test:images` (60 routes): all pass.
- `test:bundle`: pass. Service pages and `/services` now 169 kB First Load JS
  (budget 187 kB; `/services` sat at its ceiling before). Home 182 kB
  (budget 189 kB) including the film player chrome.
- `perf:smoke` 9/9; `perf:lighthouse` (repo budget, provided throttling):
  perf 1.00, CLS 0 on all six budgeted routes.
- Lighthouse 12, default mobile (simulated slow 4G), production build:

  | Page | Perf | A11y | Best pr. | SEO | LCP | CLS |
  |---|---:|---:|---:|---:|---:|---:|
  | `/` | 80 | 100 | 96* | 100 | 5.3 s | 0 |
  | `/invisalign` | 84 | 100 | 96* | 100 | 4.6 s | 0 |
  | `/dental-cleaning-palo-alto` | 83 | 100 | 96* | 100 | 4.7 s | 0 |
  | `/about` | 81 | 100 | 96* | 100 | 5.1 s | 0 |
  | `/insurance` | 85 | 100 | 96* | 100 | 4.4 s | 0 |
  | `/contact` | 83 | 100 | 96* | 100 | 4.7 s | 0 |

  \*Only finding: `/_vercel/insights/script.js` 404s on a local server (it
  exists on Vercel). Unthrottled, the hero paints at ~120 ms. The simulated
  LCP is dominated by the preloaded Newsreader files (~270 KB for the
  optical-size variable font, roman + italic). Dropping the `opsz` axis would
  cut that to ~118 KB but visibly coarsens the display headings, so it was kept
  deliberately; headings use `display: optional`, so there is no late swap or
  layout shift. Homepage performance matches the July baseline (81) with TBT
  and CLS now at zero.
- No React hydration errors (#418) on any route in the production build (the
  previous production threw them on several routes).

### Production (2026-10-16)

- `main` fast-forwarded `a91edc0..dcbf3bf`; Vercel production deployment
  `dpl_BsYUVjYqprqEGz3vMqKnmNBx94K3` Ready, aliased to www.chriswongdds.com
  and the apex (apex 308s to www).
- Verified preview first (`vercel curl` against the protected preview):
  key routes 200, redirects one hop, blog `opengraph-image` renders the new
  Rooted card (it can't render locally while `.next` lives on the SSD).
- Live readback: 19 key routes, `/sitemap.xml`, `/robots.txt`, `/llms.txt`,
  the film MP4, and the redesign photos return 200; `/zoom-whitening`,
  `/invisalign/resources`, and `/dentist-sunnyvale` (→ `/locations#sunnyvale`)
  301 in one hop; blog share cards render as PNG.
- Against production: `test:seo:onpage` (31 pages, 100% compliance),
  `test:seo:links` (0 orphans), `test:seo:schema` (60 pages), `test:images`:
  all pass.
- Real Chrome on production at 390 px and 1440 px (`/`, `/invisalign`,
  `/about`, `/emergency-dental`): no horizontal overflow, one H1, zero console
  errors; the October layer is on.

## Open questions for the practice
1. Approve the corrected Terms of Service payment/insurance lines.
2. `/accessibility` lists physical-office accommodations (wheelchair access,
   accessible parking, lowered counter, transfer-assist chairs, interpreters)
   carried over from the old page. Please confirm.
3. HIPAA notice effective date is shown as February 25, 2026 (the date its text
   last changed in the repo). Confirm the real effective date.
4. `/locations`: confirm the Caltrain California Avenue walking note and give
   parking specifics; give a typical drive time from Stanford if the H1 should
   say "minutes from campus".
5. Carried-over claims to confirm: ZOOM! "up to eight shades brighter in a
   single 90-minute appointment"; "care within 30 minutes" for a knocked-out
   tooth.
6. Film name spellings follow its on-screen labels ("Dr. Kanemoto",
   "Dr. Kris Hamamoto").
7. Two team members in the new photo selects are unidentified; they appear
   only in group photos and are not named.
8. Still open from September: in-house plan pricing, GBP tagged links, call
   tracking, Google Ads ID.
