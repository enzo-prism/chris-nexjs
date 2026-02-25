import { Helmet } from "@/lib/helmet";
import { drWongImages } from "@/lib/imageUrls";
import { DEFAULT_ROBOTS, getSeoForPath, normalizePathname } from "@/lib/seo";
import { useLocation } from "wouter";

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  url?: string;
  type?: string;
  robots?: string;
}

export default function MetaTags({
  title,
  description,
  image,
  canonicalPath,
  url,
  type = "website",
  robots,
}: MetaTagsProps) {
  const [location] = useLocation();
  const normalizedLocation = normalizePathname(location || "/");
  const routeSeo = getSeoForPath(normalizedLocation);

  const resolvedTitle =
    title ?? routeSeo.title ?? "Palo Alto Dentist | Christopher B. Wong, DDS";
  const resolvedDescription =
    description ??
    routeSeo.description ??
    "Trusted Palo Alto dentist offering family and cosmetic dental care.";

  const resolvedCanonicalPath =
    canonicalPath ?? routeSeo.canonicalPath ?? normalizedLocation;
  const defaultOrigin = "https://www.chriswongdds.com";
  const canonicalUrl = resolvedCanonicalPath.startsWith("http")
    ? resolvedCanonicalPath
    : `${defaultOrigin}${resolvedCanonicalPath.startsWith("/") ? resolvedCanonicalPath : `/${resolvedCanonicalPath}`}`;

  const normalizedUrl = url ?? canonicalUrl;

  const resolvedImage =
    image ?? routeSeo.ogImage ?? drWongImages.drWongPortrait1;
  const fullImageUrl = resolvedImage.startsWith("http")
    ? resolvedImage
    : `${defaultOrigin}${resolvedImage.startsWith("/") ? resolvedImage : `/${resolvedImage}`}`;

  const resolvedRobots = robots ?? routeSeo.robots ?? DEFAULT_ROBOTS;
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": routeSeo.schemaType ?? "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    name: resolvedTitle,
    description: resolvedDescription,
    url: canonicalUrl,
    isPartOf: {
      "@id": `${defaultOrigin}/#website`,
    },
    about: {
      "@id": `${defaultOrigin}/#organization`,
    },
    ...(routeSeo.lastmod ? { dateModified: routeSeo.lastmod } : {}),
  };

  const isServer = typeof window === "undefined";
  
  return (
    <Helmet>
      {/* Primary Meta Tags (client only; SSR uses template injection) */}
      {!isServer && (
        <>
          <title>{resolvedTitle}</title>
          <meta name="title" content={resolvedTitle} />
          <meta name="description" content={resolvedDescription} />
        </>
      )}
      
      {/* SEO and duplicate content prevention */}
      <meta name="robots" content={resolvedRobots} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={normalizedUrl} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={fullImageUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={normalizedUrl} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={fullImageUrl} />

      <script type="application/ld+json">
        {JSON.stringify(pageSchema)}
      </script>
    </Helmet>
  );
}
