import { doctorInfo, getOfficeTodayISO, officeInfo } from "@/lib/data";
import type { TeamMember } from "@/data/team";
import type { Service, Testimonial } from "@shared/schema";

export type FAQEntry = {
  question: string;
  answer: string;
};

export type HowToStep = {
  title: string;
  description: string;
  duration?: string;
  tip?: string;
};

export type StructuredDataNode = Record<string, unknown>;

type CollectionPart = {
  name: string;
  path: string;
  description?: string;
};

const PROD_DOMAIN = "www.chriswongdds.com";
const DEFAULT_AREA_SERVED = [
  "Palo Alto",
  "Menlo Park",
  "Mountain View",
  "Stanford",
  "Los Altos",
  "Los Altos Hills",
  "Sunnyvale",
  "Cupertino",
  "Redwood City",
  "Atherton",
  "Redwood Shores",
] as const;

const SERVICE_SLUG_TO_PATH: Record<string, string> = {
  "preventive-dentistry": "/preventive-dentistry",
  "restorative-dentistry": "/restorative-dentistry",
  "pediatric-dentistry": "/pediatric-dentistry",
  "cosmetic-dentistry": "/dental-veneers",
  invisalign: "/invisalign",
  // /zoom-whitening was merged into the teeth-whitening page (2026-10-16).
  "zoom-whitening": "/teeth-whitening-palo-alto",
  "emergency-dental": "/emergency-dental",
} as const;

// Structured data must reference canonical absolute URLs — the `@id` and `url`
// fields are global identifiers, not the visitor's current host. Returning a
// constant (instead of reading `window.location` on the client) is therefore
// the SEO-correct behavior, and it also keeps the server-rendered JSON-LD
// byte-identical to the client render. The previous host-aware version emitted
// `https://www.chriswongdds.com` on the server but the live origin on the
// client (e.g. `http://localhost:3000`, or a Vercel preview URL), which made
// the <script type="application/ld+json"> text differ between server and
// client and triggered React hydration-mismatch errors on every non-canonical
// host.
export const getBaseUrl = () => `https://${PROD_DOMAIN}`;

export const absoluteUrl = (path = "/") => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = getBaseUrl();
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${safePath}`;
};

export const schemaId = (path: string, fragment: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedFragment = fragment.startsWith("#")
    ? fragment.slice(1)
    : fragment;
  return `${absoluteUrl(normalizedPath)}#${normalizedFragment}`;
};

// Stable entity identifiers. The practice and Dr. Wong keep the same `@id`
// on every page so crawlers can merge the nodes; pages that reference them
// also inline a slim copy (name, url, address, phone), because Google does
// not reliably join `@id`s across separate pages.
export const ORGANIZATION_ID = schemaId("/", "organization");
export const WEBSITE_ID = schemaId("/", "website");
export const DR_WONG_PERSON_ID = schemaId("/", "person-dr-wong");

// Date Dr. Wong last clinically reviewed the service pages (the 2026-10-16
// "Rooted" content rewrite). Bump it when he re-reviews a page's clinical copy.
export const CLINICAL_REVIEW_DATE = "2026-10-16";

// Real practice photos only (never AI or stock), as 1200x675 JPEG derivatives.
const OFFICE_IMAGES = {
  atriumCourtyard: "/images/og/atrium-courtyard.jpg",
  receptionDesk: "/images/og/reception-desk.jpg",
  drWongPolaroids: "/images/og/dr_wong_polaroids.jpg",
} as const;
const DEFAULT_SERVICE_IMAGE = OFFICE_IMAGES.atriumCourtyard;

const DR_WONG_PORTRAIT = {
  src: "/images/about/dr-wong-portrait.webp",
  width: 880,
  height: 1100,
} as const;

type SchemaImageInput = {
  src: string;
  width?: number;
  height?: number;
  caption?: string;
};

export const buildImageObject = (image: SchemaImageInput): StructuredDataNode => {
  const url = absoluteUrl(image.src);
  return {
    "@type": "ImageObject",
    contentUrl: url,
    url,
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
    ...(image.caption ? { caption: image.caption } : {}),
    creditText: officeInfo.name,
    copyrightNotice: officeInfo.name,
  };
};

