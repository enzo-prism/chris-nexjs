# 2026-08-30 Site Overhaul Release Candidate

Status: pre-release validation complete; production deployment is not yet
recorded. Nothing in this document is evidence of a completed production
deployment until the release, SHA, and production-readback sections are checked.

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
  34 visited, zero indexable orphans; structured data passed on 66 pages.
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

- [ ] Fetch `origin/main` and confirm the release contains current main without
  a force push.
- [ ] Push the reviewed release commit to `main`.
- [ ] Confirm `git rev-parse HEAD` equals `git rev-parse origin/main`.
- [ ] Confirm the Git-triggered deployment belongs to Vercel project
  `chris-wong-dds`, targets production, is `Ready`, and references the release
  commit SHA.
- [ ] If a manual deploy is necessary, confirm the tree is clean, run
  `vercel link --yes --scope enzo-design-prisms-projects --project chris-wong-dds`,
  inspect `.vercel/project.json`, and only then run `vercel --prod --yes`.

## Required production readback

- [ ] `https://www.chriswongdds.com` returns `200`; the apex host permanently
  redirects to the same path on `www`.
- [ ] `vercel inspect https://www.chriswongdds.com` reports the intended Ready
  production deployment.
- [ ] `/`, `/services`, `/invisalign`, `/gallery`, `/schedule`, `/contact`,
  `/blog`, and a seeded blog article render correctly in a real browser.
- [ ] Mobile navigation, phone/email links, appointment CTAs, gallery playback,
  keyboard focus, and form validation work. Do not submit fake live leads.
- [ ] Raw HTML contains one title, description, canonical, and robots directive;
  JSON-LD is valid and does not contain expired temporary-hours data.
- [ ] `robots.txt` and all sitemap indexes respond correctly, use the canonical
  host, and omit retired routes.
- [ ] `SEO_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:seo:all`
- [ ] `IMAGE_AUDIT_BASE_URL=https://www.chriswongdds.com pnpm run test:images`
- [ ] `LIGHTHOUSE_BASE_URL=https://www.chriswongdds.com LIGHTHOUSE_RUNS=3 pnpm run perf:lighthouse`
- [ ] Read-only APIs (`/api/services`, `/api/blog-posts`, `/api/testimonials`,
  `/rss.xml`) return expected production responses.
- [ ] Record final commit SHA, Vercel deployment ID, production timestamp, test
  results, and measured Lighthouse values before marking this release complete.
