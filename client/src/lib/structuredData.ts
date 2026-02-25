import { officeInfo, doctorInfo } from "@/lib/data";
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
  "zoom-whitening": "/zoom-whitening",
  "emergency-dental": "/emergency-dental",
} as const;

const normalizeHost = (hostname: string) => {
  if (hostname === "chriswongdds.com") {
    return PROD_DOMAIN;
  }

  if (hostname.endsWith("chriswongdds.com") && !hostname.startsWith("www.")) {
    return PROD_DOMAIN;
  }

  return hostname;
};

export const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return `https://${PROD_DOMAIN}`;
  }

  const { protocol, hostname, port } = window.location;
  const normalizedHost = normalizeHost(hostname);
  const includePort = normalizedHost === hostname && port ? `:${port}` : "";
  return `${protocol}//${normalizedHost}${includePort}`;
};

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

export const buildOrganizationSchema = (options?: {
  services?: Pick<Service, "title" | "description" | "slug">[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) => {
  const baseUrl = getBaseUrl();
  const services = options?.services ?? [];
  const schema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": schemaId("/", "organization"),
    name: officeInfo.name,
    description:
      "Premier Palo Alto dentist Dr. Christopher Wong provides exceptional dental care across preventive, restorative, and cosmetic dentistry.",
    url: baseUrl,
    telephone: officeInfo.phoneE164,
    email: officeInfo.email,
    image: absoluteUrl("/images/dr_wong_polaroids.png"),
    logo: absoluteUrl("/favicon/apple-touch-icon.png"),
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Insurance",
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
    address: {
      "@type": "PostalAddress",
      streetAddress: officeInfo.address.line1,
      addressLocality: officeInfo.address.city,
      addressRegion: officeInfo.address.region,
      postalCode: officeInfo.address.postalCode,
      addressCountry: officeInfo.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.4488473,
      longitude: -122.1497687,
    },
    hasMap: officeInfo.mapUrl,
    medicalSpecialty: "https://schema.org/Dentistry",
    isAcceptingNewPatients: true,
    openingHoursSpecification: officeInfo.openingHoursSpecification,
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

  if (options?.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.aggregateRating.ratingValue.toFixed(1),
      reviewCount: options.aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
};

export const buildPersonSchema = () => {
  const profileUrl = absoluteUrl(doctorInfo.profileUrl ?? "/about");
  const imageUrl = doctorInfo.image ? absoluteUrl(doctorInfo.image) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": schemaId("/", "person-dr-wong"),
    name: doctorInfo.name,
    alternateName: doctorInfo.alternateNames,
    description: doctorInfo.bio,
    jobTitle: "Doctor of Dental Surgery",
    honorificPrefix: "Dr.",
    honorificSuffix: "DDS",
    url: profileUrl,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(doctorInfo.sameAs?.length ? { sameAs: doctorInfo.sameAs } : {}),
    worksFor: {
      "@id": schemaId("/", "organization"),
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "University of the Pacific Arthur A. Dugoni School of Dentistry",
      },
    ],
    memberOf: doctorInfo.credentials.map((credential) => ({
      "@type": "Organization",
      name: credential,
    })),
  };
};

export const buildWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": schemaId("/", "website"),
    name: officeInfo.name,
    alternateName: "Dr. Christopher Wong Palo Alto Dentist",
    url: absoluteUrl("/"),
    publisher: {
      "@id": schemaId("/", "organization"),
    },
  };
};

export const buildServiceSchema = (service: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  serviceType?: string;
  areaServed?: string[];
}) => {
  const baseUrl = getBaseUrl();
  const path = service.slug.startsWith("/") ? service.slug : `/${service.slug}`;
  const url = absoluteUrl(path);
  const schema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": schemaId(path, "service"),
    name: service.name,
    description: service.description,
    serviceType: service.serviceType ?? service.name,
    provider: {
      "@id": schemaId("/", "organization"),
    },
    areaServed: (service.areaServed ?? DEFAULT_AREA_SERVED).map((city) => ({
      "@type": "City",
      name: city,
    })),
    image: service.image ? absoluteUrl(service.image) : `${baseUrl}/favicon/apple-touch-icon.png`,
    url,
  };

  return schema;
};

export const buildItemListSchema = (services: Service[]) => {
  if (!services.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
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
  testimonials: Pick<Testimonial, "name" | "text" | "rating" | "location">[],
  limit = 8,
) => {
  if (!testimonials.length) return [];
  const baseUrl = getBaseUrl();
  return testimonials.slice(0, limit).map((testimonial, index) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "@id": `${baseUrl}/#review-${index + 1}`,
    reviewBody: testimonial.text,
    reviewRating: {
      "@type": "Rating",
      ratingValue: testimonial.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: testimonial.name,
    },
    itemReviewed: {
      "@id": `${baseUrl}/#organization`,
    },
    publisher: {
      "@type": "Organization",
      name: officeInfo.name,
    },
  }));
};
