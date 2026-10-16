/**
 * Runtime JSON-LD audit (pnpm run test:seo:schema; set SEO_AUDIT_BASE_URL).
 *
 * 2026-10-16 (Rooted redesign) changes to the intended behavior:
 *   - `@graph` documents are flattened (buildServiceSchema now returns one
 *     node whose @graph holds MedicalWebPage + Service [+ MedicalProcedure]).
 *   - The homepage WebSite must NOT carry a SearchAction any more (Google
 *     retired the sitelinks search box; the site has no search). It used to be
 *     required.
 *   - HowTo is rejected (rich result retired in 2023), and so are Review /
 *     AggregateRating / aggregateRating anywhere (self-serving reviews).
 *   - MedicalWebPage needs reviewedBy + lastReviewed; Service.image must not
 *     be a favicon; VideoObject needs name, description, thumbnailUrl,
 *     uploadDate and contentUrl/embedUrl; Person.name must not repeat "Dr.".
 *   - /about must expose a ProfilePage whose mainEntity is a Person.
 */
import { getStorage } from "../server/storage/repository";
import { generateMetadata } from "../app/[...slug]/page";
import { getIndexablePaths, getSeoForPath } from "../shared/seo";

type Failure = {
  path: string;
  message: string;
};

type JsonRecord = Record<string, unknown>;

const BASE_URL = process.env.SEO_AUDIT_BASE_URL ?? "http://localhost:3000";
const CANONICAL_HOST = "www.chriswongdds.com";

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  const regex =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = regex.exec(html);
  while (match) {
    if (match[1]) blocks.push(match[1]);
    match = regex.exec(html);
  }
  return blocks;
}

function flattenNodes(value: unknown): JsonRecord[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenNodes(entry));
  }
  if (typeof value === "object") {
    const record = value as JsonRecord;
    const graph = record["@graph"];
    if (Array.isArray(graph)) {
      return flattenNodes(graph);
    }
    return [record];
  }
  return [];
}

function nodeHasType(node: JsonRecord, type: string): boolean {
  const rawType = node["@type"];
  return rawType === type || (Array.isArray(rawType) && rawType.includes(type));
}

// Visit every nested object (including inline nodes such as Service.provider).
function walkObjects(value: unknown, visit: (record: JsonRecord) => void): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => walkObjects(entry, visit));
    return;
  }
  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    visit(record);
    Object.values(record).forEach((entry) => walkObjects(entry, visit));
  }
}

function validateNodeContracts(nodes: JsonRecord[], path: string, failures: Failure[]): void {
  walkObjects(nodes, (record) => {
    if (nodeHasType(record, "Review") || nodeHasType(record, "AggregateRating")) {
      failures.push({ path, message: "Review/AggregateRating schema is not allowed" });
    }
    if ("aggregateRating" in record || "review" in record) {
      failures.push({ path, message: "aggregateRating/review properties are not allowed" });
    }
    if (nodeHasType(record, "HowTo")) {
      failures.push({ path, message: "HowTo schema is retired; remove it" });
    }
    if (nodeHasType(record, "Person")) {
      const name = record.name;
      if (typeof name === "string" && /^Dr\.?\s/i.test(name)) {
        failures.push({
          path,
          message: `Person name should not include the honorific (use honorificPrefix): ${name}`,
        });
      }
    }
  });

  for (const node of nodes) {
    if (nodeHasType(node, "MedicalWebPage")) {
      if (!node.reviewedBy) {
        failures.push({ path, message: "MedicalWebPage is missing reviewedBy" });
      }
      if (typeof node.lastReviewed !== "string" || !node.lastReviewed) {
        failures.push({ path, message: "MedicalWebPage is missing lastReviewed" });
      }
    }
    if (nodeHasType(node, "Service")) {
      const image = node.image;
      if (typeof image === "string" && /favicon|apple-touch-icon/i.test(image)) {
        failures.push({ path, message: `Service image is a favicon, not a photo: ${image}` });
      }
    }
    if (nodeHasType(node, "VideoObject")) {
      for (const field of ["name", "description", "thumbnailUrl", "uploadDate"] as const) {
        if (!node[field]) {
          failures.push({ path, message: `VideoObject is missing ${field}` });
        }
      }
      if (!node.contentUrl && !node.embedUrl) {
        failures.push({ path, message: "VideoObject needs contentUrl or embedUrl" });
      }
    }
  }
}

function getNodeTypes(nodes: JsonRecord[]): Set<string> {
  const types = new Set<string>();
  for (const node of nodes) {
    const rawType = node["@type"];
    if (typeof rawType === "string") {
      types.add(rawType);
      continue;
    }
    if (Array.isArray(rawType)) {
      rawType.forEach((entry) => {
        if (typeof entry === "string") types.add(entry);
      });
    }
  }
  return types;
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const response = await fetch(new URL(path, BASE_URL).toString(), {
    redirect: "follow",
  });
  return {
    status: response.status,
    html: await response.text(),
  };
}

function toRouteParams(path: string): { params: { slug?: string[] } } {
  if (path === "/") return { params: {} };
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return { params: normalized ? { slug: normalized.split("/") } : {} };
}

function hasWebSiteSearchAction(node: JsonRecord): boolean {
  if (node["@type"] !== "WebSite") return false;
  const action = node.potentialAction;
  if (!action || typeof action !== "object") return false;
  const actionType = (action as JsonRecord)["@type"];
  if (actionType !== "SearchAction") return false;

  const target = (action as JsonRecord).target;
  if (!target || typeof target !== "object") return false;
  const urlTemplate = (target as JsonRecord).urlTemplate;
  return typeof urlTemplate === "string" && urlTemplate.includes("{search_term_string}");
}

