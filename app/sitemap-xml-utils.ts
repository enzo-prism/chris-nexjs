import { seoByPath, type SeoDefinition } from "@shared/seo";
import { getStorage } from "../server/storage/repository";

export const CANONICAL_BASE = "https://www.chriswongdds.com";

export type SitemapXmlEntry = {
  url: string;
  lastmod?: string;
};

/**
 * The root /sitemap.xml is a <sitemapindex> over these segment urlsets, so
 * every URL is listed exactly once:
 *   - pages:     home, trust and legal pages
 *   - services:  service pages (seoCluster "service")
 *   - locations: the /locations hub and the city pages
 *   - blog:      /blog and every post
 */
export const SITEMAP_SEGMENTS = ["pages", "services", "locations", "blog"] as const;
export type SitemapSegment = (typeof SITEMAP_SEGMENTS)[number];

export function sitemapSegmentPath(segment: SitemapSegment): string {
  return `/sitemap-${segment}.xml`;
}

function segmentForEntry(entry: SeoDefinition): SitemapSegment {
  // The homepage defaults to the "service" SEO cluster, but it belongs with
  // the site's primary pages rather than in the services list.
  if (entry.canonicalPath === "/") return "pages";
  switch (entry.seoCluster) {
    case "service":
      return "services";
    case "location":
      return "locations";
    case "blog":
      return "blog";
    default:
      return "pages";
  }
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return undefined;
  return new Date(time).toISOString().split("T")[0];
}

/** Indexable static routes from shared/seo.ts for one segment (no blog posts). */
export function getStaticSegmentEntries(segment: SitemapSegment): SitemapXmlEntry[] {
  const seen = new Set<string>();
  const entries: SitemapXmlEntry[] = [];

  for (const entry of Object.values(seoByPath)) {
    if (!entry.indexable) continue;
    if (segmentForEntry(entry) !== segment) continue;
    if (seen.has(entry.canonicalPath)) continue;
    seen.add(entry.canonicalPath);
    entries.push({
      url: `${CANONICAL_BASE}${entry.canonicalPath === "/" ? "/" : entry.canonicalPath}`,
      lastmod: toIsoDate(entry.lastmod),
    });
  }

  return entries;
}

/** Every URL for one segment, including blog posts from storage. */
export async function getSegmentEntries(
  segment: SitemapSegment,
): Promise<SitemapXmlEntry[]> {
  const entries = getStaticSegmentEntries(segment);
  if (segment !== "blog") return entries;

  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();
  const postEntries: SitemapXmlEntry[] = blogPosts.map((post) => ({
    url: `${CANONICAL_BASE}/blog/${post.slug}`,
    lastmod: toIsoDate(post.date),
  }));
  return [...entries, ...postEntries];
}

function latestLastmod(entries: SitemapXmlEntry[]): string | undefined {
  // ISO yyyy-mm-dd strings sort chronologically.
  return entries
    .map((entry) => entry.lastmod)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
}

export type SitemapIndexEntry = {
  segment: SitemapSegment;
  url: string;
  lastmod?: string;
};

/** Child sitemaps for the root index; each lastmod is its newest URL's lastmod. */
export async function getSitemapIndexEntries(): Promise<SitemapIndexEntry[]> {
  return Promise.all(
    SITEMAP_SEGMENTS.map(async (segment) => ({
      segment,
      url: `${CANONICAL_BASE}${sitemapSegmentPath(segment)}`,
      lastmod: latestLastmod(await getSegmentEntries(segment)),
    })),
  );
}

export function buildUrlsetXml(entries: SitemapXmlEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${entry.url}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const sitemaps = entries
    .map((entry) => {
      const parts = [`    <loc>${entry.url}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
