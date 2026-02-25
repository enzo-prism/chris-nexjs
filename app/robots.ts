import type { MetadataRoute } from "next";
import { seoByPath } from "@shared/seo";

const CANONICAL_HOST = "https://www.chriswongdds.com";
const noIndexPaths = Object.values(seoByPath)
  .filter((entry) => !entry.indexable)
  .map((entry) => entry.canonicalPath);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...noIndexPaths, "/api/"],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        crawlDelay: 1,
      },
      {
        userAgent: "Bingbot",
        crawlDelay: 2,
      },
      {
        userAgent: "AhrefsBot",
        disallow: "/",
      },
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
      {
        userAgent: "DotBot",
        disallow: "/",
      },
    ],
    sitemap: `${CANONICAL_HOST}/sitemap.xml`,
    host: CANONICAL_HOST,
  };
}
