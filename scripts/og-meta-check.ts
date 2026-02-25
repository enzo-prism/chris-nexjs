import { generateMetadata } from "../app/[...slug]/page";
import { getStorage } from "../server/storage/repository";

type MetadataRoute = {
  title?: string | null;
  robots?: boolean | { index: boolean; follow: boolean };
  openGraph?: {
    type?: string;
    images?: Array<unknown> | string;
    url?: string;
  } | null;
  twitter?: {
    title?: string;
  } | null;
};

function toParams(path: string): { slug?: string[] } {
  if (path === "/") {
    return {};
  }

  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return { slug: normalized.split("/") };
}

function toRouteParams(path: string): { params: { slug?: string[] } } {
  if (path === "/") {
    return { params: {} };
  }

  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return { params: normalized ? { slug: normalized.split("/") } : {} };
}

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function isNoIndex(value: unknown): boolean {
  if (typeof value === "string") {
    return value.includes("noindex");
  }

  if (typeof value === "object" && value !== null) {
    const robots = value as { index?: boolean };
    return robots.index === false;
  }

  return false;
}

function hasOpenGraphImage(value: MetadataRoute["openGraph"]): boolean {
  if (!value) {
    return false;
  }

  const images = value.images;
  if (!images) {
    return false;
  }

  if (typeof images === "string") {
    return images.length > 0;
  }

  return images.length > 0;
}

(async function main() {
  const storage = await getStorage();
  const posts = await storage.getBlogPosts();

  const homeMetadata = (await generateMetadata(toRouteParams("/"))) as MetadataRoute;
  assert(homeMetadata.title && homeMetadata.title.length > 0, "Home metadata should include title");
  assert(homeMetadata.openGraph?.type === "website", "Home openGraph.type should be website");
  assert(
    typeof homeMetadata.openGraph?.url === "string" && homeMetadata.openGraph.url.length > 0,
    "Home openGraph.url should be set",
  );

  const noindexMetadata = (await generateMetadata(
    toRouteParams("/zoom-whitening/schedule"),
  )) as MetadataRoute;
  assert(
    isNoIndex(noindexMetadata.robots),
    "Noindex page should expose noindex in metadata",
  );

  const sampleSlug = posts[0]?.slug;
  assert(Boolean(sampleSlug), "A seeded blog post must exist for blog metadata check");

  const blogMetadata = (await generateMetadata(
    toRouteParams(`/blog/${sampleSlug}`),
  )) as MetadataRoute;
  assert(blogMetadata.openGraph?.type === "article", "Blog metadata type should be article");
  assert(hasOpenGraphImage(blogMetadata.openGraph), "Blog metadata should include OG image");
  assert(
    typeof blogMetadata.title === "string" && blogMetadata.title.length > 0,
    "Blog metadata should include title",
  );

  const twitterMetadata = (await generateMetadata(toRouteParams("/services"))) as MetadataRoute;
  assert(typeof twitterMetadata.twitter?.title === "string", "Twitter metadata should include title");

  console.log("OG meta checks passed.");
})().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
