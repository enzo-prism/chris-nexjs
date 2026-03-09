import type { MetadataRoute } from "next";
import { CANONICAL_HOST, getRobotsRules } from "@shared/robots";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: getRobotsRules(),
    sitemap: `https://${CANONICAL_HOST}/sitemap.xml`,
  };
}
