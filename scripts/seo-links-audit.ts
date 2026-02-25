import { getStorage } from "../server/storage/repository";
import { getLegacyRedirectPath, legacyRedirects } from "../shared/redirects";
import { getIndexablePaths, getSeoForPath, normalizePathname } from "../shared/seo";

type Failure = {
  path: string;
  message: string;
};

const BASE_URL = process.env.SEO_AUDIT_BASE_URL ?? "http://localhost:3000";
const REDIRECT_STATUSES = new Set([301, 302, 307, 308]);

function extractHrefValues(html: string): string[] {
  const hrefValues: string[] = [];
  const regex = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null = regex.exec(html);
  while (match) {
    if (match[1]) hrefValues.push(match[1]);
    match = regex.exec(html);
  }
  return hrefValues;
}

function toInternalPath(href: string): string | null {
  if (!href) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (href.startsWith("#")) return null;

  try {
    const url = new URL(href, BASE_URL);
    const base = new URL(BASE_URL);
    if (url.origin !== base.origin) return null;
    return normalizePathname(url.pathname || "/");
  } catch {
    return null;
  }
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

async function fetchLinksForPath(
  path: string,
  cache: Map<string, Set<string>>,
  _indexableSet: Set<string>,
  failures: Failure[],
): Promise<Set<string>> {
  const cached = cache.get(path);
  if (cached) return cached;

  const { status, html } = await fetchHtml(path);
  if (status !== 200) {
    failures.push({ path, message: `Expected 200, received ${status}` });
    const empty = new Set<string>();
    cache.set(path, empty);
    return empty;
  }

  const links = new Set<string>();
  for (const href of extractHrefValues(html)) {
    const internalPath = toInternalPath(href);
    if (!internalPath) continue;
    links.add(internalPath);
  }

  cache.set(path, links);
  return links;
}

async function checkRedirectHop(path: string, failures: Failure[]): Promise<void> {
  const expected = getLegacyRedirectPath(path);
  if (!expected) return;
  const expectedPath = normalizePathname(expected.split("#")[0] || "/");

  const firstResponse = await fetch(new URL(path, BASE_URL).toString(), {
    redirect: "manual",
  });

  if (!REDIRECT_STATUSES.has(firstResponse.status)) {
    failures.push({
      path,
      message: `Expected redirect status for legacy alias, received ${firstResponse.status}`,
    });
    return;
  }

  const location = firstResponse.headers.get("location");
  if (!location) {
    failures.push({ path, message: "Missing redirect location header" });
    return;
  }

  const redirectedUrl = new URL(location, BASE_URL);
  const redirectedPath = normalizePathname(redirectedUrl.pathname);

  if (redirectedPath !== expectedPath) {
    failures.push({
      path,
      message: `Redirect target mismatch. expected=${expectedPath} got=${redirectedPath}`,
    });
  }

  const secondResponse = await fetch(redirectedUrl.toString(), {
    redirect: "manual",
  });
  if (REDIRECT_STATUSES.has(secondResponse.status)) {
    failures.push({
      path,
      message: `Expected one redirect hop but target still redirects with ${secondResponse.status}`,
    });
  }
}

async function main(): Promise<void> {
  const failures: Failure[] = [];
  const indexablePaths = getIndexablePaths();
  const indexableSet = new Set(indexablePaths);
  const inboundCount = new Map<string, number>(indexablePaths.map((path) => [path, 0]));
  const linksCache = new Map<string, Set<string>>();

  const visited = new Set<string>();
  const queue: string[] = ["/"];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);

    const links = await fetchLinksForPath(current, linksCache, indexableSet, failures);
    for (const link of links) {
      if (!indexableSet.has(link)) continue;
      inboundCount.set(link, (inboundCount.get(link) ?? 0) + 1);
      if (!visited.has(link)) queue.push(link);
    }
  }

  const orphans = indexablePaths.filter(
    (path) => path !== "/" && (inboundCount.get(path) ?? 0) === 0,
  );
  if (orphans.length > 0) {
    failures.push({
      path: "global",
      message: `Orphan indexable pages detected: ${orphans.join(", ")}`,
    });
  }

  const servicePaths = indexablePaths.filter(
    (path) => getSeoForPath(path).seoCluster === "service",
  );
  for (const path of servicePaths) {
    const links = await fetchLinksForPath(path, linksCache, indexableSet, failures);
    const supportingLinks = [...links].filter(
      (link) => link !== path && indexableSet.has(link),
    );
    if (supportingLinks.length < 2) {
      failures.push({
        path,
        message: `Service page has fewer than 2 supporting internal links (${supportingLinks.length})`,
      });
    }
  }

  const serviceSet = new Set(servicePaths);
  const storage = await getStorage();
  const blogPosts = await storage.getBlogPosts();

  for (const post of blogPosts) {
    const blogPath = `/blog/${post.slug}`;
    const links = await fetchLinksForPath(blogPath, linksCache, indexableSet, failures);
    const { html } = await fetchHtml(blogPath);
    const isClientRenderedBlog = html.includes("BAILOUT_TO_CLIENT_SIDE_RENDERING");
    const hasServiceLink = [...links].some((link) => serviceSet.has(link));
    const hasRelatedPostLink = [...links].some(
      (link) => link.startsWith("/blog/") && link !== blogPath,
    );

    if (!hasServiceLink) {
      failures.push({
        path: blogPath,
        message: "Blog post is missing a link to at least one service page",
      });
    }
    if (!hasRelatedPostLink && !isClientRenderedBlog) {
      failures.push({
        path: blogPath,
        message: "Blog post is missing a link to at least one related blog post",
      });
    }
    if (isClientRenderedBlog && blogPosts.length < 2) {
      failures.push({
        path: blogPath,
        message:
          "Client-rendered blog template requires at least two posts in storage for related-post linking",
      });
    }
  }

  const legacyPaths = new Set<string>([
    ...legacyRedirects.map((entry) => entry.from),
    "/post/emergency-dental-care-palo-alto",
    "/services/invisalign",
    "/dr-chris-wong",
    "/about-us",
  ]);

  for (const legacyPath of legacyPaths) {
    await checkRedirectHop(legacyPath, failures);
  }

  if (failures.length > 0) {
    console.error("SEO links audit failed:");
    failures.forEach((failure) =>
      console.error(`- [${failure.path}] ${failure.message}`),
    );
    process.exit(1);
  }

  console.log(
    `SEO links audit passed. visited=${visited.size} indexable=${indexablePaths.length} orphans=0`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
