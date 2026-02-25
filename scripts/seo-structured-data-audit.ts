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
    return [value as JsonRecord];
  }
  return [];
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

function hasAddress(node: JsonRecord): boolean {
  const address = node.address;
  if (!address) return false;
  if (typeof address === "string") return address.length > 0;
  return typeof address === "object";
}

function hasTelephone(node: JsonRecord): boolean {
  const telephone = node.telephone;
  return typeof telephone === "string" && telephone.length > 0;
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

    const blocks = extractJsonLdBlocks(html);
    if (blocks.length === 0) {
      failures.push({ path, message: "No JSON-LD script blocks found" });
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
    const isClientRenderedRoute = html.includes("BAILOUT_TO_CLIENT_SIDE_RENDERING");

    if (path === "/") {
      if (!types.has("WebSite")) {
        failures.push({ path, message: "Homepage should include WebSite schema" });
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

    const cluster = getSeoForPath(path).seoCluster;
    if (cluster === "service") {
      if (!types.has("Service") && !types.has("FAQPage") && !types.has("BreadcrumbList")) {
        failures.push({
          path,
          message: "Service page should include Service, FAQPage, or BreadcrumbList schema",
        });
      }
    }
    if (cluster === "location") {
      const hasLocalSchema = types.has("Dentist") || types.has("LocalBusiness");
      if (!hasLocalSchema) {
        failures.push({
          path,
          message: "Location page should include Dentist or LocalBusiness schema",
        });
      }
      const localNodes = nodes.filter((node) => {
        const type = node["@type"];
        if (typeof type === "string") {
          return type === "Dentist" || type === "LocalBusiness";
        }
        return Array.isArray(type) && type.some((entry) => entry === "Dentist" || entry === "LocalBusiness");
      });
      if (localNodes.length > 0) {
        const completeLocalNode = localNodes.some(
          (node) => hasAddress(node) && hasTelephone(node),
        );
        if (!completeLocalNode) {
          failures.push({
            path,
            message: "Dentist/LocalBusiness schema should include address and telephone",
          });
        }
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
