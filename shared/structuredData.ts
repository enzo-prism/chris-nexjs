import { officeInfo } from "./officeInfo";

export type JsonLdObject = Record<string, unknown>;

const SITE_URL = "https://www.chriswongdds.com";

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: officeInfo.address.line1,
  addressLocality: officeInfo.address.city,
  addressRegion: officeInfo.address.region,
  postalCode: officeInfo.address.postalCode,
  addressCountry: officeInfo.address.country,
} as const;

export function buildDentistJsonLd(): JsonLdObject {
  const instagram = officeInfo.socialMedia.instagram;
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": `${SITE_URL}/#dentist`,
    name: officeInfo.name,
    url: `${SITE_URL}/`,
    telephone: officeInfo.phoneE164,
    address: POSTAL_ADDRESS,
    isAcceptingNewPatients: true,
    medicalSpecialty: "https://schema.org/Dentistry",
    sameAs: instagram ? [instagram] : undefined,
    openingHoursSpecification: officeInfo.openingHoursSpecification,
  };
}

export function buildOrganizationJsonLd(): JsonLdObject {
  const instagram = officeInfo.socialMedia.instagram;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: officeInfo.name,
    url: `${SITE_URL}/`,
    telephone: officeInfo.phoneE164,
    address: POSTAL_ADDRESS,
    sameAs: instagram ? [instagram] : undefined,
  };
}

export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: officeInfo.name,
    alternateName: "Dr. Christopher Wong Palo Alto Dentist",
    url: `${SITE_URL}/`,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function buildHomepageJsonLd(): JsonLdObject[] {
  return [buildDentistJsonLd(), buildOrganizationJsonLd(), buildWebSiteJsonLd()];
}
