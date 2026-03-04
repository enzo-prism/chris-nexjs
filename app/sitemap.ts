import { getSitemapEntries } from "@shared/seo";
import type { MetadataRoute } from "next";
import { getStorage } from "../server/storage/repository";

const CANONICAL_BASE = "https://www.chriswongdds.com";

function parseLastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();

  const staticEntries = getSitemapEntries().map((entry) => {
    const lastModified = parseLastModified(entry.lastmod);
    return {
      url: `${CANONICAL_BASE}${entry.canonicalPath}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: entry.changefreq,
      priority: entry.priority,
    };
  });

  const blogEntries = blogPosts.map((post) => {
    const lastModified = parseLastModified(post.date);
    return {
      url: `${CANONICAL_BASE}/blog/${post.slug}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticEntries, ...blogEntries];
}
