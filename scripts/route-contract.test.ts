import assert from "node:assert/strict";

import { generateMetadata } from "../app/[...slug]/page";
import { getCanonicalRouteData } from "../app/route-utils";
import {
  buildOrganizationSchema,
  buildServiceSchema,
  buildWebSiteSchema,
} from "../client/src/lib/structuredData";
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
      // Retired city pages redirect to an anchor on /locations
      // (e.g. /locations#sunnyvale); canonicals never carry a fragment.
      assert.equal(
        getCanonicalRouteData(canonicalPath),
        redirectPath.split("#")[0] || "/",
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
    // 2026-10-16 consolidations: ZOOM! merged into teeth whitening (aliases
    // retargeted so they stay one hop), Invisalign resources + post merged
    // into /invisalign, and legacy /post/ slugs resolve through the map.
    {
      from: "/zoom-whitening",
      expectedRedirect: "/teeth-whitening-palo-alto",
      expectedCanonical: "/teeth-whitening-palo-alto",
    },
    {
      from: "/services/zoom-whitening",
      expectedRedirect: "/teeth-whitening-palo-alto",
      expectedCanonical: "/teeth-whitening-palo-alto",
    },
    {
      from: "/whitening",
      expectedRedirect: "/teeth-whitening-palo-alto",
      expectedCanonical: "/teeth-whitening-palo-alto",
    },
    {
      from: "/invisalign/resources",
      expectedRedirect: "/invisalign",
      expectedCanonical: "/invisalign",
    },
    {
      from: "/post/invisalign-palo-alto",
      expectedRedirect: "/invisalign",
      expectedCanonical: "/invisalign",
    },
    {
      from: "/blog/post/in-office-whitening-vs-take-home-trays",
      expectedRedirect: "/blog/zoom-vs-take-home-whitening-palo-alto",
      expectedCanonical: "/blog/zoom-vs-take-home-whitening-palo-alto",
    },
    {
      from: "/locations/dentist-menlo-park",
      expectedRedirect: "/dentist-menlo-park",
      expectedCanonical: "/dentist-menlo-park",
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

  // One hop, statically: no redirect target may itself be a redirect source
  // (test:seo:links checks the same thing over HTTP against a running server).
  for (const redirect of legacyRedirects) {
    const target = redirect.to.split("#")[0] || "/";
    assert.equal(
      getLegacyRedirectPath(target),
      null,
      `Redirect chain: ${redirect.from} -> ${redirect.to} redirects again`,
    );
  }

  // The ZOOM! merge is exact-path only: the invite-only schedule child route
  // must keep rendering (noindex) instead of following /zoom-whitening.
  assert.equal(
    getLegacyRedirectPath("/zoom-whitening/schedule"),
    null,
    "/zoom-whitening/schedule must not redirect",
  );
  assert.equal(
    seoByPath["/zoom-whitening/schedule"]?.indexable,
    false,
    "/zoom-whitening/schedule must stay noindex",
  );

  // Merged routes stay in seoByPath as non-indexable redirects, like the
  // seven retired city pages.
  for (const merged of ["/zoom-whitening", "/invisalign/resources"]) {
    assert.equal(seoByPath[merged]?.indexable, false, `${merged} should be non-indexable`);
    assert.ok(getLegacyRedirectPath(merged), `${merged} should redirect`);
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

  // Google retired the sitelinks search box (2024) and the site has no search.
  assert.ok(
    !("potentialAction" in buildWebSiteSchema()),
    "WebSite schema should not advertise a SearchAction",
  );
}

function testServiceSchemaIntegrity(): void {
  const schema = buildServiceSchema({
    name: "Dental Crowns",
    description: "Contract fixture.",
    slug: "/crowns-palo-alto",
  });
  const graph = schema["@graph"];
  assert.ok(Array.isArray(graph), "Service schema should be an @graph");
  const nodes = graph as Record<string, unknown>[];
  const page = nodes.find((node) => node["@type"] === "MedicalWebPage");
  const service = nodes.find((node) => node["@type"] === "Service");
  assert.ok(page, "Service schema should include a MedicalWebPage node");
  assert.ok(service, "Service schema should include a Service node");
  assert.ok(page.reviewedBy, "MedicalWebPage should name its clinical reviewer");
  assert.match(
    String(page.lastReviewed ?? ""),
    /^\d{4}-\d{2}-\d{2}$/,
    "MedicalWebPage lastReviewed should be an ISO date",
  );
  const provider = service.provider as Record<string, unknown> | undefined;
  assert.ok(provider?.["@id"], "Service provider should keep the practice @id");
  assert.ok(
    provider?.name && provider.telephone && provider.address,
    "Service provider should inline name, telephone and address",
  );
  assert.ok(
    !String(service.image ?? "").includes("favicon"),
    "Service image should be a real photo, not a favicon",
  );
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
  testServiceSchemaIntegrity();
  await testCanonicalRoutesMetadata();
  await testBlogMetadataForStoredSlug();
  await testBlogMetadataIntegrity();
  console.log("Route and metadata contract checks passed.");
}

main().catch((error: unknown) => {
  console.error("Route contract check failed:", error);
  process.exit(1);
});
