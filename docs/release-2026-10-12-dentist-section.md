# Dentist section and intro thumbnail, 2026-10-12

Status: local release candidate on `improve/dentist-section-20261012`. No push,
merge, or production deployment has been performed.

## Source review

The current site is `enzo-prism/chris-nexjs`; the checkout matched GitHub main
at `307e19a` before this work. The homepage composes `DoctorTeamSection` from
`client/src/pages/Home.tsx`. That section is server rendered with Next Image;
its intro button is a small client component that loads `VideoModal` on demand.
The About page also uses that modal and declares its poster in VideoObject
structured data. Team biographies are in `client/src/lib/data.ts`.

The section's main problem was hierarchy: the educational biography led the
copy, the names were secondary to generic card headings, and an office feature
was grouped with people even though the courtyard already appears later on the
homepage. The existing video still caught Dr. Wong mid-speech and gave much of
the portrait area to empty ceiling space.

## Changes

- Keep the clear headline, “A dentist who explains before he treats.”
- Name Dr. Christopher B. Wong in the small introductory label; lead the body
  with his approach, and move education into a quieter credential line.
- Keep the existing clinical focus links and biography-supported facts.
- Use two people cards: Dr. Pearl Tran and the hygiene team. Leave the courtyard
  feature in the homepage's existing office section.
- Use a real smile from the existing `public/videos/meet-dr-wong.mp4`, at 53.5s.
  Extract a 960×540 crop (`crop=960:540:160:180`) as WebP at quality 88. No
  expression was generated or retouched. The result is about 54 KB.
- Give the new asset its own URL, `/images/about/meet-dr-wong-smile.webp`, to
  avoid reusing the previous cache URL. Wire it into the homepage portrait,
  homepage intro modal, About modal, and About VideoObject thumbnail.
- The old poster stays available for the unrelated Collaborative Care gallery
  video, so that gallery item is unchanged.
- Correct the intro modal's keyboard focus return and add a screen-reader title.
- Update homepage and About sitemap modification dates.

## Verification

- `pnpm run check`, `pnpm run build`, `test:api`, `test:routes`,
  `test:design-system`, and `test:gallery`: pass.
- Against local production mode at `http://localhost:3210`, `test:seo:all`
  passes: 34 metadata pages, zero orphan routes, 66 structured-data pages,
  and no stale sitemap dates. `test:images` passes across 66 routes and 92
  unique image URLs.
- Focused existing Playwright tests for homepage intro and About interview:
  2/2 pass, including focus restoration after the homepage dialog closes.
- Browser verification at widths 390, 768, 1024, and 1440: images load,
  no horizontal overflow, video plays with native controls at 1280×720,
  correct poster, focus restored on close, and no page errors.
- About modal and VideoObject both use the new poster.
- Independent review found no blockers in copy, framing, or Radix focus handling.
- Final screenshots: `outputs/dentist-section-20261012/after-1440.png` and
  `after-390.png`. Local production preview remains at
  `http://localhost:3210/#about-doctor`.

These are local checks. GitHub CI and a production deployment have not run for
this change.
