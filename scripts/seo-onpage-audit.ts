import type { Metadata } from "next";
import { generateMetadata } from "../app/[...slug]/page";
import { getIndexablePaths, getSeoForPath, seoByPath } from "../shared/seo";

type Failure = {
  path: string;
  message: string;
};

const BASE_URL = process.env.SEO_AUDIT_BASE_URL ?? "http://localhost:3000";
const CANONICAL_ORIGIN = "https://www.chriswongdds.com";
const MIN_TITLE_LENGTH = 45;

function toRouteParams(path: string): { params: { slug?: string[] } } {
  if (path === "/") return { params: {} };
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return { params: normalized ? { slug: normalized.split("/") } : {} };
}

function metadataTitleToString(title: Metadata["title"]): string {
  if (typeof title === "string") return title;
  if (title && typeof title === "object" && "absolute" in title) {
    return typeof title.absolute === "string" ? title.absolute : "";
  }
  return "";
}

function canonicalToString(canonical: Metadata["alternates"] extends infer T
  ? T extends { canonical?: infer C }
    ? C
    : unknown
  : unknown): string {
  if (!canonical) return "";
  if (typeof canonical === "string") return canonical;
  if (canonical instanceof URL) return canonical.toString();
  if (typeof canonical === "object" && "url" in canonical) {
    const value = canonical as { url?: string | URL };
    if (typeof value.url === "string") return value.url;
    if (value.url instanceof URL) return value.url.toString();
  }
  return "";
}

function expectedCanonical(path: string): string {
  return `${CANONICAL_ORIGIN}${path === "/" ? "/" : path}`;
}

function canonicalMatches(path: string, value: string): boolean {
  if (!value) return false;
  if (path === "/") {
    return value === CANONICAL_ORIGIN || value === `${CANONICAL_ORIGIN}/`;
  }
  return value === expectedCanonical(path);
}

function countH1(html: string): number {
  return (html.match(/<h1\b/gi) ?? []).length;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractCanonicalFromHtml(html: string): string {
  const match = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
  );
  return match?.[1] ?? "";
}

function extractTitleFromHtml(html: string): string {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  return decodeHtmlEntities(match?.[1] ?? "").trim();
}

function extractRobotsMeta(html: string): string {
  const match = html.match(
    /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  return (match?.[1] ?? "").toLowerCase();
}

function robotsHasNoindex(robots: Metadata["robots"]): boolean {
  if (!robots) return false;
  if (typeof robots === "string") return robots.toLowerCase().includes("noindex");
  if (typeof robots === "object" && "index" in robots) {
    const typed = robots as { index?: boolean };
    return typed.index === false;
  }
  return false;
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(new URL(path, BASE_URL).toString(), {
      redirect: "follow",
      signal: controller.signal,
    });
    return {
      status: response.status,
      html: await response.text(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main(): Promise<void> {
  const failures: Failure[] = [];
  const indexablePaths = getIndexablePaths();

  let titleInRange = 0;
  let descriptionInRange = 0;

  for (const path of indexablePaths) {
    const metadata = await generateMetadata(toRouteParams(path));
    const routeSeo = getSeoForPath(path);

    const title = metadataTitleToString(metadata.title);
    const description = metadata.description ?? "";
    const titleMax = routeSeo.titleMaxLen ?? 60;
    const descriptionMin = routeSeo.descriptionMinLen ?? 120;
    const descriptionMax = routeSeo.descriptionMaxLen ?? 160;

    if (!title) {
      failures.push({ path, message: "Missing metadata title" });
    } else if (title.length < MIN_TITLE_LENGTH || title.length > titleMax) {
      failures.push({
        path,
        message: `Title length ${title.length} outside ${MIN_TITLE_LENGTH}-${titleMax}`,
      });
    }

    if (!description) {
      failures.push({ path, message: "Missing metadata description" });
    } else if (
      description.length < descriptionMin ||
      description.length > descriptionMax
    ) {
      failures.push({
        path,
        message: `Description length ${description.length} outside ${descriptionMin}-${descriptionMax}`,
      });
    }

    const canonical = canonicalToString(metadata.alternates?.canonical);
    if (!canonicalMatches(path, canonical)) {
      failures.push({
        path,
        message: `Canonical mismatch. expected=${expectedCanonical(path)} got=${canonical || "<empty>"}`,
      });
    }

    const { status, html } = await fetchHtml(path);
    if (status !== 200) {
      failures.push({ path, message: `Expected 200, received ${status}` });
      continue;
    }

    const h1Count = countH1(html);
    if (h1Count !== 1) {
      failures.push({ path, message: `Expected exactly one <h1>, found ${h1Count}` });
    }

    const renderedTitle = extractTitleFromHtml(html);
    if (!renderedTitle) {
      failures.push({ path, message: "Rendered HTML is missing a <title>" });
    } else if (
      renderedTitle.length < MIN_TITLE_LENGTH ||
      renderedTitle.length > titleMax
    ) {
      failures.push({
        path,
        message: `Rendered <title> length ${renderedTitle.length} outside ${MIN_TITLE_LENGTH}-${titleMax}`,
      });
    } else {
      titleInRange += 1;
    }

    if (
      description.length >= descriptionMin &&
      description.length <= descriptionMax
    ) {
      descriptionInRange += 1;
    }

    const htmlCanonical = extractCanonicalFromHtml(html);
    if (htmlCanonical && !canonicalMatches(path, htmlCanonical)) {
      failures.push({
        path,
        message: `Rendered canonical mismatch. expected=${expectedCanonical(path)} got=${htmlCanonical}`,
      });
    }

    const robotsMeta = extractRobotsMeta(html);
    if (robotsMeta.includes("noindex")) {
      failures.push({
        path,
        message: `Indexable path rendered with noindex robots meta (${robotsMeta})`,
      });
    }
  }

  const noindexPaths = Object.values(seoByPath)
    .filter((entry) => !entry.indexable)
    .map((entry) => entry.canonicalPath);

  for (const path of noindexPaths) {
    const metadata = await generateMetadata(toRouteParams(path));
    if (!robotsHasNoindex(metadata.robots)) {
      failures.push({ path, message: "Expected noindex metadata for noindex path" });
    }
  }

  const titleCompliance = (titleInRange / indexablePaths.length) * 100;
  const descriptionCompliance = (descriptionInRange / indexablePaths.length) * 100;

  if (titleCompliance < 95) {
    failures.push({
      path: "global",
      message: `Title compliance below threshold: ${titleCompliance.toFixed(1)}%`,
    });
  }

  if (descriptionCompliance < 95) {
    failures.push({
      path: "global",
      message: `Description compliance below threshold: ${descriptionCompliance.toFixed(1)}%`,
    });
  }

  if (failures.length > 0) {
    console.error("SEO on-page audit failed:");
    failures.forEach((failure) =>
      console.error(`- [${failure.path}] ${failure.message}`),
    );
    process.exit(1);
  }

  console.log(
    `SEO on-page audit passed. titleCompliance=${titleCompliance.toFixed(1)}% descriptionCompliance=${descriptionCompliance.toFixed(1)}% pages=${indexablePaths.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