const buildPostalAddress = (): StructuredDataNode => ({
  "@type": "PostalAddress",
  streetAddress: officeInfo.address.line1,
  addressLocality: officeInfo.address.city,
  addressRegion: officeInfo.address.region,
  postalCode: officeInfo.address.postalCode,
  addressCountry: officeInfo.address.country,
});

/** Slim practice reference for nodes emitted on pages other than the homepage. */
export const buildPracticeReference = (): StructuredDataNode => ({
  "@type": "Dentist",
  "@id": ORGANIZATION_ID,
  name: officeInfo.name,
  url: getBaseUrl(),
  telephone: officeInfo.phoneE164,
  address: buildPostalAddress(),
});

/** Slim Dr. Wong reference (reviewer/author) for pages without his full Person node. */
export const buildDrWongReference = (): StructuredDataNode => ({
  "@type": "Person",
  "@id": DR_WONG_PERSON_ID,
  name: "Christopher B. Wong",
  honorificPrefix: "Dr.",
  honorificSuffix: "DDS",
  jobTitle: "Dentist",
  url: absoluteUrl("/about"),
});

export const buildOrganizationSchema = (options?: {
  services?: Pick<Service, "title" | "description" | "slug">[];
  /**
   * Team members (client/src/data/team.ts) to list as `employee` references.
   * Their full Person nodes live on /about (buildTeamPersonSchemas).
   */
  team?: readonly Pick<TeamMember, "slug">[];
}) => {
  const baseUrl = getBaseUrl();
  const services = options?.services ?? [];
  const team = options?.team ?? [];
  const schema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": ORGANIZATION_ID,
    name: officeInfo.name,
    description:
      "Palo Alto dental practice providing preventive, restorative, cosmetic, Invisalign, implant restoration, and emergency dental care.",
    url: baseUrl,
    telephone: officeInfo.phoneE164,
    email: officeInfo.email,
    // Real office photos (courtyard, reception) plus Dr. Wong's polaroids.
    image: [
      absoluteUrl(OFFICE_IMAGES.atriumCourtyard),
      absoluteUrl(OFFICE_IMAGES.receptionDesk),
      absoluteUrl(OFFICE_IMAGES.drWongPolaroids),
    ],
    logo: absoluteUrl("/favicon/apple-touch-icon.png"),
    employee: [
      { "@id": DR_WONG_PERSON_ID },
      ...team.map((member) => ({ "@id": teamPersonId(member.slug) })),
    ],
    areaServed: DEFAULT_AREA_SERVED.map((city) => ({
      "@type": "City",
      name: city,
    })),
    sameAs: [
      officeInfo.socialMedia.facebook,
      officeInfo.socialMedia.instagram,
      officeInfo.socialMedia.linkedin,
      "https://www.yelp.com/biz/christopher-b-wong-dds-palo-alto",
      officeInfo.mapUrl,
    ],
    address: buildPostalAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.426868,
      longitude: -122.145487,
    },
    hasMap: officeInfo.mapUrl,
    medicalSpecialty: "https://schema.org/Dentistry",
    isAcceptingNewPatients: true,
    knowsAbout: [
      "Preventive dentistry",
      "Restorative dentistry",
      "Pediatric dentistry",
      "Cosmetic dentistry",
      "Invisalign clear aligners",
      "Dental implants",
      "Dental veneers",
      "Teeth whitening",
      "Dental crowns",
      "Cavity fillings",
      "Emergency dental care",
    ],
    openingHoursSpecification: officeInfo.openingHoursSpecification,
    // Omit the key entirely once every temporary-hours entry has expired —
    // an empty array is a meaningless property for consumers to parse.
    ...(() => {
      const specialHours = officeInfo.specialOpeningHoursSpecification.filter(
        (entry) => entry.validThrough >= getOfficeTodayISO(),
      );
      return specialHours.length
        ? { specialOpeningHoursSpecification: specialHours }
        : {};
    })(),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: officeInfo.phoneE164,
        contactType: "Customer Service",
        areaServed: DEFAULT_AREA_SERVED,
        availableLanguage: ["English"],
      },
    ],
  };

  if (services.length) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Dental Services",
      itemListElement: services.map((service) => {
        const mapped = SERVICE_SLUG_TO_PATH[service.slug];
        const serviceUrl = mapped ?? `/services#${service.slug}`;
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.description,
            url: absoluteUrl(serviceUrl),
          },
        };
      }),
    };
  }

  return schema;
};