function validateCanonicalUrls(nodes: JsonRecord[], path: string, failures: Failure[]): void {
  for (const node of nodes) {
    const url = node.url;
    if (typeof url !== "string" || !url.startsWith("http")) continue;
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== CANONICAL_HOST) {
        failures.push({
          path,
          message: `JSON-LD url points to non-canonical host: ${url}`,
        });
      }
    } catch {
      failures.push({ path, message: `Invalid JSON-LD url value: ${url}` });
    }
  }
}

async function main(): Promise<void> {
  const failures: Failure[] = [];
  const indexable = getIndexablePaths();
  const storage = await getStorage();
  const blogPaths = (await storage.getBlogPosts()).map((post) => `/blog/${post.slug}`);

  const pathSet = new Set<string>([...indexable, ...blogPaths]);

  for (const path of pathSet) {
    const { status, html } = await fetchHtml(path);
    if (status !== 200) {
      failures.push({ path, message: `Expected 200, received ${status}` });
      continue;
    }

    const cluster = getSeoForPath(path).seoCluster;
    const requiresStructuredData =
      path === "/" ||
      path.startsWith("/blog/") ||
      cluster === "service" ||
      cluster === "location" ||
      path === "/services" ||
      path === "/locations";

    const blocks = extractJsonLdBlocks(html);
    if (blocks.length === 0) {
      if (requiresStructuredData) {
        failures.push({ path, message: "No JSON-LD script blocks found" });
      }
      continue;
    }

    const nodes: JsonRecord[] = [];
    for (const block of blocks) {
      try {
        const parsed = JSON.parse(block);
        nodes.push(...flattenNodes(parsed));
      } catch (error) {
        failures.push({
          path,
          message: `Invalid JSON-LD parse: ${(error as Error).message}`,
        });
      }
    }

    if (nodes.length === 0) {
      failures.push({ path, message: "JSON-LD scripts exist but no object nodes were parsed" });
      continue;
    }

    const types = getNodeTypes(nodes);
    validateCanonicalUrls(nodes, path, failures);
    validateNodeContracts(nodes, path, failures);
    const isClientRenderedRoute = html.includes("BAILOUT_TO_CLIENT_SIDE_RENDERING");

    if (path === "/") {
      if (!types.has("WebSite")) {
        failures.push({ path, message: "Homepage should include WebSite schema" });
      }
      const hasSearchAction = nodes.some((node) => hasWebSiteSearchAction(node));
      if (hasSearchAction) {
        failures.push({
          path,
          message: "Homepage WebSite schema should not include the retired SearchAction",
        });
      }
      if (!types.has("Organization") && !types.has("Dentist")) {
        failures.push({
          path,
          message: "Homepage should include Organization or Dentist schema",
        });
      }
    }

    if (path.startsWith("/blog/")) {
      if (
        !isClientRenderedRoute &&
        !types.has("BlogPosting") &&
        !types.has("Article")
      ) {
        failures.push({
          path,
          message: "Blog post should include BlogPosting or Article schema",
        });
      }
      if (!isClientRenderedRoute && !types.has("BreadcrumbList")) {
        failures.push({ path, message: "Blog post should include BreadcrumbList schema" });
      }
      if (isClientRenderedRoute) {
        const metadata = await generateMetadata(toRouteParams(path));
        const openGraphType =
          metadata.openGraph &&
          typeof metadata.openGraph === "object" &&
          "type" in metadata.openGraph
            ? (metadata.openGraph as { type?: string }).type
            : undefined;
        if (openGraphType !== "article") {
          failures.push({
            path,
            message:
              "Client-rendered blog route must expose article metadata via generateMetadata",
          });
        }
      }
    }

    if (cluster === "service") {
      if (!types.has("Service") && !types.has("FAQPage") && !types.has("BreadcrumbList")) {
        failures.push({
          path,
          message: "Service page should include Service, FAQPage, or BreadcrumbList schema",
        });
      }
    }

    if (path === "/about") {
      const profile = nodes.find((node) => nodeHasType(node, "ProfilePage"));
      const mainEntity = profile?.mainEntity as JsonRecord | undefined;
      if (!profile) {
        failures.push({ path, message: "About page should include ProfilePage schema" });
      } else if (!mainEntity || !nodeHasType(mainEntity, "Person")) {
        failures.push({ path, message: "ProfilePage mainEntity should be a Person" });
      }
    }

    if (path === "/services") {
      if (!types.has("CollectionPage")) {
        failures.push({
          path,
          message: "Services page should include CollectionPage schema",
        });
      }
      if (!types.has("ItemList")) {
        failures.push({
          path,
          message: "Services page should include ItemList schema",
        });
      }
    }

    if (path === "/locations") {
      if (!types.has("CollectionPage")) {
        failures.push({
          path,
          message: "Locations page should include CollectionPage schema",
        });
      }
      if (!types.has("ItemList")) {
        failures.push({
          path,
          message: "Locations page should include ItemList schema",
        });
      }
    }
    if (cluster === "location") {
      if (
        path !== "/locations" &&
        !types.has("BreadcrumbList") &&
        !types.has("FAQPage")
      ) {
        failures.push({
          path,
          message: "Location page should include BreadcrumbList or FAQPage schema",
        });
      }
    }
  }

  if (failures.length > 0) {
    console.error("SEO structured-data audit failed:");
    failures.forEach((failure) =>
      console.error(`- [${failure.path}] ${failure.message}`),
    );
    process.exit(1);
  }

  console.log(`SEO structured-data audit passed. pages=${pathSet.size}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
