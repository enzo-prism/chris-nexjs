import {
  buildUrlsetXml,
  getClusterSitemapEntries,
  xmlResponse,
} from "../sitemap-xml-utils";

export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return xmlResponse(buildUrlsetXml(getClusterSitemapEntries("location")));
}