// Professional memberships with their official sites. Names come from
// doctorInfo.credentials (About-page copy); unknown names are emitted without
// a URL rather than guessed.
const MEMBERSHIP_URLS: Record<string, string> = {
  "American Dental Association": "https://www.ada.org",
  "California Dental Association": "https://www.cda.org",
  "Santa Clara County Dental Society": "https://www.sccds.org",
};

const DUGONI_SCHOOL = {
  "@type": "CollegeOrUniversity",
  name: "University of the Pacific Arthur A. Dugoni School of Dentistry",
  url: "https://dental.pacific.edu",
} as const;

/**
 * Dr. Wong's Person node without `@context`, shared by the homepage Person
 * (buildPersonSchema) and the /about ProfilePage mainEntity so both describe
 * the same entity with the same `@id`. `name` stays "Christopher B. Wong";
 * honorifics are separate properties (AGENTS.md naming rule).
 */
const buildDrWongPersonNode = (): StructuredDataNode => {
  const profileUrl = absoluteUrl(doctorInfo.profileUrl ?? "/about");
  return {
    "@type": "Person",
    "@id": DR_WONG_PERSON_ID,
    name: "Christopher B. Wong",
    alternateName: doctorInfo.alternateNames,
    description: doctorInfo.bio,
    jobTitle: "Dentist",
    honorificPrefix: "Dr.",
    honorificSuffix: "DDS",
    url: profileUrl,
    image: buildImageObject({
      ...DR_WONG_PORTRAIT,
      caption: "Dr. Christopher B. Wong",
    }),
    ...(doctorInfo.sameAs?.length ? { sameAs: doctorInfo.sameAs } : {}),
    worksFor: buildPracticeReference(),
    alumniOf: [
      DUGONI_SCHOOL,
      {
        "@type": "CollegeOrUniversity",
        name: "University of California, Davis",
        url: "https://www.ucdavis.edu",
      },
    ],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "Doctor of Dental Surgery (DDS)",
      recognizedBy: DUGONI_SCHOOL,
    },
    // `credentials` is display copy for the About page and includes the dental
    // school as "… Graduate". That is an alumni relationship, not an
    // organization Dr. Wong is a member of, and it is already expressed by
    // `alumniOf` above — emitting it here would name a nonexistent
    // organization and duplicate the school.
    memberOf: doctorInfo.credentials
      .filter((credential) => !/\bgraduate\b/i.test(credential))
      .map((credential) => ({
        "@type": "Organization",
        name: credential,
        ...(MEMBERSHIP_URLS[credential]
          ? { url: MEMBERSHIP_URLS[credential] }
          : {}),
      })),
    knowsAbout: [
      "Conservative dentistry",
      "Preventive dentistry",
      "Restorative dentistry",
      "Invisalign clear aligners",
      "Dental implant restoration",
      "Dental crowns",
    ],
  };
};

export const buildPersonSchema = () => ({
  "@context": "https://schema.org",
  ...buildDrWongPersonNode(),
});

/**
 * /about: ProfilePage whose mainEntity is Dr. Wong's Person node.
 * Render alongside buildTeamPersonSchemas(team) and the existing breadcrumb.
 */
export const buildProfilePageSchema = (options?: {
  /** ISO date the profile content last changed (e.g. the route's lastmod). */
  dateModified?: string;
}): StructuredDataNode => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": schemaId("/about", "webpage"),
  url: absoluteUrl("/about"),
  name: "About Dr. Christopher B. Wong",
  inLanguage: "en-US",
  isPartOf: { "@id": WEBSITE_ID },
  ...(options?.dateModified ? { dateModified: options.dateModified } : {}),
  mainEntity: buildDrWongPersonNode(),
});

const teamPersonId = (slug: string) => schemaId("/about", `person-${slug}`);

// Credentials stated in the team bios (client/src/lib/data.ts teamMembers).
const TEAM_CREDENTIALS: Partial<Record<string, StructuredDataNode>> = {
  "dr-pearl-tran": {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "certification",
    name: "Diplomate, American Board of Periodontology",
    recognizedBy: {
      "@type": "Organization",
      name: "American Board of Periodontology",
      url: "https://www.abperio.org",
    },
  },
};

/**
 * Person nodes for the current team (pass `team` from client/src/data/team.ts).
 * The array is a parameter rather than an import so the team data never
 * lands in routes that do not render it (this module ships in the shared
 * shell). "Dr." is moved into honorificPrefix, matching Dr. Wong's node.
 */
