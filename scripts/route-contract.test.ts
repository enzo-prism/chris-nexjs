import assert from "node:assert/strict";

import { generateMetadata } from "../app/[...slug]/page";
import { getCanonicalRouteData } from "../app/route-utils";
import { buildOrganizationSchema } from "../client/src/lib/structuredData";
import { getBlogSeoMetadata } from "../shared/blogSeo";
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
    const redirectPath = getLegacyRedirectPath(canonicalPath);

    assert.ok(
      !entry.title.includes("…") && !entry.title.includes("..."),
      `Static title contains generated truncation for ${canonicalPath}`,
    );
    assert.ok(
      !entry.description.includes("…") && !entry.description.includes("..."),
      `Static description contains generated truncation for ${canonicalPath}`,
    );
    assert.match(
      entry.description,
      /[.!?][\"'’”)}\]]?$/,
      `Static description should end with a complete thought for ${canonicalPath}`,
    );

    if (redirectPath) {
      assert.equal(
        getCanonicalRouteData(canonicalPath),
        redirectPath,
        `Redirected route canonical mismatch: ${canonicalPath}`,
      );
      continue;
    }

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
    {
      from: "/pediatric-dentist-palo-alto",
      expectedRedirect: "/pediatric-dentistry",
      expectedCanonical: "/pediatric-dentistry",
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

async function testBlogMetadataIntegrity(): Promise<void> {
  const storage = await getStorage();
  const posts = await storage.getBlogPosts();
  const danglingTitleWord = /\b(?:a|an|and|for|in|of|or|the|to|vs|with)$/i;

  for (const post of posts) {
    const metadata = getBlogSeoMetadata(post);
    assert.ok(metadata, `Missing blog SEO metadata for ${post.slug}`);
    assert.ok(metadata.title.length > 0, `Missing blog title for ${post.slug}`);
    assert.ok(
      metadata.description.length > 0,
      `Missing blog description for ${post.slug}`,
    );
    assert.ok(
      !metadata.title.includes("…") && !metadata.title.includes("..."),
      `Blog title contains generated truncation for ${post.slug}`,
    );
    assert.ok(
      !metadata.description.includes("…") && !metadata.description.includes("..."),
      `Blog description contains generated truncation for ${post.slug}`,
    );
    assert.ok(
      !danglingTitleWord.test(metadata.title.replace(/ \| Dr\. Wong$/, "")),
      `Blog title ends in a dangling fragment for ${post.slug}: ${metadata.title}`,
    );
    assert.match(
      metadata.description,
      /[.!?][\"'’”)}\]]?$/,
      `Blog description should end with a complete thought for ${post.slug}`,
    );
  }

  const emergencyPost = posts.find(
    (post) => post.slug === "emergency-dental-care-palo-alto",
  );
  assert.ok(emergencyPost, "Expected emergency dental guide fixture");
  assert.equal(
    emergencyPost.title,
    "What Counts as a Dental Emergency? A Palo Alto Guide",
  );
  assert.ok(
    !getBlogSeoMetadata(emergencyPost)?.title.startsWith("Emergency Dentist"),
    "Emergency guide metadata should use informational rather than commercial intent",
  );
}

function testOrganizationSchemaIntegrity(): void {
  const schema = buildOrganizationSchema();
  const unverifiedFields = [
    "founder",
    "priceRange",
    "currenciesAccepted",
    "paymentAccepted",
    "aggregateRating",
  ] as const;

  for (const field of unverifiedFields) {
    assert.ok(
      !(field in schema),
      `Organization schema should not emit unverified ${field}`,
    );
  }

  assert.equal(schema["@type"], "Dentist");
  assert.ok(schema.name, "Organization schema should retain the practice name");
  assert.ok(schema.telephone, "Organization schema should retain the office phone");
  assert.ok(schema.address, "Organization schema should retain the office address");
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
  testOrganizationSchemaIntegrity();
  await testCanonicalRoutesMetadata();
  await testBlogMetadataForStoredSlug();
  await testBlogMetadataIntegrity();
  console.log("Route and metadata contract checks passed.");
}

main().catch((error: unknown) => {
  console.error("Route contract check failed:", error);
  process.exit(1);
});
