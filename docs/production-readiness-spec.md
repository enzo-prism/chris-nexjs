# Production Readiness Spec (Next.js + Vercel)

Defines release quality for this repository and the exact gates that must pass before production promotion.

## Product goals

- Preserve route and API behavior during Next.js migration.
- Maintain SEO correctness and crawlability.
- Keep UI consistency with shadcn-based component standards.
- Keep performance, accessibility, and safety checks measurable.

## Release criteria

1. Routing and redirects:
- Canonical paths resolve with correct metadata and canonical URL.
- Legacy aliases resolve to canonical destinations in one hop when applicable.
- Blog routes resolve correctly for seeded post slugs.

Required gate:
- `pnpm run test:routes`

2. API contract stability:
- Endpoint status codes and validation behavior stay contract-compatible.
- Error payloads remain stable for invalid input and missing entities.

Required gate:
- `pnpm run test:api`

3. SEO integrity:
- Sitemap and robots align with `shared/seo.ts` indexable/noindex definitions.
- Indexable pages remain indexable.
- Noindex pages stay out of sitemap.

Required gates:
- `pnpm run test:seo`
- `pnpm run test:seo:onpage`
- `pnpm run test:seo:links`
- `pnpm run test:seo:schema`

4. Design-system guard:
- Shared UI avoids raw primitive drift where shadcn wrappers exist.

Required gate:
- `pnpm run test:design-system`

5. Image integrity:
- Local image references resolve.
- Runtime image URLs return valid image responses.

Required gate:
- `pnpm run test:images`

6. Type and safety baseline:
- TypeScript compiles.
- Business-info safety checks pass.
- Production build succeeds.

Required gates:
- `pnpm run check`
- `pnpm run build`

7. Performance gate:
- Route bundle budgets pass.
- Perf smoke routes pass before Lighthouse.
- Lighthouse budget passes for target routes.

Required gates:
- `pnpm run build:perf`
- `pnpm run test:bundle`
- `pnpm run perf:smoke`
- `pnpm run perf:lighthouse`

8. Aggregate gate:
- Full release gate passes in sequence.

Required gate:
- `pnpm run test:production`

## Editorial consistency rule

Doctor name formatting must follow one of:
- `Dr. Christopher B. Wong`
- `Christopher B. Wong, DDS`

Never combine `Dr.` and `DDS` in the same line.

## Operational recommendations

- Run `pnpm run test:production` before merging to `main`.
- Run Lighthouse against preview URL before production promotion.
- Keep route metadata, redirects, and canonical config synchronized across:
  - `shared/seo.ts`
  - `shared/redirects.ts`
  - `vercel.json`
  - middleware behavior

## References

- [Next.js App Router migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js metadata conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Vercel redirects](https://vercel.com/docs/redirects)
- [shadcn/ui docs](https://ui.shadcn.com/docs)
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Core Web Vitals](https://web.dev/articles/vitals)