export const buildTeamPersonSchemas = (
  members: readonly Pick<TeamMember, "slug" | "name" | "role" | "image">[],
): StructuredDataNode[] =>
  members.map((member) => {
    const isDoctor = /^Dr\.\s+/.test(member.name);
    const name = member.name.replace(/^Dr\.\s+/, "");
    const credential = TEAM_CREDENTIALS[member.slug];
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": teamPersonId(member.slug),
      name,
      ...(isDoctor ? { honorificPrefix: "Dr." } : {}),
      jobTitle: member.role,
      worksFor: { "@id": ORGANIZATION_ID },
      image: buildImageObject({
        src: member.image,
        caption: `${member.name}, ${member.role}`,
      }),
      ...(credential ? { hasCredential: credential } : {}),
    };
  });

// No `potentialAction` SearchAction: Google retired the sitelinks search box
// in 2024 and the site has no working search (/blog ignored ?q=).
export const buildWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: officeInfo.name,
    url: absoluteUrl("/"),
    inLanguage: "en-US",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
  };
};

type MedicalProcedureInput = {
  name: string;
  procedureType?: "Surgical" | "Noninvasive" | "Percutaneous";
  bodyLocation?: string;
  howPerformed?: string;
  preparation?: string;
  followup?: string;
};

const PROCEDURE_TYPE_URLS: Record<NonNullable<MedicalProcedureInput["procedureType"]>, string> = {
  Surgical: "https://schema.org/SurgicalProcedure",
  Noninvasive: "https://schema.org/NoninvasiveProcedure",
  Percutaneous: "https://schema.org/PercutaneousProcedure",
};

/**
 * Service page JSON-LD, returned as ONE node with an `@graph` so existing call
 * sites (`nodes.push(buildServiceSchema(...))`) keep working:
 *   - MedicalWebPage: reviewedBy Dr. Wong, lastReviewed, primary image.
 *   - Service: provider inlined (name/url/address/telephone) plus `@id`.
 *   - MedicalProcedure (only when `procedure` is passed), as the page's `about`.
 * `image` should be the page's real hero photo; it defaults to a real office
 * photo (never the favicon).
 */
export const buildServiceSchema = (service: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  serviceType?: string;
  areaServed?: string[];
  /** Visible page name for the MedicalWebPage (defaults to `name`). */
  pageName?: string;
  /** ISO date of Dr. Wong's last clinical review (defaults to CLINICAL_REVIEW_DATE). */
  lastReviewed?: string;
  procedure?: MedicalProcedureInput;
}): StructuredDataNode => {
  const path = service.slug.startsWith("/") ? service.slug : `/${service.slug}`;
  const url = absoluteUrl(path);
  const webPageId = schemaId(path, "webpage");
  const serviceId = schemaId(path, "service");
  const procedureId = schemaId(path, "procedure");
  const imageUrl = absoluteUrl(service.image ?? DEFAULT_SERVICE_IMAGE);
  const procedure = service.procedure;

  const webPage: StructuredDataNode = {
    "@type": "MedicalWebPage",
    "@id": webPageId,
    url,
    name: service.pageName ?? service.name,
    description: service.description,
    inLanguage: "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    specialty: "https://schema.org/Dentistry",
    about: { "@id": procedure ? procedureId : serviceId },
    mainEntity: { "@id": serviceId },
    primaryImageOfPage: { "@type": "ImageObject", url: imageUrl },
    reviewedBy: buildDrWongReference(),
    lastReviewed: service.lastReviewed ?? CLINICAL_REVIEW_DATE,
  };

  const serviceNode: StructuredDataNode = {
    "@type": "Service",
    "@id": serviceId,
    name: service.name,
    description: service.description,
    serviceType: service.serviceType ?? service.name,
    provider: buildPracticeReference(),
    areaServed: (service.areaServed ?? DEFAULT_AREA_SERVED).map((city) => ({
      "@type": "City",
      name: city,
    })),
    image: imageUrl,
    url,
    mainEntityOfPage: { "@id": webPageId },
  };

  const graph: StructuredDataNode[] = [webPage, serviceNode];

  if (procedure) {
    graph.push({
      "@type": "MedicalProcedure",
      "@id": procedureId,
      name: procedure.name,
      ...(procedure.procedureType
        ? { procedureType: PROCEDURE_TYPE_URLS[procedure.procedureType] }
        : {}),
      ...(procedure.bodyLocation ? { bodyLocation: procedure.bodyLocation } : {}),
      ...(procedure.howPerformed ? { howPerformed: procedure.howPerformed } : {}),
      ...(procedure.preparation ? { preparation: procedure.preparation } : {}),
      ...(procedure.followup ? { followup: procedure.followup } : {}),
      url,
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};

export const buildItemListSchema = (services: Service[]) => {
  if (!services.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": schemaId("/services", "item-list"),
    name: "Dental services offered",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/services#${service.slug}`),
      name: service.title,
      description: service.description,
    })),
  };
};

