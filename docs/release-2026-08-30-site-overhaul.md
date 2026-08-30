# 2026-08-30 Site Overhaul Release

Status: released and verified in production on 2026-08-30. The application
release is commit `206082d666e6d642280cb355286b696a2ad95bf7`, deployed as
Vercel deployment `dpl_9whzeQWLXJaJ5aMsTnVJuqyJ4Ynn`. GitHub CI run
`33341956835` completed successfully for the same commit.

## Candidate scope

- Design and UX: simplify the homepage hierarchy, strengthen the primary
  appointment path, surface real patient proof, clarify visit planning, and
  reduce repeated or search-first copy.
- Responsive and accessible UI: improve header/navigation behavior, mobile
  touch targets, form feedback, semantic landmarks, focus behavior, and
  reduced-motion support.
- Performance: move homepage content toward server rendering, make large
  gallery video click-to-play, use responsive image delivery, and protect
  bundle and Lighthouse budgets.
- SEO: keep complete human-readable blog metadata, consolidate overlapping
  search intent, simplify unverified structured-data claims, and align feeds,
  redirects, canonicals, sitemaps, robots, and `llms.txt`.
- Reliability and security: update the production dependency graph, enforce a
  high-severity production audit in CI, and ensure all automated lead tests mock
  outbound vendors.
- Operations: document the single verified Vercel project
  (`chris-wong-dds`), the absent/untracked local Vercel link, safe form QA, and
  exact production readback requirements.

## Required pre-release evidence

- [x] `git status --short` contains only intentional release files.
- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm audit --prod --audit-level=high`
- [x] `pnpm run check`
- [x] `pnpm run test:api`
- [x] `pnpm run test:routes`
- [x] `pnpm run test:design-system`
- [x] `node scripts/mobile-ux-source.test.mjs`
- [x] `pnpm exec tsx scripts/contact-form-ux.test.ts`
- [x] `pnpm exec tsx scripts/og-meta-check.ts`
- [x] `pnpm run test:gallery`
- [x] `pnpm run test:reviews`
- [x] `pnpm run test:mobile` (34 browser tests)
- [x] `pnpm run test:production`
- [x] `pnpm run build:perf`
- [x] `NEXT_DIST_DIR=.next-perf pnpm run test:bundle`
- [x] Start the perf build, then run
  `PERF_BASE_URL=http://localhost:3101 pnpm run perf:smoke` and
  `LIGHTHOUSE_BASE_URL=http://localhost:3101 LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse`.
- [x] Browser QA at phone, tablet, desktop, and wide-desktop widths covers `/`,
  `/services`, `/invisalign`, `/gallery`, `/schedule`, `/contact`, and one blog
  post, including keyboard navigation and reduced motion.
- [x] No current local or live test sends a synthetic form, newsletter, CRM, Slack, or
  appointment payload to a production vendor.

Local validation snapshot (2026-08-30):

- Production dependency audit: zero known vulnerabilities.
- Production build: 90 generated pages; homepage first-load JS 175 kB; all
  route bundle budgets passed.
- Mobile browser suite: 34/34 passed.
- Runtime SEO: 34/34 indexable pages passed title and description checks;
  34 visited, zero indexable orphans; 66 JSON-LD payloads parsed and passed.
- Runtime images: 66 routes and 92 unique image URLs passed, including non-empty
  optimized image-byte verification.
- Three-run local Lighthouse regression matrix: six critical routes passed;
  each median performance score was 1.00 with 0 ms total blocking time.
- Responsive browser sweep: seven critical routes passed at 390, 768, 1440,
  and 1920 px widths with one H1, complete landmarks, and zero broken images;
  the dedicated mobile suite separately enforced horizontal overflow and
  interaction behavior.
