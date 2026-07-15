import { seoByPath, type SeoDefinition } from "@shared/seo";

export const CANONICAL_BASE = "https://www.chriswongdds.com";

export type SitemapXmlEntry = {
  url: string;
  lastmod?: string;
};

export function getClusterSitemapEntries(
  cluster: NonNullable<SeoDefinition["seoCluster"]>,
): SitemapXmlEntry[] {
  const seen = new Set<string>();
  const entries: SitemapXmlEntry[] = [];

  for (const entry of Object.values(seoByPath)) {
    if (!entry.indexable) continue;
    if (entry.seoCluster !== cluster) continue;
    if (seen.has(entry.canonicalPath)) continue;
    seen.add(entry.canonicalPath);
    entries.push({
      url: `${CANONICAL_BASE}${entry.canonicalPath === "/" ? "/" : entry.canonicalPath}`,
      lastmod: entry.lastmod,
    });
  }

  return entries;
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

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
