import {
  buildSitemapIndexXml,
  getSitemapIndexEntries,
  xmlResponse,
} from "../sitemap-xml-utils";

export const dynamic = "force-static";

// Root sitemap: a <sitemapindex> over the segment sitemaps, so each URL is
// listed once (it used to duplicate every segment as a full urlset).
export async function GET(): Promise<Response> {
  return xmlResponse(buildSitemapIndexXml(await getSitemapIndexEntries()));
}
