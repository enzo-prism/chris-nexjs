import assert from "node:assert/strict";

import { generateMetadata } from "../app/[...slug]/page";
import { getCanonicalRouteData } from "../app/route-utils";
import { getLegacyRedirectPath, legacyRedirects } from "../shared/redirects";
import { seoByPath } from "../shared/seo";
import { getStorage } from "../server/storage/repository";

const CANONICAL_ORIGIN = "https://www.chriswongdds.com";

type RouteParams = { params: { slug?: string[] } };

type MetadataShape = {
  title?: unknown;
  description?: unknown;
  alternates?: { canonical?: unknown } | null;
  robots?: unknown;
};

function toPathParams(pathname: string): RouteParams {
  if (pathname === "/") return { params: {} };
  const slug = pathname.replace(/^\/+/, "").split("/");
  return { params: { slug } };
}

function normalizeRobots(robots: unknown): string {
  if (typeof robots === "string") return robots.toLowerCase();

  if (robots && typeof robots === "object" && "index" in robots) {
    const typed = robots as { index?: boolean; follow?: boolean };
    const indexPart = typed.index === false ? "noindex" : "index";
    const followPart = typed.follow === false ? "nofollow" : "follow";
    return `${indexPart}, ${followPart}`;
  }

  return "";
}

function canonicalFromMetadata(metadata: MetadataShape): string {
  const canonical = metadata.alternates?.canonical;
  if (canonical instanceof URL) return canonical.toString();
  if (typeof canonical === "string") return canonical;
  return "";
}

async function assertCanonicalMetadataForPath(
  pathname: string,
  expectedNoIndex: boolean,
): Promise<void> {
  const metadata = (await generateMetadata(toPathParams(pathname))) as MetadataShape;

  assert.ok(
    typeof metadata.title === "string" && metadata.title.length > 0,
    `Missing title for ${pathname}`,
  );
  assert.ok(
    typeof metadata.description === "string" && metadata.description.length > 0,
    `Missing description for ${pathname}`,
  );

  const canonical = canonicalFromMetadata(metadata);
  const expectedCanonical = `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`;
  assert.equal(canonical, expectedCanonical, `Canonical mismatch for ${pathname}`);

  const robots = normalizeRobots(metadata.robots);
  if (expectedNoIndex) {
    assert.ok(robots.includes("noindex"), `Expected noindex robots for ${pathname}`);
  } else {
    assert.ok(robots.includes("index"), `Expected index robots for ${pathname}`);
  }
}

async function testCanonicalRoutesMetadata() {
  for (const entry of Object.values(seoByPath)) {
    const canonicalPath = entry.canonicalPath;

    assert.equal(
      getCanonicalRouteData(canonicalPath),
      canonicalPath,
      `Canonical route unexpectedly remapped: ${canonicalPath}`,
    );

    await assertCanonicalMetadataForPath(canonicalPath, !entry.indexable);
  }
}

function testLegacyRedirects() {
  for (const redirect of legacyRedirects) {
    const actual = getLegacyRedirectPath(redirect.from);
    assert.equal(actual, redirect.to, `Legacy redirect mismatch for ${redirect.from}`);
  }

  const dynamicCases = [
    {
      from: "/post/emergency-dental-care-palo-alto",
      expectedRedirect: "/blog/emergency-dental-care-palo-alto",
      expectedCanonical: "/blog/emergency-dental-care-palo-alto",
    },
    {
      from: "/services/invisalign",
      expectedRedirect: "/invisalign",
      expectedCanonical: "/invisalign",
    },
    {
      from: "/services/custom-service",
      expectedRedirect: "/services#custom-service",
      expectedCanonical: "/services",
    },
    {
      from: "/dr-chris-wong",
      expectedRedirect: "/about",
      expectedCanonical: "/about",
    },
    {
      from: "/about-us",
      expectedRedirect: "/about",
      expectedCanonical: "/about",
    },
  ] as const;

  for (const testCase of dynamicCases) {
    const redirect = getLegacyRedirectPath(testCase.from);
    assert.equal(
      redirect,
      testCase.expectedRedirect,
      `Legacy dynamic redirect mismatch for ${testCase.from}`,
    );

    assert.equal(
      getCanonicalRouteData(testCase.from),
      testCase.expectedCanonical,
      `Canonical mapping mismatch for ${testCase.from}`,
    );
  }
}

async function testBlogMetadataForStoredSlug() {
  const storage = await getStorage();
  const posts = await storage.getBlogPosts();
  assert.ok(posts.length > 0, "Expected at least one seeded blog post");

  const samplePost = posts[0];
  const path = `/blog/${samplePost.slug}`;
  const metadata = (await generateMetadata(toPathParams(path))) as MetadataShape;

  assert.ok(
    typeof metadata.title === "string" && metadata.title.includes(samplePost.title),
    `Blog metadata title missing post title for ${path}`,
  );
  assert.equal(
    canonicalFromMetadata(metadata),
    `${CANONICAL_ORIGIN}${path}`,
    "Blog canonical URL mismatch",
  );
  assert.ok(
    normalizeRobots(metadata.robots).includes("index"),
    "Blog posts should remain indexable",
  );
}

async function main(): Promise<void> {
  testLegacyRedirects();
  await testCanonicalRoutesMetadata();
  await testBlogMetadataForStoredSlug();
  console.log("Route and metadata contract checks passed.");
}

main().catch((error: unknown) => {
  console.error("Route contract check failed:", error);
  process.exit(1);
});
