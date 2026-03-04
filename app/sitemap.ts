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

function getBlogPriority(lastModified?: Date): number {
  if (!lastModified) return 0.6;
  const now = Date.now();
  const ageDays = Math.max(
    0,
    Math.floor((now - lastModified.getTime()) / (1000 * 60 * 60 * 24)),
  );
  if (ageDays <= 30) return 0.8;
  if (ageDays <= 90) return 0.7;
  return 0.6;
}

function getBlogChangeFrequency(lastModified?: Date): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (!lastModified) return "monthly";
  const now = Date.now();
  const ageDays = Math.max(
    0,
    Math.floor((now - lastModified.getTime()) / (1000 * 60 * 60 * 24)),
  );
  return ageDays <= 90 ? "weekly" : "monthly";
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
      changeFrequency: getBlogChangeFrequency(lastModified),
      priority: getBlogPriority(lastModified),
    };
  });

  return [...staticEntries, ...blogEntries];
}
