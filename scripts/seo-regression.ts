import { getCanonicalRouteData } from "../app/route-utils";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import {
  getIndexablePaths,
  getSitemapEntries,
  seoByPath,
} from "../shared/seo";
import { generateMetadata } from "../app/[...slug]/page";
import { getStorage } from "../server/storage/repository";

interface Failure {
  message: string;
}

const noindexPaths = new Set(
  Object.values(seoByPath)
    .filter((entry) => !entry.indexable)
    .map((entry) => entry.canonicalPath),
);

const legacyAliases = [
  "/about-us",
  "/dr-chris-wong",
  "/post/emergency-dental-care-palo-alto",
  "/services/invisalign",
];

function toPathParams(path: string): { slug?: string[] } {
  if (path === "/") {
    return {};
  }
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return normalized ? { slug: normalized.split("/") } : {};
}

function toRouteParams(path: string): { params: { slug?: string[] } } {
  return { params: toPathParams(path) };
}

function pathFromLoc(loc: string): string {
  const baseRemoved = loc.replace(/^https?:\/\/[^/]+/i, "");
  return baseRemoved === "" ? "/" : baseRemoved;
}

function normalizeRobots(value: unknown): string {
  if (typeof value === "string") return value.toLowerCase();
  if (
    value &&
    typeof value === "object" &&
    "index" in value &&
    "follow" in value
  ) {
    const typed = value as { index: boolean; follow: boolean };
    return `${typed.index ? "index" : "noindex"}, ${typed.follow ? "follow" : "nofollow"}`;
  }
  return "";
}

async function main(): Promise<void> {
  const errors: Failure[] = [];
  const warnings: string[] = [];

  const expectedIndexable = new Set(getIndexablePaths());
  const expectedSitemapEntries = new Set(getSitemapEntries().map((entry) => entry.canonicalPath));

  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();
  const generated = await sitemap();

  const generatedPaths = new Set<string>(
    generated.map((entry) => pathFromLoc(entry.url)),
  );

  const expectedBlogPaths = new Set(blogPosts.map((post) => `/blog/${post.slug}`));
  const expectedAll = new Set<string>([...expectedSitemapEntries, ...expectedBlogPaths]);

  expectedAll.forEach((path) => {
    if (!generatedPaths.has(path)) {
      errors.push({ message: `Sitemap missing expected path: ${path}` });
    }
  });

  generatedPaths.forEach((path) => {
    if (expectedBlogPaths.has(path)) {
      return;
    }
    if (!expectedSitemapEntries.has(path)) {
      warnings.push(`Unexpected sitemap path present: ${path}`);
    }
  });

  noindexPaths.forEach((path) => {
    if (expectedSitemapEntries.has(path)) {
      errors.push({ message: `Noindex path appears in sitemap static entries: ${path}` });
    }
    if (generatedPaths.has(path)) {
      errors.push({ message: `Noindex path appears in rendered sitemap output: ${path}` });
    }
  });

  expectedIndexable.forEach((path) => {
    if (!expectedSitemapEntries.has(path)) {
      errors.push({ message: `Indexable path missing from getSitemapEntries: ${path}` });
    }
  });

  expectedSitemapEntries.forEach((path) => {
    if (!expectedIndexable.has(path)) {
      errors.push({ message: `Sitemap static path is not indexable: ${path}` });
    }
  });

  for (const path of legacyAliases) {
    const canonical = getCanonicalRouteData(path);
    if (!canonical) {
      errors.push({ message: `Legacy alias has no canonical route: ${path}` });
      continue;
    }

    const metadata = (await generateMetadata(toRouteParams(canonical))) as {
      title?: string;
      robots?: unknown;
    };
    if (typeof metadata.title !== "string" || metadata.title.length === 0) {
      errors.push({ message: `Metadata missing title for ${canonical}` });
    }

    if (!canonical.startsWith("/blog/") && !canonical.includes("#")) {
      const isNoindex = normalizeRobots(metadata.robots).includes("noindex");
      if (!expectedIndexable.has(canonical) && !isNoindex) {
        warnings.push(`${canonical} metadata is indexable but is not in indexable paths.`);
      }
    }
  }

  const robotsConfig = robots();
  const primaryRule = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules[0]
    : robotsConfig.rules;
  const primaryDisallow = primaryRule?.disallow;
  const disallowValues = primaryDisallow
    ? Array.isArray(primaryDisallow)
      ? primaryDisallow
      : [primaryDisallow]
    : [];
  if (!disallowValues.length) {
    errors.push({ message: "robots config missing expected disallow list" });
  } else {
    const disallow = new Set(disallowValues);
    noindexPaths.forEach((entry) => {
      if (!disallow.has(entry) && entry !== "/api/") {
        warnings.push(`Noindex path is not explicitly blocked in robots: ${entry}`);
      }
    });
  }

  for (const path of expectedIndexable) {
    const meta = (await generateMetadata(toRouteParams(path))) as {
      robots?: unknown;
    };
    const robotsValue = normalizeRobots(meta.robots);
    if (!robotsValue.includes("index")) {
      errors.push({ message: `Expected indexable metadata to include index for ${path}` });
    }
  }

  if (errors.length) {
    console.error("SEO regression failed:");
    errors.forEach((entry) => console.error(`- ${entry.message}`));
    process.exit(1);
  }

  if (warnings.length) {
    warnings.forEach((warning) => console.warn(`WARN: ${warning}`));
  }

  console.log("SEO regression checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