export const buildCollectionPageSchema = (config: {
  path: string;
  name: string;
  description: string;
  parts: CollectionPart[];
}) => {
  if (!config.parts.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": schemaId(config.path, "collection-page"),
    name: config.name,
    description: config.description,
    url: absoluteUrl(config.path),
    isPartOf: {
      "@id": schemaId("/", "website"),
    },
    hasPart: config.parts.map((part) => ({
      "@type": "WebPage",
      "@id": schemaId(part.path, "webpage"),
      name: part.name,
      url: absoluteUrl(part.path),
      ...(part.description ? { description: part.description } : {}),
    })),
  };
};

export const buildLocationItemListSchema = (locations: CollectionPart[]) => {
  if (!locations.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": schemaId("/locations", "location-list"),
    name: "Areas served from Palo Alto dental office",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: locations.length,
    itemListElement: locations.map((location, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: location.name,
      url: absoluteUrl(location.path),
      ...(location.description ? { description: location.description } : {}),
    })),
  };
};

export const toIsoDateString = (value: string): string | null => {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return null;
  return new Date(time).toISOString().split("T")[0];
};

type BlogListPost = {
  title: string;
  slug: string;
  date: string;
};

export const buildBlogListSchemas = (
  posts: BlogListPost[],
  limit = 10,
): StructuredDataNode[] => {
  if (!posts.length) return [];
  const items = posts.slice(0, limit);
  const postNodes = items.map((post) => {
    const isoDate = toIsoDateString(post.date);
    return {
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      ...(isoDate ? { datePublished: isoDate } : {}),
    };
  });

  return [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": schemaId("/blog", "blog"),
      name: "Dental Health Blog",
      url: absoluteUrl("/blog"),
      publisher: {
        "@id": schemaId("/", "organization"),
      },
      blogPost: postNodes,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": schemaId("/blog", "post-list"),
      name: "Latest dental health articles",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: items.length,
      itemListElement: items.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.title,
        url: absoluteUrl(`/blog/${post.slug}`),
      })),
    },
  ];
};

export const buildFAQSchema = (faqs: FAQEntry[], pagePath: string) => {
  if (!faqs.length) return null;
  const pageUrl = absoluteUrl(pagePath);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

/** @deprecated HowTo rich results were retired in 2023; remove remaining calls. */
export const buildHowToSchema = (config: {
  name: string;
  description: string;
  steps: HowToStep[];
  pagePath: string;
}) => {
  if (!config.steps.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: config.name,
    description: config.description,
    step: config.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description,
      url: `${absoluteUrl(config.pagePath)}#step-${index + 1}`,
    })),
  };
};

type VideoMediaInput = {
  id: string;
  title: string;
  description: string;
  src: string;
  poster?: string;
  // Explicit ISO date (yyyy-mm-dd, or a full ISO 8601 timestamp with offset)
  // for self-hosted /videos/*.mp4 files, which carry no Cloudinary version
  // segment to derive a date from.
  uploadDate?: string;
  /** ISO 8601 duration, e.g. "PT2M14S". */
  duration?: string;
  /** BCP 47 language of the spoken audio, e.g. "en". */
  inLanguage?: string;
  /** Plain-text transcript of the video. */
  transcript?: string;
  width?: number;
  height?: number;
};

