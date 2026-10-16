# "Rooted" design system (2026-10 redesign)

## Concept

Palo Alto is named for a coast redwood (El Palo Alto). The practice mark is a
tooth with a redwood inside, and Dr. Wong's film *Full Circle* uses redwoods,
roots, growth rings, cream paper, deep evergreen, luminous mint, and gold. The
site carries that through: **rooted, warm, human, unhurried**. Real people
first (Dr. Wong, the team, patients' own words), calm editorial typography,
and organic motion (roots that draw themselves, rings that ripple).

## Tokens

Tailwind colors (`tailwind.config.ts`):

| Token | Values | Use |
|---|---|---|
| `evergreen-50…950` | `#EEF5F1` → `#061A14` | primary surfaces, buttons (800), dark bands (900/950) |
| `cream-50…400` | `#FDFBF7` → `#CFC0A2` | page background (50/100), hairlines (300) |
| `gold-200…700` | `#F3E0B0` → `#7F5C1C` | accents; **only gold-700 may be text on light**, gold-300 text on dark |
| `mint-200…500` | `#C9F2E4` → `#3FBF98` | glows on dark only |
| `ink`, `ink-soft`, `ink-muted` | `#14231D`, `#3B4A43`, `#5C6A63` | text; `ink-muted` is the lightest allowed small text on cream |
| `pumpkin-300…600`, `candle`, `night` | | October seasonal art only |

shadcn variables (`app/globals.css`) map `--primary` to evergreen-700 and
`--background` to cream-50, so legacy `bg-primary`/`text-primary` already
render in the new palette.

Type: **Newsreader** (`font-heading`/`font-display`, serif, optical sizes) for
headings and quotes; **Figtree** (`font-sans`) for body and UI. An `<em>`
inside a heading renders in gold italic (the film's caption style).

Shape: cards `rounded-[1.75rem]`, media `rounded-[2rem]`, pills for buttons
and chips, hairline `border-cream-300/80`, `shadow-soft` / `shadow-lift`.

## Component classes (`app/globals.css`, "Rooted design system")

- Buttons: `btn` + `btn-primary | btn-gold | btn-outline | btn-outline-light | btn-ghost`, sizes `btn-sm | btn-lg`. Always ≥44px tall.
- Type: `eyebrow` (+ `eyebrow-light`), `h-display`, `h-section`, `h-card`, `lead`, `prose-rooted`, `link-rooted`.
- Surfaces: `card`, `card-lift`, `paper`, `surface-evergreen` (+ `on-dark` wrapper restyles headings/lead), `pill`.
- Motion: `reveal`, `reveal-fade`, `reveal-stagger`, `reveal-draw` (CSS scroll-driven, progressive enhancement), `rise-in` (one-shot, never on H1/LCP), `draw-path`, `glow-node`, `ring-ripple`, `icon-draw` (hover redraw), `marquee`.
- Misc: `faq-item`/`faq-plus` (native `<details>`), `snap-rail` (horizontal scroll-snap).

## React primitives (`client/src/components/ds/`)

| Component | Purpose |
|---|---|
| `Section`, `SectionHeading` | page bands (tones `white | cream | paper | evergreen | night`) and eyebrow + serif title + lead |
| `PageHero` | inner-page hero: breadcrumbs, H1, lead, request/call buttons (`callFirst` for urgent pages), review chip, optional media |
| `BtnLink`, `btnClass()` | pill CTA; next/link for internal paths |
| `ServiceIcon` | custom dental line icons (`tooth`, `aligner`, `implant`, `whitening`, `crown`, `veneer`, `kids`, `emergency`, `brush`, `shield`, `gum`, `filling`, `forms`, `insurance`, `calendar`) |
| `Reviews` (`StarRow`, `ReviewCard`, `ReviewMarquee`) | verbatim patient quotes |
| `ServiceReviews` | service-matched quotes from `client/src/data/serviceReviews.ts` |
| `TeamCard`, `WhoTreats` | real team portraits, roles, verbatim quotes about them |
| `Steps`, `FactGrid`, `FaqList`, `ReviewedBy`, `CtaBand`, `LogoMark` | visit steps, quick facts, FAQs, clinical-review line, closing CTA, vector mark |

### Page kits (built on the primitives)

| Folder | Used by | Pieces |
|---|---|---|
| `components/services/` | cosmetic + urgent service pages (and reused by the others) | `ServicePhoto`, `QuickFacts`, `FitChecklist`, `OptionCards` / `FeatureList` (optional phone `rail`), `PhaseTrack`, `StepList`, `CompareTable`, `FirstAidGrid`, `CostPanel` (PPO out-of-network, in-house plan, Visa/MasterCard/FSA-HSA), `Disclosure`, `GuideLinks`, `JumpNav`, `NearbyLine`, `IconMedallion` |
| `components/services-hub/` | `/services` + preventive/restorative pages | `hubServices`, `ServiceBlocks` (`QuickFacts`, `FitAndDefinition`, `SpokeCards`, `IconPoints`, `AsideNote`), `ServiceSections`, `ServicesCtaBand` |
| `components/trust/` | `/about`, `/testimonials`, `/patient-stories` | `PracticeLineage` (Kanemoto → Hamamoto → Wong, no invented years), `HandwrittenNote` |
| `components/patients/` | contact, insurance, forms, legal | `MapFacade` (click-to-load map), `HoursTable`, `LegalPage`, `useHolidayNotice` (post-mount, hydration-safe) |
| `components/locations/` | `/locations` + the 3 city pages | `LocationPage` template fed by `data/locations.ts`, `RouteCard` (inline-SVG route, north up), `VisitCard`, `PeninsulaMap` |
| `components/blog/` | `/blog`, posts, service pages | `RelatedServicePosts` (static SSR index `data/blogIndex.ts`, drift-checked by `pnpm test:blog-index`), `AbstractBlogArt` (CSS/SVG covers, no AI art), `InlineMarkdown` |

Phone pattern: card groups that would stack 3+ tall on a phone (service
reviews, related services, related posts, team, spoke cards) become a
horizontal scroll-snap row below `sm`/`md` and a grid above. Build it from
Tailwind utilities (`-mx-4 flex snap-x … md:grid`), not the global `.snap-rail`
class, which is unlayered and beats responsive `sm:grid`.

Every page ends with `CtaBand` (`callFirst` on urgent pages leads with the
phone call). The shell may append a short "Good to know" block from
`lib/supplementalContent.ts` after it (only `/contact` and `/patient-resources`
still have one).

Video: `client/src/components/video/StoryPlayer.tsx` (custom player) and
`StoryFilm.tsx` (version switcher + chapters + transcript). Data in
`client/src/data/fullCircleFilm.ts`. See `docs/full-circle-film.md`.

Navigation data lives in `client/src/data/siteNav.ts` (header mega menu,
mobile menu, footer, homepage care finder).

## Motion rules

- CSS-first; no animation libraries. Scroll reveals only enhance — content is never hidden waiting for JS.
- Never animate the H1, lead, or LCP image in.
- transform / opacity / stroke-dashoffset only; no layout shift.
- `prefers-reduced-motion: reduce` turns off non-essential motion (the marquee becomes a scrollable row).
- Decorative art (`public/brand/roots-*.svg`) is static SVG with internal CSS animation, loaded as CSS backgrounds — zero page JS.

## Accessibility and interaction

- Tap targets ≥44×44px; inputs ≥16px on phones.
- Visible focus (`ui-focus-premium`, `focus-visible` rings); skip link stays.
- Contrast AA: `ink-muted` is the lightest small text on cream; on evergreen-900 use cream/evergreen-100; gold-300 text only on dark.
- No raw `<button|input|select|textarea>` in `components/{common,forms,layout,sections}` — use `@/components/ui/*`.
- Internal links use `next/link` (a wouter `<Link>` on a dedicated Next route changes the URL but not the page).
- The mobile quick-action bar slides in after 280px of scroll so it never covers hero buttons.

## Content rules (see AGENTS.md)

- Doctor name: `Dr. Christopher B. Wong` or `Christopher B. Wong, DDS` — never both in one line.
- "Request", never "book": the site sends appointment requests the office confirms.
- Payment: Visa, MasterCard, FSA/HSA, in-house dental plan; PPO is out-of-network. No CareCredit.
- Quotes are verbatim (enforced by `pnpm test:reviews`); real photos only; no invented facts.
- Address/phone/hours always render from `officeInfo` (`pnpm check:business-info`).
