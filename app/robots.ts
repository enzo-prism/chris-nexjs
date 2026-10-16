import type { MetadataRoute } from "next";
import { CANONICAL_HOST, getRobotsRules } from "@shared/robots";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: getRobotsRules(),
    // /sitemap.xml is a <sitemapindex> over the page, service, location, and
    // blog segments, so it is the only sitemap robots needs to submit.
    sitemap: [`https://${CANONICAL_HOST}/sitemap.xml`],
  };
}