// Cloudinary delivery URLs embed the upload time as a unix-seconds version
// segment (/v1772057711/), which gives VideoObject a real uploadDate without
// maintaining dates by hand.
const extractCloudinaryUploadDate = (src: string): string | null => {
  const match = src.match(/\/v(\d{10})\//);
  if (!match) return null;
  return new Date(Number(match[1]) * 1000).toISOString().split("T")[0];
};

export const buildVideoObjectSchemas = (
  videos: VideoMediaInput[],
  pagePath: string,
): StructuredDataNode[] =>
  videos.map((video) => {
    const uploadDate =
      video.uploadDate ?? extractCloudinaryUploadDate(video.src);
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "@id": schemaId(pagePath, `video-${video.id}`),
      name: video.title,
      description: video.description,
      contentUrl: video.src.startsWith("/")
        ? absoluteUrl(video.src)
        : video.src,
      ...(video.poster ? { thumbnailUrl: absoluteUrl(video.poster) } : {}),
      ...(uploadDate ? { uploadDate } : {}),
      ...(video.duration ? { duration: video.duration } : {}),
      ...(video.inLanguage ? { inLanguage: video.inLanguage } : {}),
      ...(video.width ? { width: video.width } : {}),
      ...(video.height ? { height: video.height } : {}),
      ...(video.transcript ? { transcript: video.transcript } : {}),
      publisher: {
        "@id": ORGANIZATION_ID,
      },
    };
  });

// "Full Circle" film (client/src/data/fullCircleFilm.ts). Paths are built from
// the folder constant so the schema tracks the published encodes.
const FULL_CIRCLE_BASE = "/videos/full-circle";
const FULL_CIRCLE_UPLOAD_DATE = "2026-10-16T09:00:00-07:00";

/**
 * Two VideoObjects for the "Full Circle" film: the 2:14 landscape cut and the
 * 0:56 vertical cut. Emit them on the page where the film is the main content
 * (the /office-tour watch page); Google only shows video results there.
 */
export const buildFullCircleVideoSchemas = (options?: {
  /** Plain-text transcript of the landscape cut. */
  transcript?: string;
  /** Plain-text transcript of the vertical cut. */
  verticalTranscript?: string;
  /** Page that hosts the film as main content (defaults to /office-tour). */
  pagePath?: string;
}): StructuredDataNode[] =>
  buildVideoObjectSchemas(
    [
      {
        id: "full-circle",
        title: "Full Circle — Dr. Christopher B. Wong's story",
        description:
          "A short film about Dr. Christopher B. Wong's path to dentistry and the Palo Alto dental practice on Cambridge Avenue that he now leads.",
        src: `${FULL_CIRCLE_BASE}/full-circle-1080.mp4`,
        poster: `${FULL_CIRCLE_BASE}/poster-landscape-1280.jpg`,
        uploadDate: FULL_CIRCLE_UPLOAD_DATE,
        duration: "PT2M14S",
        inLanguage: "en",
        width: 1920,
        height: 1080,
        ...(options?.transcript ? { transcript: options.transcript } : {}),
      },
      {
        id: "full-circle-vertical",
        title: "Full Circle (short) — Dr. Christopher B. Wong's story",
        description:
          "The 56-second vertical cut of Full Circle, a short film about Dr. Christopher B. Wong's path to dentistry and the Palo Alto practice he now leads.",
        src: `${FULL_CIRCLE_BASE}/full-circle-vertical-1080.mp4`,
        poster: `${FULL_CIRCLE_BASE}/poster-vertical-720.jpg`,
        uploadDate: FULL_CIRCLE_UPLOAD_DATE,
        duration: "PT56S",
        inLanguage: "en",
        width: 1080,
        height: 1920,
        ...(options?.verticalTranscript
          ? { transcript: options.verticalTranscript }
          : {}),
      },
    ],
    options?.pagePath ?? "/office-tour",
  );

export const buildBreadcrumbSchema = (items: { name: string; path: string }[]) => {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
};

export const buildAggregateRatingFromTestimonials = (
  testimonials: Pick<Testimonial, "rating">[],
) => {
  if (!testimonials.length) return null;
  const reviewCount = testimonials.length;
  const total = testimonials.reduce((sum, item) => sum + (item.rating || 0), 0);
  const ratingValue = total / reviewCount;
  return {
    ratingValue,
    reviewCount,
  };
};

export const buildReviewSchemas = (
  _testimonials: Pick<Testimonial, "name" | "text" | "rating" | "location">[],
  _limit = 8,
) => {
  // Patient quotes remain visible and source-labelled for visitors. Google
  // does not allow a LocalBusiness to earn review rich results from reviews
  // about itself or aggregate ratings copied from third-party platforms, so
  // these quotes intentionally emit no Review JSON-LD.
  return [];
};
