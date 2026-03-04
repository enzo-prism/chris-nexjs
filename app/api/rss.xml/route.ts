import { NextResponse } from "next/server";
import { buildExcerpt, seoByPath } from "@shared/seo";
import { type BlogPost } from "@shared/schema";
import { officeInfo } from "@shared/officeInfo";
import { getStorage } from "../../../server/storage/repository";

const BASE_URL = "https://www.chriswongdds.com";
const FEED_URL = `${BASE_URL}/rss.xml`;

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
    const latestPostDate = posts
      .map((post) => Date.parse(post.date))
      .filter((timestamp) => !Number.isNaN(timestamp))
      .sort((a, b) => b - a)[0];
    const lastBuildDate = latestPostDate
      ? new Date(latestPostDate).toUTCString()
      : new Date().toUTCString();
    const managingEditor = `${officeInfo.email} (${officeInfo.name})`;

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
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <atom:link href="${escapeXml(FEED_URL)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(channelDescription)}</description>
    <language>en-US</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <managingEditor>${escapeXml(managingEditor)}</managingEditor>
    <webMaster>${escapeXml(managingEditor)}</webMaster>
    <ttl>60</ttl>
${itemsXml ? `${itemsXml}\n` : ""}  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json("Error generating rss feed", { status: 500 });
  }
}