- Protected Vercel preview: deployment `dpl_G8L7WqPjd8cZrdZJ4abReDNdAtvd`
  reached `Ready` in project `chris-wong-dds`; key pages, read-only APIs, RSS,
  redirects, robots, sitemap, canonicals, and raw HTML checks passed through
  authenticated deployment readback.
- Safety note: before the outbound newsletter test was isolated, the initial
  baseline run sent one clearly synthetic `newsletter-tester@example.com`
  submission to the configured Formspree fallback. The test now mocks and
  restores `fetch`, and the full final API suite made no external submissions.

## Release and SHA verification

- [x] Fetch `origin/main` and confirm the release contains current main without
  a force push.
- [x] Push the reviewed release commit to `main`.
- [x] Confirm `git rev-parse HEAD` equals `git rev-parse origin/main`.
- [x] Confirm the Git-triggered deployment belongs to Vercel project
  `chris-wong-dds`, targets production, is `Ready`, and references the release
  commit SHA.
- [x] A manual deploy was not necessary. The verified Git-triggered deployment
  completed successfully.
- [x] If a manual deploy is necessary, confirm the tree is clean, run
  `vercel link --yes --scope enzo-design-prisms-projects --project chris-wong-dds`,
  inspect `.vercel/project.json`, and only then run `vercel --prod --yes`.
  This procedure was validated but not used for this release.

## Required production readback

- [x] `https://www.chriswongdds.com` returns `200`; the apex host permanently
  redirects to the same path on `www`.
- [x] `vercel inspect https://www.chriswongdds.com` reports the intended Ready
  production deployment.
- [x] `/`, `/services`, `/invisalign`, `/gallery`, `/schedule`, `/contact`,
  `/blog`, and a seeded blog article render correctly in a real browser.
- [x] Mobile navigation, phone/email links, appointment CTAs, gallery playback,
  keyboard focus, and form validation work. Do not submit fake live leads.
- [x] Raw HTML contains one title, description, canonical, and robots directive;
  JSON-LD is valid and does not contain expired temporary-hours data.
- [x] `robots.txt` and all sitemap indexes respond correctly, use the canonical
  host, and omit retired routes.
- [x] `SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all`
- [x] `IMAGE_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:images`
- [x] `LIGHTHOUSE_BASE_URL=https://www.chriswongdds.com LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse`
- [x] Read-only APIs (`/api/services`, `/api/blog-posts`, `/api/testimonials`,
  `/rss.xml`) return expected production responses.
- [x] Record final commit SHA, Vercel deployment ID, production timestamp, test
  results, and measured Lighthouse values before marking this release complete.

## Final production record

- Verified at: 2026-08-30 16:46 PDT (`2026-08-30T23:46:40Z`)
- Application release commit: `206082d666e6d642280cb355286b696a2ad95bf7`
- Production deployment: `dpl_9whzeQWLXJaJ5aMsTnVJuqyJ4Ynn` (`Ready`)
- GitHub CI: run `33341956835` (`success`)
- Production dependency audit: zero known vulnerabilities
- Production SEO crawl: 34/34 metadata checks, zero indexable orphans, 66
  validated JSON-LD payloads
- Production image crawl: 66 routes and 92 unique image URLs passed
- Production performance smoke: nine key routes passed

Three-run synthetic Lighthouse results against the public domain:

| Route | Performance | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: |
| `/` | 0.95 | 2,397 ms | 0.000 | 0 ms |
| `/services` | 0.95 | 2,334 ms | 0.000 | 0 ms |
| `/invisalign` | 0.95 | 2,360 ms | 0.000 | 0 ms |
| `/dentist-menlo-park` | 0.94 | 2,461 ms | 0.000 | 0 ms |
| `/gallery` | 0.95 | 2,330 ms | 0.000 | 0 ms |
| `/schedule` | 0.96 | 2,317 ms | 0.000 | 0 ms |

These are repeatable lab measurements, not field Core Web Vitals. The report was
finalized after production readback; its docs-only commit does not change the
verified application runtime.
