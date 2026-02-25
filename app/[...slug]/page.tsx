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
import RouteShell from "./page-shell";

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
  const robotsDirective = (seoEntry.robots ?? DEFAULT_ROBOTS).toLowerCase();
  const isNoIndex = robotsDirective.includes("noindex");
  const isNoFollow = robotsDirective.includes("nofollow");

  return {
    title: seoEntry.title,
    description: seoEntry.description,
    image: seoEntry.ogImage,
    canonical: toAbsoluteUrl(seoEntry.canonicalPath || pathname),
    type: pathname.startsWith("/blog/") && pathname !== "/blog" ? "article" : "website",
    isNoIndex,
    isNoFollow,
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

      return {
        title: `${post.title} | Christopher B. Wong, DDS`,
        description: excerpt,
        robots: {
          index: true,
          follow: !seoMetadata.isNoFollow,
          googleBot: {
            index: true,
            follow: !seoMetadata.isNoFollow,
          },
        },
        alternates: {
          canonical: seoMetadata.canonical,
        },
        openGraph: {
          type: "article",
          url: seoMetadata.canonical,
          title: `${post.title} | Christopher B. Wong, DDS`,
          description: excerpt,
          images: [absoluteImage],
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
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
      alternates: {
        canonical: seoMetadata.canonical,
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
    robots: {
      index: !seoMetadata.isNoIndex,
      follow: !seoMetadata.isNoIndex && !seoMetadata.isNoFollow,
      googleBot: {
        index: !seoMetadata.isNoIndex,
        follow: !seoMetadata.isNoIndex && !seoMetadata.isNoFollow,
      },
    },
    alternates: {
      canonical: seoMetadata.canonical,
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
    other: {
      robots: seoMetadata.isNoIndex || seoMetadata.isNoFollow ? NOINDEX_ROBOTS : DEFAULT_ROBOTS,
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

  return <RouteShell ssrPath={canonicalPath} />;
}
