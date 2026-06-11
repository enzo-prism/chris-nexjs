import type { MetadataRoute } from "next";
import { CANONICAL_HOST, getRobotsRules } from "@shared/robots";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: getRobotsRules(),
    sitemap: [
      `https://${CANONICAL_HOST}/sitemap.xml`,
      `https://${CANONICAL_HOST}/sitemap-services.xml`,
      `https://${CANONICAL_HOST}/sitemap-locations.xml`,
      `https://${CANONICAL_HOST}/sitemap-blog.xml`,
    ],
  };
}
