import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

import { seoByPath } from "../shared/seo";
import { getStorage } from "../server/storage/repository";

const BASE_URL = (process.env.IMAGE_AUDIT_BASE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif|svg|ico)(?:[?#].*)?$/i;
const SOURCE_DIRS = ["client/src", "app", "shared"] as const;
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

type Failure = {
  scope: "source" | "runtime" | "budget";
  target: string;
  reason: string;
};

const CRITICAL_IMAGE_BUDGETS: Record<string, number> = {
  "/": 200 * 1024,
  "/services": 200 * 1024,
};

function isLikelyImageUrl(urlPath: string): boolean {
  return IMAGE_EXTENSIONS.test(urlPath);
}

function walkFilesRecursively(directoryPath: string): string[] {
  if (!fs.existsSync(directoryPath)) return [];

  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFilesRecursively(absolutePath));
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
    files.push(absolutePath);
  }

  return files;
}

function extractStaticLocalImageRefs(content: string): string[] {
  const refs = new Set<string>();

  const quotedAssetPattern =
    /["'](\/[^"']+\.(?:png|jpe?g|webp|avif|gif|svg|ico)(?:[?#][^"']*)?)["']/gi;
  const cssUrlPattern = /url\((['"]?)(\/[^'")]+)\1\)/gi;

  for (const match of content.matchAll(quotedAssetPattern)) {
    const value = match[1];
    if (!value) continue;
    refs.add(value);
  }

  for (const match of content.matchAll(cssUrlPattern)) {
    const value = match[2];
    if (!value || !isLikelyImageUrl(value)) continue;
    refs.add(value);
  }

  return [...refs];
}

function normalizePathFromLocalRef(localRef: string): string {
  return decodeURIComponent(localRef.split("#")[0].split("?")[0]);
}

function validateSourceImageRefs(): Failure[] {
  const failures: Failure[] = [];
  const seenRefs = new Set<string>();

  for (const dir of SOURCE_DIRS) {
    const absoluteDir = path.join(process.cwd(), dir);
    const files = walkFilesRecursively(absoluteDir);

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf8");
      const refs = extractStaticLocalImageRefs(content);

      for (const ref of refs) {
        if (seenRefs.has(ref)) continue;
        seenRefs.add(ref);

        if (ref.startsWith("/_next/") || ref.startsWith("/api/")) continue;

        const normalizedRef = normalizePathFromLocalRef(ref);
        assert.ok(
          normalizedRef.startsWith("/"),
          `Expected absolute local path, received ${normalizedRef}`,
        );

        const absoluteAssetPath = path.join(process.cwd(), "public", normalizedRef.slice(1));

        if (!fs.existsSync(absoluteAssetPath)) {
          failures.push({
            scope: "source",
            target: ref,
            reason: "Referenced local image asset does not exist in public/",
          });
        }
      }
    }
  }

  return failures;
}

function extractImageUrlsFromHtml(html: string, pageUrl: string): string[] {
  const urls = new Set<string>();
  const attrPattern = /\b(?:src|srcset|poster)\s*=\s*["']([^"']+)["']/gi;
  const cssUrlPattern = /url\((['"]?)([^'")]+)\1\)/gi;

  function maybeAdd(raw: string) {
    const trimmed = raw.trim().replace(/&amp;/g, "&");
    if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
      return;
    }

    const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

    let absolute: URL;
    try {
      absolute = new URL(normalized, pageUrl);
    } catch {
      return;
    }

    if (!["http:", "https:"].includes(absolute.protocol)) return;

    const isNextOptimizer = absolute.pathname === "/_next/image";
    const looksLikeImage = isLikelyImageUrl(absolute.pathname);
    if (!isNextOptimizer && !looksLikeImage) return;

    urls.add(absolute.toString());
  }

  for (const match of html.matchAll(attrPattern)) {
    const value = match[1];
    if (!value) continue;

    if (value.includes(",")) {
      for (const candidate of value.split(",")) {
        const firstToken = candidate.trim().split(/\s+/)[0];
        if (firstToken) maybeAdd(firstToken);
      }
      continue;
    }

    maybeAdd(value);
  }

  for (const match of html.matchAll(cssUrlPattern)) {
    const value = match[2];
    if (!value) continue;
    maybeAdd(value);
  }

  return [...urls];
}

function normalizeImageAuditUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.pathname !== "/_next/image") return rawUrl;
    const sourceUrl = parsed.searchParams.get("url");
    if (!sourceUrl) return rawUrl;
    const quality = parsed.searchParams.get("q") ?? "75";
    const width = "1200";
    parsed.search = "";
    parsed.searchParams.set("url", sourceUrl);
    parsed.searchParams.set("w", width);
    parsed.searchParams.set("q", quality);
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

async function fetchText(url: string): Promise<{ status: number; body: string }> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  return { status: response.status, body };
}

async function verifyImageUrl(url: string): Promise<Failure | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(45_000),
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent": "chris-nextjs-image-audit/1.0",
      },
    });

    response.body?.cancel();

    if (response.status >= 400) {
      return {
        scope: "runtime",
        target: url,
        reason: `Image request returned status ${response.status}`,
      };
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const isNextOptimizer = new URL(url).pathname === "/_next/image";

    if (
      !isNextOptimizer &&
      contentType.includes("text/html")
    ) {
      return {
        scope: "runtime",
        target: url,
        reason: "URL responded with HTML instead of image bytes",
      };
    }

    if (
      !isNextOptimizer &&
      contentType &&
      !contentType.startsWith("image/") &&
      !contentType.startsWith("application/octet-stream")
    ) {
      return {
        scope: "runtime",
        target: url,
        reason: `Unexpected content-type for image: ${contentType}`,
      };
    }

    return null;
  } catch (error) {
    return {
      scope: "runtime",
      target: url,
      reason: `Image request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function getImageSizeBytes(url: string): Promise<number | null> {
  const headResponse = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": "chris-nextjs-image-audit/1.0",
    },
  });

  const headerLength = headResponse.headers.get("content-length");
  if (headerLength && Number.isFinite(Number(headerLength))) {
    const parsed = Number(headerLength);
    if (parsed > 0) return parsed;
  }

  const fallbackResponse = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": "chris-nextjs-image-audit/1.0",
    },
  });

  const arrayBuffer = await fallbackResponse.arrayBuffer();
  return arrayBuffer.byteLength;
}

async function checkCriticalRouteImageBudgets(
  routeToImages: Map<string, string[]>,
): Promise<Failure[]> {
  const failures: Failure[] = [];

  for (const [route, maxBytes] of Object.entries(CRITICAL_IMAGE_BUDGETS)) {
    const images = routeToImages.get(route) || [];

    const candidate = images.find((url) => {
      const pathname = new URL(url).pathname.toLowerCase();
      if (pathname.includes("favicon")) return false;
      if (pathname.includes("logo")) return false;
      if (pathname.includes("icon")) return false;
      return true;
    });

    if (!candidate) {
      failures.push({
        scope: "budget",
        target: `${BASE_URL}${route}`,
        reason: "Could not identify primary image candidate for budget check",
      });
      continue;
    }

    try {
      const sizeBytes = await getImageSizeBytes(candidate);
      if (!sizeBytes) continue;

      if (sizeBytes > maxBytes) {
        failures.push({
          scope: "budget",
          target: candidate,
          reason: `Primary image transfer size ${Math.round(sizeBytes / 1024)}kB exceeds budget ${Math.round(maxBytes / 1024)}kB`,
        });
      }
    } catch (error) {
      failures.push({
        scope: "budget",
        target: candidate,
        reason: `Failed to evaluate image size: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return failures;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;
      results[current] = await worker(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => runWorker());
  await Promise.all(workers);
  return results;
}

async function getAuditRoutes(): Promise<string[]> {
  const canonicalRoutes = new Set<string>(
    Object.values(seoByPath).map((entry) => entry.canonicalPath),
  );

  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();
  for (const post of blogPosts) {
    canonicalRoutes.add(`/blog/${post.slug}`);
  }

  return [...canonicalRoutes].sort();
}

async function validateRuntimeImages(): Promise<Failure[]> {
  const failures: Failure[] = [];
  const routes = await getAuditRoutes();
  const imageUrls = new Set<string>();
  const routeToImages = new Map<string, string[]>();

  for (const route of routes) {
    const pageUrl = `${BASE_URL}${route === "/" ? "/" : route}`;
    const { status, body } = await fetchText(pageUrl);

    if (status >= 400) {
      failures.push({
        scope: "runtime",
        target: pageUrl,
        reason: `Route returned status ${status}`,
      });
      continue;
    }

    const extractedImages = extractImageUrlsFromHtml(body, pageUrl);
    routeToImages.set(route, extractedImages);

    for (const imageUrl of extractedImages) {
      imageUrls.add(normalizeImageAuditUrl(imageUrl));
    }
  }

  const checks = await mapWithConcurrency([...imageUrls], 4, verifyImageUrl);
  for (const check of checks) {
    if (check) failures.push(check);
  }

  const budgetFailures = await checkCriticalRouteImageBudgets(routeToImages);
  failures.push(...budgetFailures);

  console.log(
    `Image runtime audit scanned ${routes.length} routes and ${imageUrls.size} unique image URLs.`,
  );

  return failures;
}

async function main() {
  const sourceFailures = validateSourceImageRefs();
  const runtimeFailures = await validateRuntimeImages();
  const failures = [...sourceFailures, ...runtimeFailures];

  if (failures.length > 0) {
    console.error("Image audit failed:");
    for (const failure of failures) {
      console.error(`- [${failure.scope}] ${failure.target}: ${failure.reason}`);
    }
    process.exit(1);
  }

  console.log("Image audit passed.");
}

main().catch((error: unknown) => {
  console.error("Image audit failed:", error);
  process.exit(1);
});
