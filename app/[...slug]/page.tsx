import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCanonicalRouteData, getPathFromSlugParams } from "../route-utils";
import { getStorage } from "../../server/storage/repository";
import {
  DEFAULT_ROBOTS,
  getSeoForPath,
  seoByPath,
  buildExcerpt,
  NOINDEX_ROBOTS,
} from "@shared/seo";
import LegacyShell from "./legacy-shell";

const CANONICAL_ORIGIN = "https://www.chriswongdds.com";

function normalizePathnameForPath(pathname: string): string {
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}

function toAbsoluteUrl(pathname: string): string {
  return `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`;
}

function getCanonicalRoutePath(slugParams: { slug?: string[] }): string {
  const rawPath = getPathFromSlugParams(slugParams);
  const canonical = getCanonicalRouteData(rawPath);
  return normalizePathnameForPath(canonical || rawPath);
}

function getSeoMetadataHints(pathname: string) {
  const seoEntry = getSeoForPath(pathname);
  const robotsDirective = seoEntry.robots ?? DEFAULT_ROBOTS;

  return {
    title: seoEntry.title,
    description: seoEntry.description,
    image: seoEntry.ogImage,
    canonical: toAbsoluteUrl(seoEntry.canonicalPath || pathname),
    type: pathname.startsWith("/blog/") && pathname !== "/blog" ? "article" : "website",
    robotsDirective,
  } as const;
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const canonicalPath = getCanonicalRoutePath(params);
  const seoMetadata = getSeoMetadataHints(canonicalPath);

  if (canonicalPath.startsWith("/blog/") && canonicalPath !== "/blog") {
    const storage = await getStorage();
    const postSlug = canonicalPath.replace("/blog/", "");
    const post = await storage.getBlogPostBySlug(postSlug);

    if (post) {
      const image = post.image ?? seoMetadata.image ?? "/images/dr_wong_polaroids.png";
      const absoluteImage = image.startsWith("http")
        ? image
        : `${CANONICAL_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`;
      const excerpt = buildExcerpt(post.content);
      const published = Number.isNaN(Date.parse(post.date))
        ? undefined
        : new Date(post.date).toISOString();

      return {
        title: `${post.title} | Christopher B. Wong, DDS`,
        description: excerpt,
        robots: DEFAULT_ROBOTS,
        alternates: {
          canonical: seoMetadata.canonical,
          types: {
            "application/rss+xml": `${CANONICAL_ORIGIN}/rss.xml`,
          },
        },
        openGraph: {
          type: "article",
          url: seoMetadata.canonical,
          title: `${post.title} | Christopher B. Wong, DDS`,
          description: excerpt,
          images: [absoluteImage],
          publishedTime: published,
          modifiedTime: published,
          authors: ["Christopher B. Wong, DDS"],
          siteName: "Christopher B. Wong, DDS",
        },
        twitter: {
          card: "summary_large_image",
          site: "@chriswongdds",
          title: `${post.title} | Christopher B. Wong, DDS`,
          description: excerpt,
          images: [absoluteImage],
        },
      };
    }

    return {
      title: "Page Not Found | Christopher B. Wong, DDS",
      description: "Page not found.",
      robots: NOINDEX_ROBOTS,
      alternates: {
        canonical: seoMetadata.canonical,
        types: {
          "application/rss+xml": `${CANONICAL_ORIGIN}/rss.xml`,
        },
      },
      openGraph: {
        type: "website",
        url: seoMetadata.canonical,
        title: "Page Not Found | Christopher B. Wong, DDS",
        description: "Page not found.",
      },
      twitter: {
        card: "summary_large_image",
        title: "Page Not Found | Christopher B. Wong, DDS",
        description: "Page not found.",
      },
    };
  }

  const absoluteImage = seoMetadata.image
    ? seoMetadata.image.startsWith("http")
      ? seoMetadata.image
      : `${CANONICAL_ORIGIN}${seoMetadata.image.startsWith("/") ? seoMetadata.image : `/${seoMetadata.image}`}`
    : `${CANONICAL_ORIGIN}/images/dr_wong_polaroids.png`;

  return {
    title: seoMetadata.title,
    description: seoMetadata.description,
    robots: seoMetadata.robotsDirective,
    alternates: {
      canonical: seoMetadata.canonical,
      types: {
        "application/rss+xml": `${CANONICAL_ORIGIN}/rss.xml`,
      },
    },
    openGraph: {
      type: seoMetadata.type,
      url: seoMetadata.canonical,
      title: seoMetadata.title,
      description: seoMetadata.description,
      images: [absoluteImage],
      siteName: "Christopher B. Wong, DDS",
    },
    twitter: {
      card: "summary_large_image",
      site: "@chriswongdds",
      title: seoMetadata.title,
      description: seoMetadata.description,
      images: [absoluteImage],
    },
  };
}

export default function CatchAllPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const canonicalPath = getCanonicalRoutePath(params);

  const basePath = canonicalPath.split("#")[0] ?? canonicalPath;
  const isAllowedPath =
    !!seoByPath[basePath] ||
    basePath === "/" ||
    (basePath.startsWith("/blog/") && basePath !== "/blog") ||
    basePath === "/blog";

  if (!isAllowedPath) {
    notFound();
  }

  return <LegacyShell key={canonicalPath} ssrPath={canonicalPath} />;
}
