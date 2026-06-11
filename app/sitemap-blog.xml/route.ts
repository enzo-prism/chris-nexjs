import {
  CANONICAL_BASE,
  buildUrlsetXml,
  getClusterSitemapEntries,
  xmlResponse,
  type SitemapXmlEntry,
} from "../sitemap-xml-utils";
import { getStorage } from "../../server/storage/repository";

export const dynamic = "force-static";

function toIsoDate(value: string): string | undefined {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return undefined;
  return new Date(time).toISOString().split("T")[0];
}

export async function GET(): Promise<Response> {
  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();

  const postEntries: SitemapXmlEntry[] = blogPosts.map((post) => ({
    url: `${CANONICAL_BASE}/blog/${post.slug}`,
    lastmod: toIsoDate(post.date),
    changefreq: "monthly",
    priority: 0.6,
  }));

  return xmlResponse(
    buildUrlsetXml([...getClusterSitemapEntries("blog"), ...postEntries]),
  );
}
