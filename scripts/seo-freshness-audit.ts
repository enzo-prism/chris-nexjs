/**
 * Sitemap freshness watchdog (SEO backlog P1 ticket #6).
 *
 * Sitemap lastmod values that drift far behind reality teach crawlers to
 * distrust the sitemap. This audit fails when any indexable route that
 * declares a lastmod is older than its cluster's staleness threshold.
 *
 * 2026-10-16 (Rooted redesign): every indexable route now declares a lastmod,
 * so a missing lastmod is enforced (it used to be a warning), and a lastmod
 * dated in the future fails too — both keep the sitemap honest.
 *
 * Usage: pnpm run test:seo:freshness
 */
import { seoByPath, type SeoDefinition } from "../shared/seo";

const DAY_MS = 24 * 60 * 60 * 1000;

const STALE_THRESHOLD_DAYS: Record<
  NonNullable<SeoDefinition["seoCluster"]>,
  number
> = {
  service: 180,
  location: 180,
  blog: 180,
  trust: 365,
  legal: 730,
};

type Finding = {
  path: string;
  cluster: string;
  lastmod: string;
  ageDays: number;
  thresholdDays: number;
};

function main(): void {
  const now = Date.now();
  const stale: Finding[] = [];
  const missing: string[] = [];
  const future: string[] = [];
  const seen = new Set<string>();

  for (const entry of Object.values(seoByPath)) {
    if (!entry.indexable) continue;
    if (seen.has(entry.canonicalPath)) continue;
    seen.add(entry.canonicalPath);

    const cluster = entry.seoCluster ?? "trust";
    if (!entry.lastmod) {
      missing.push(entry.canonicalPath);
      continue;
    }

    const lastmodTime = Date.parse(entry.lastmod);
    if (Number.isNaN(lastmodTime)) {
      stale.push({
        path: entry.canonicalPath,
        cluster,
        lastmod: entry.lastmod,
        ageDays: Number.POSITIVE_INFINITY,
        thresholdDays: STALE_THRESHOLD_DAYS[cluster],
      });
      continue;
    }

    // Allow one day of slack for timezone differences (dates are PT days).
    if (lastmodTime - now > DAY_MS) {
      future.push(`${entry.canonicalPath} (${entry.lastmod})`);
      continue;
    }

    const ageDays = Math.floor((now - lastmodTime) / DAY_MS);
    const thresholdDays = STALE_THRESHOLD_DAYS[cluster];
    if (ageDays > thresholdDays) {
      stale.push({
        path: entry.canonicalPath,
        cluster,
        lastmod: entry.lastmod,
        ageDays,
        thresholdDays,
      });
    }
  }

  const report = {
    checkedAt: new Date(now).toISOString(),
    indexableRoutes: seen.size,
    staleRoutes: stale,
    routesWithoutLastmod: missing,
    futureLastmod: future,
  };
  console.log(JSON.stringify(report, null, 2));

  if (stale.length > 0) {
    console.error(
      `\nFreshness audit failed: ${stale.length} route(s) have stale lastmod values.`,
    );
    for (const finding of stale) {
      console.error(
        `- ${finding.path} (${finding.cluster}): lastmod ${finding.lastmod} is ${finding.ageDays}d old (threshold ${finding.thresholdDays}d). Refresh the page content and update LASTMOD_OVERRIDES in shared/seo.ts.`,
      );
    }
    process.exit(1);
  }

  if (missing.length > 0 || future.length > 0) {
    if (missing.length > 0) {
      console.error(
        `\nFreshness audit failed: ${missing.length} indexable route(s) declare no lastmod: ${missing.join(", ")}. Add them to LASTMOD_OVERRIDES in shared/seo.ts.`,
      );
    }
    if (future.length > 0) {
      console.error(
        `\nFreshness audit failed: lastmod dated in the future: ${future.join(", ")}.`,
      );
    }
    process.exit(1);
  }

  console.log(`\nFreshness audit passed. lastmod=${seen.size} missing=0 future=0`);
}

main();
