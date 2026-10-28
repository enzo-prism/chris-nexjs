# Reviews release preparation — October 28, 2026

PR #13 contains the remaining Reviews portrait/shared count implementation.
Current main (`3c4540b`), including the released contact acceptance safeguards
and approved Warriors About photograph, is merged without rewriting history.
The Warriors feature shipped separately in [PR #23](https://github.com/enzo-prism/chris-nexjs/pull/23)
and is verified on the [live About page](https://www.chriswongdds.com/about#warriors-night).
The Reviews PR remains a draft pending approved hosted Places configuration and
a successful real-provider read.

## Result

- Reviews uses the existing atrium portrait and one resolved Google snapshot
  across header, heroes, service/location pages, About, Services and Testimonials.
- The live path labels Google's all-ratings total alongside its actual rating.
  The fallback remains the committed 382 five-star Google reviews; the published
  Google-plus-Yelp quotation corpus remains 392. No new reviews were imported.
- Places reads have a four-second headers-and-body deadline. Only validated live
  data is cached, keyed by Place ID. Page HTML revalidates daily after fallback.
- Already released in main: About shows the original Warriors photograph after
  the doctor introduction and before the Full Circle film. Website use was
  approved October 26. The source has no GPS IFD and preserves orientation. The
  companion is not named. About/ProfilePage lastmod values are October 28.
- No patient-note quotation or signature is included.

## Visual evidence

[Reviews desktop, 1280px](reviews-1280.png) ·
[Reviews mobile, 390px](reviews-390.png) ·
[Warriors desktop, 1280px](warriors-1280.png) ·
[Warriors mobile, 390px](warriors-390.png)

Both pages were checked against the fresh local production build at both widths.
The new image loads upright, the Warriors section occurs once, and neither route
has horizontal overflow. [Structured results](visual-checks.json)

## Fresh validation

Passed October 28 after integrating current main and the approved photograph:

- `pnpm run check`
- `pnpm run test:api` (mocked provider responses; no live inquiry)
- `pnpm run test:routes`
- `pnpm run test:reviews` (24 tests plus corpus and quotation guards)
- `pnpm run test:design-system`
- `pnpm run test:seasonal`
- `pnpm run build`
- `pnpm run test:seo:all` against the local production server
- `pnpm run test:images` (60 routes / 71 unique image URLs)
- `pnpm run test:bundle` (unchanged budgets, including two parser tests)
- Desktop/mobile browser rendering and source-photo GPS/orientation checks

## Release prerequisites

`GOOGLE_PLACES_API_KEY` must be server-only. `GOOGLE_PLACE_ID` can override the
existing public practice Place ID. A names-only Vercel CLI read on October 28
resolved `enzo-design-prisms-projects/chris-wong-dds` and found no project
environment variables. The hosted Places key is therefore absent from that
listing. Approved key restrictions, API activation, billing exposure and a real
successful refresh still need verification.
Verify current all-ratings copy, shared snapshot, cache and fallback before
claiming a live integration. No key or billing change was provisioned.

The root client review verified production GA4 ingestion of October 27
`page_view`, `schedule_view` and `email_click` events. Genuine accepted-lead
ingestion after the contact safeguard, actual office receipt, front-desk
owner/backup and private outcome tracker adoption remain separate operating
checks.
Already-confirmed capacity is 2–3 new consults/week and one-business-day response
when delivered like Formspree. The tracker is blank. No live form was submitted,
patient outcome invented, ad activated, or SMS sent in this preparation.
