import { getSitemapEntries } from "@shared/seo";
import type { MetadataRoute } from "next";
import { getStorage } from "../server/storage/repository";

const CANONICAL_BASE = "https://www.chriswongdds.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();

  const now = new Date();

  const staticEntries = getSitemapEntries().map((entry) => ({
    url: `${CANONICAL_BASE}${entry.canonicalPath}`,
    lastModified: entry.lastmod ? new Date(entry.lastmod) : now,
    changeFrequency: entry.changefreq,
    priority: entry.priority,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${CANONICAL_BASE}/blog/${post.slug}`,
    lastModified: Number.isNaN(Date.parse(post.date))
      ? now
      : new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
