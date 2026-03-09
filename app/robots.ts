import type { MetadataRoute } from "next";
import { seoByPath } from "@shared/seo";

const CANONICAL_HOST = "www.chriswongdds.com";
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
    sitemap: `https://${CANONICAL_HOST}/sitemap.xml`,
    host: CANONICAL_HOST,
  };
}
