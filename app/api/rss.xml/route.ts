import { NextResponse } from "next/server";
import { buildExcerpt, seoByPath } from "@shared/seo";
import { type BlogPost } from "@shared/schema";
import { getStorage } from "../../../server/storage/repository";

const BASE_URL = "https://www.chriswongdds.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const storage = await getStorage();
    const posts = (await storage.getBlogPosts()) as BlogPost[];
    const blogSeo = seoByPath["/blog"];

    posts.sort((a, b) => {
      const aTime = Date.parse(a.date);
      const bTime = Date.parse(b.date);
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime;
    });

    const channelTitle = blogSeo?.title ?? "Dental Health Blog";
    const channelDescription = blogSeo?.description ?? "";
    const channelLink = `${BASE_URL}/blog`;

    const itemsXml = posts
      .map((post) => {
        const link = `${BASE_URL}/blog/${post.slug}`;
        const parsedDate = Date.parse(post.date);
        const pubDate = Number.isNaN(parsedDate)
          ? ""
          : `\n      <pubDate>${new Date(parsedDate).toUTCString()}</pubDate>`;
        const description = escapeXml(buildExcerpt(post.content));
        const title = escapeXml(post.title);
        return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>${pubDate}
      <description>${description}</description>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDescription)}</description>
${itemsXml ? `${itemsXml}\n` : ""}  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch {
    return NextResponse.json("Error generating rss feed", { status: 500 });
  }
}
