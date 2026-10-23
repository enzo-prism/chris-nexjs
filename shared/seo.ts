import { officeInfo } from "./officeInfo";
import { stripMarkdownToPlainText } from "./blog";

export type SeoDefinition = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  robots?: string;
  indexable: boolean;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly";
  lastmod?: string;
  schemaType?: "WebPage" | "Service" | "Article" | "LocalBusiness";
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  seoCluster?: "service" | "location" | "blog" | "trust" | "legal";
  titleMaxLen?: number;
  descriptionMinLen?: number;
  descriptionMaxLen?: number;
};

type SeoDefinitionInput = Omit<
  SeoDefinition,
  "indexable" | "priority" | "changefreq"
> &
  Partial<Pick<SeoDefinition, "indexable" | "priority" | "changefreq">>;

export type SitemapEntry = {
  canonicalPath: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly";
  lastmod?: string;
};

export const DEFAULT_ROBOTS =
  "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
export const NOINDEX_ROBOTS = "noindex, nofollow, noarchive";
// For pages that should stay out of the index but whose links should still be
// followed (e.g. the public site-updates log).
export const NOINDEX_FOLLOW_ROBOTS = "noindex, follow";

const DEFAULT_OG_IMAGE = "/images/og/dr_wong_polaroids.jpg";
const DEFAULT_PRIORITY = 0.7;
const DEFAULT_CHANGEFREQ: SitemapEntry["changefreq"] = "monthly";
const CLUSTER_PRIORITY_DEFAULTS: Record<
  NonNullable<SeoDefinition["seoCluster"]>,
  number
> = {
  service: 0.82,
  location: 0.78,
  blog: 0.7,
  trust: 0.66,
  legal: 0.35,
};
const CLUSTER_CHANGEFREQ_DEFAULTS: Record<
  NonNullable<SeoDefinition["seoCluster"]>,
  SitemapEntry["changefreq"]
> = {
  service: "weekly",
  location: "weekly",
  blog: "weekly",
  trust: "monthly",
  legal: "monthly",
};
const DEFAULT_TITLE_MIN_LEN = 45;
const DEFAULT_TITLE_MAX_LEN = 60;
const DEFAULT_DESCRIPTION_MIN_LEN = 120;
const DEFAULT_DESCRIPTION_MAX_LEN = 160;
const DESCRIPTION_EXTENSION = ` Call ${officeInfo.phone} to schedule your visit.`;

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.split(/[?#]/)[0] || "/";
  if (!trimmed) return "/";
  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

const seoByPathSource: Record<string, SeoDefinitionInput> = {
  "/": {
    title: "Palo Alto Family Dentist | Christopher B. Wong, DDS",
    description:
      "Family and cosmetic dentistry on Cambridge Ave, Palo Alto: cleanings, Invisalign, crowns, implant restoration and urgent visits. New patients welcome.",
    canonicalPath: "/",
    ogImage: "/images/og/reception-area.jpg",
    primaryKeyword: "dentist palo alto",
    secondaryKeywords: [
      "family dentist palo alto",
      "cosmetic dentist palo alto",
      "new patient dentist palo alto",
      "dentist california ave",
    ],
  },
  "/about": {
    title: "About Our Palo Alto Dentist | Christopher B. Wong, DDS",
    description:
      "Meet Dr. Christopher B. Wong and the team behind our Cambridge Ave practice, caring for Palo Alto families for decades. Conservative care, clear options.",
    canonicalPath: "/about",
    ogImage: "/images/og/dr-wong-portrait-2.jpg",
    primaryKeyword: "christopher b wong dds",
    secondaryKeywords: [
      "dr christopher wong palo alto",
      "kris hamamoto dds",
    ],
  },
  "/services": {
    title: "Dental Services in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Every service at our Palo Alto office: cleanings, children's care, fillings, crowns, implants, Invisalign, whitening, veneers and emergency visits.",
    canonicalPath: "/services",
    ogImage: "/images/og/practice-og.jpg",
    primaryKeyword: "dental services palo alto",
    secondaryKeywords: [
      "general dentistry palo alto",
    ],
  },
  "/preventive-dentistry": {
    title: "Preventive Dentistry in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Exams, digital X-rays, oral cancer screening, sealants, fluoride and custom guards in Palo Alto, planned around your actual cavity and gum risk.",
    canonicalPath: "/preventive-dentistry",
    ogImage: "/images/og/hygienist-operatory.jpg",
    primaryKeyword: "preventive dentistry palo alto",
    secondaryKeywords: [
      "dental exam palo alto",
      "oral cancer screening palo alto",
      "fluoride and sealants for adults",
    ],
  },
  "/restorative-dentistry": {
    title: "Restorative Dentistry, Palo Alto | Christopher B. Wong, DDS",
    description:
      "Fillings, crowns, bridges and implant restorations in Palo Alto, done conservatively so you keep as much natural tooth as possible.",
    canonicalPath: "/restorative-dentistry",
    ogImage: "/images/og/courtyard-operatory.jpg",
    primaryKeyword: "restorative dentistry palo alto",
    secondaryKeywords: [
      "broken tooth repair",
      "dental bridge palo alto",
      "replace missing tooth",
    ],
  },
  "/pediatric-dentistry": {
    title: "Children’s Dentistry in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Calm, family-friendly visits for kids and teens in Palo Alto: first visits, cleanings, sealants, fluoride and sports guards. Siblings can come together.",
    canonicalPath: "/pediatric-dentistry",
    ogImage: "/images/og/reception-desk.jpg",
    primaryKeyword: "kids dentist palo alto",
    secondaryKeywords: [
      "children's dentist palo alto",
      "child's first dental visit",
      "sealants for kids",
    ],
  },
  "/patient-resources": {
    title: "New Patients & Forms | Christopher B. Wong, DDS",
    description:
      "Everything for your first visit to our Palo Alto office: what happens, the forms to fill in ahead, what to bring, insurance checks, and parking tips.",
    canonicalPath: "/patient-resources",
    ogImage: "/images/og/office-entrance.jpg",
  },
  "/insurance": {
    title: "Dental Insurance & Payment | Christopher B. Wong, DDS",
    description:
      "How PPO insurance works at our Palo Alto office: out-of-network benefits verified first, an in-house plan if uninsured, plus Visa, MasterCard, FSA/HSA.",
    canonicalPath: "/insurance",
    ogImage: "/images/og/office-entrance.jpg",
    seoCluster: "trust",
    primaryKeyword: "dental insurance palo alto",
    secondaryKeywords: [
      "out-of-network ppo dentist",
      "dentist without insurance palo alto",
      "in-house dental plan",
    ],
  },
  "/testimonials": {
    title: "Patient Reviews, Palo Alto | Christopher B. Wong, DDS",
    description:
      "Read hundreds of five-star patient reviews of our Palo Alto dental office, from cleanings with our long-time hygienists to urgent same-day care.",
    canonicalPath: "/testimonials",
    ogImage: "/images/og/team-photo.jpg",
  },
  "/patient-stories": {
    title: "Patient Stories & Transformations | Christopher B. Wong, DDS",
    description:
      "Real patient case studies showing Invisalign, whitening, and bonding transformations by Palo Alto dentist Dr. Christopher B. Wong.",
    canonicalPath: "/patient-stories",
    // Local JPEG derivative of the Cloudinary hero (IMG_8356) — a remote WebP
    // og:image is silently dropped by X/Twitter and LinkedIn.
    ogImage: "/images/og/patient-stories.jpg",
  },
  "/blog": {
    title: "Dental Health Blog | Christopher B. Wong, DDS, Palo Alto",
    description:
      "Dental health tips and news from Dr. Wong's Palo Alto dental practice. Stay informed about oral health and dental technology advances.",
    canonicalPath: "/blog",
    ogImage: "/images/og/historical-photos.jpg",
  },
  // Kept public and linked from the footer as "Site updates", but it has no
  // patient value in search results: noindex, follow (2026-10-16).
  "/changelog": {
    title: "Site Updates | Christopher B. Wong, DDS",
    description:
      "Read recent website updates in simple language, from new features and design updates to important fixes.",
    canonicalPath: "/changelog",
    ogImage: DEFAULT_OG_IMAGE,
    robots: NOINDEX_FOLLOW_ROBOTS,
    seoCluster: "trust",
  },
  "/gallery": {
    title: "Photo & Video Gallery | Christopher B. Wong, DDS",
    description:
      "Take a look at our Palo Alto dental office, treatment rooms, and care-first environment through real photos and short walkthrough videos from Dr. Wong's team.",
    canonicalPath: "/gallery",
    ogImage: "/images/og/polaroid-collage.jpg",
    seoCluster: "trust",
  },
  "/office-tour": {
    title: "Office Tour & Film, Palo Alto | Christopher B. Wong, DDS",
    description:
      "Watch our short film and tour the garden courtyard, reception lounge and treatment rooms of our Cambridge Ave dental office in Palo Alto.",
    canonicalPath: "/office-tour",
    ogImage: "/images/og/atrium-courtyard.jpg",
    seoCluster: "trust",
  },
  "/contact": {
    title: "Contact | Palo Alto Dentist | Christopher B. Wong, DDS",
    description: `Contact Palo Alto dentist Dr. Christopher B. Wong at ${officeInfo.address.line1}, ${officeInfo.address.line2}. Call ${officeInfo.phone} to schedule your visit.`,
    canonicalPath: "/contact",
    ogImage: "/images/og/exterior-entry.jpg",
  },
  "/schedule": {
    title: "Request a Dental Appointment | Palo Alto, CA",
    description:
      "Request an appointment with Palo Alto dentist Dr. Christopher B. Wong. New patients welcome. Send a visit request online and our team will confirm.",
    canonicalPath: "/schedule",
    ogImage: "/images/og/operatory-room.jpg",
  },
  "/invisalign": {
    title: "Invisalign in Palo Alto, CA | Christopher B. Wong, DDS",
    description:
      "Invisalign clear aligners for teens and adults in Palo Alto: 3D scan, a clear plan, and checkups that fit busy schedules. Ask how PPO ortho benefits apply.",
    canonicalPath: "/invisalign",
    ogImage: "/images/og/invisalign-itero-scan.jpg",
    primaryKeyword: "invisalign palo alto",
    secondaryKeywords: [
      "invisalign dentist palo alto",
      "clear aligners palo alto",
      "invisalign cost palo alto",
      "invisalign for teens",
    ],
  },
  "/invisalign/resources": {
    title: "Invisalign Resources in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Invisalign resources for Palo Alto patients: timelines, attachments, costs, and aftercare. Explore clear aligner guidance and book a consult.",
    canonicalPath: "/invisalign/resources",
    ogImage: "/images/og/invisalign-itero-scan.jpg",
    // Merged into /invisalign on 2026-10-16; middleware 301s it (shared/redirects.ts).
    indexable: false,
  },
  "/emergency-dental": {
    title: "Emergency Dentist in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Toothache, broken tooth or lost crown? Call our Palo Alto office. We hold time for urgent visits and see new patients the same day when we can.",
    canonicalPath: "/emergency-dental",
    ogImage: "/images/og/reception-desk.jpg",
    primaryKeyword: "emergency dentist palo alto",
    secondaryKeywords: [
      "same day dentist palo alto",
      "toothache",
      "broken tooth dentist",
      "urgent dental care",
    ],
  },
  "/zoom-whitening": {
    title: "ZOOM Teeth Whitening, Palo Alto | Christopher B. Wong, DDS",
    description:
      "In‑office ZOOM! whitening in Palo Alto for a noticeably brighter smile. Professional isolation, shade planning, and sensitivity management—book a visit.",
    canonicalPath: "/zoom-whitening",
    ogImage: "/images/og/historical-photos.jpg",
    // Merged into /teeth-whitening-palo-alto on 2026-10-16; middleware 301s the
    // exact path only, so the invite-only /zoom-whitening/schedule stays live.
    indexable: false,
  },
  "/zoom-whitening/schedule": {
    title: "Invite Only - Whitening Appointment Schedule",
    description:
      "Private scheduling page for invited patients booking a complimentary in-office ZOOM! Whitening session with photo and video capture.",
    canonicalPath: "/zoom-whitening/schedule",
    ogImage: "/images/og/historical-photos.jpg",
    robots: NOINDEX_ROBOTS,
  },
  "/teeth-whitening-palo-alto": {
    title: "Teeth Whitening in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Dentist-supervised teeth whitening in Palo Alto: one-visit ZOOM! in-office whitening or custom take-home trays, planned to limit sensitivity.",
    canonicalPath: "/teeth-whitening-palo-alto",
    ogImage: "/images/og/operatory-garden-view.jpg",
    primaryKeyword: "teeth whitening palo alto",
    secondaryKeywords: [
      "zoom whitening palo alto",
      "in-office whitening",
      "take-home whitening trays",
      "whitening cost palo alto",
    ],
  },
  "/dental-cleaning-palo-alto": {
    title: "Teeth Cleaning in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Thorough, gentle teeth cleanings and exams in Palo Alto with our long-time hygienists, plus deep cleaning when gums need it. PPO benefits checked first.",
    canonicalPath: "/dental-cleaning-palo-alto",
    ogImage: "/images/og/operatory-equipment.jpg",
    primaryKeyword: "teeth cleaning palo alto",
    secondaryKeywords: [
      "dental cleaning palo alto",
      "dental checkup palo alto",
      "deep cleaning palo alto",
    ],
  },
  "/cavity-fillings-palo-alto": {
    title: "Cavity Fillings in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Tooth-colored composite fillings in Palo Alto that treat cavities early and blend in, with gentle numbing and a clear plan and cost before treatment.",
    canonicalPath: "/cavity-fillings-palo-alto",
    ogImage: "/images/og/operatory-room.jpg",
    primaryKeyword: "cavity filling palo alto",
    secondaryKeywords: [
      "tooth colored fillings",
      "replace silver fillings palo alto",
    ],
  },
  "/crowns-palo-alto": {
    title: "Dental Crowns in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Natural-looking crowns in Palo Alto for cracked, broken or heavily filled teeth, with fit and bite checked carefully. PPO benefits verified first.",
    canonicalPath: "/crowns-palo-alto",
    ogImage: "/images/og/operatory-room.jpg",
    primaryKeyword: "dental crowns palo alto",
    secondaryKeywords: [
      "porcelain crown",
      "zirconia crown",
      "crown cost palo alto",
      "cracked tooth crown",
      "crown after root canal",
    ],
  },
  "/dentist-menlo-park": {
    title: "Dentist Near Menlo Park | Christopher B. Wong, DDS",
    description:
      "Menlo Park families visit our nearby Palo Alto office for cleanings, children's care, Invisalign and urgent visits, with parking and arrival tips.",
    canonicalPath: "/dentist-menlo-park",
    ogImage: "/images/og/exterior-entry.jpg",
    primaryKeyword: "dentist menlo park",
    secondaryKeywords: [
      "family dentist near menlo park",
    ],
  },
  "/dentist-stanford": {
    title: "Dentist Near Stanford University | Christopher B. Wong, DDS",
    description:
      "Stanford students, faculty and staff visit our California Ave office for cleanings, urgent care and Invisalign, scheduled around quarters and travel.",
    canonicalPath: "/dentist-stanford",
    ogImage: "/images/og/atrium-courtyard.jpg",
    primaryKeyword: "dentist near stanford",
    secondaryKeywords: [
      "stanford dentist",
      "dentist for stanford students",
    ],
  },
  "/dentist-mountain-view": {
    title: "Dentist Near Mountain View | Christopher B. Wong, DDS",
    description:
      "Mountain View families visit our nearby Palo Alto office for cleanings, fillings, Invisalign and same-day urgent care, with easy parking on arrival.",
    canonicalPath: "/dentist-mountain-view",
    ogImage: "/images/og/garden-courtyard.jpg",
    primaryKeyword: "dentist mountain view",
    secondaryKeywords: [
      "family dentist near mountain view",
    ],
  },
  "/dentist-los-altos": {
    title: "Los Altos Family Dentist | Christopher B. Wong, DDS",
    description:
      "Los Altos patients choose our Palo Alto dentist for preventive care, cosmetic improvements, restorations, Invisalign, and urgent visits.",
    canonicalPath: "/dentist-los-altos",
    ogImage: "/images/og/atrium-courtyard.jpg",
    indexable: false,
  },
  "/dentist-los-altos-hills": {
    title: "Los Altos Hills Dentist | Christopher B. Wong, DDS",
    description:
      "Los Altos Hills patients visit our Palo Alto office for preventive care, cosmetic dentistry, restorative treatment, Invisalign, and emergency visits.",
    canonicalPath: "/dentist-los-altos-hills",
    ogImage: "/images/og/garden-courtyard.jpg",
    indexable: false,
  },
  "/dentist-sunnyvale": {
    title: "Sunnyvale Family Dentist | Christopher B. Wong, DDS",
    description:
      "Sunnyvale families choose our Palo Alto dentist for cleanings, fillings, Invisalign, cosmetic dentistry, and same-day emergency care.",
    canonicalPath: "/dentist-sunnyvale",
    ogImage: "/images/og/atrium-courtyard.jpg",
    indexable: false,
  },
  "/dentist-cupertino": {
    title: "Cupertino Family Dentist | Christopher B. Wong, DDS",
    description:
      "Cupertino families visit our Palo Alto office for cleanings, fillings, Invisalign, cosmetic dentistry, and emergency care.",
    canonicalPath: "/dentist-cupertino",
    ogImage: "/images/og/office-entrance.jpg",
    indexable: false,
  },
  "/dentist-redwood-city": {
    title: "Redwood City Dentist | Christopher B. Wong, DDS",
    description:
      "Redwood City patients choose our Palo Alto dentist for preventive care, restorative treatment, Invisalign, and urgent visits.",
    canonicalPath: "/dentist-redwood-city",
    ogImage: "/images/og/exterior-hallway.jpg",
    indexable: false,
  },
  "/dentist-atherton": {
    title: "Atherton Dentist | Palo Alto | Christopher B. Wong, DDS",
    description:
      "Atherton patients visit our Palo Alto office for preventive care, restorative treatment, Invisalign, cosmetic dentistry, and emergency visits.",
    canonicalPath: "/dentist-atherton",
    ogImage: "/images/og/atrium-courtyard.jpg",
    indexable: false,
  },
  "/dentist-redwood-shores": {
    title: "Redwood Shores Dentist | Christopher B. Wong, DDS",
    description:
      "Redwood Shores patients choose our Palo Alto dentist for cleanings, fillings, Invisalign, cosmetic dentistry, and urgent visits.",
    canonicalPath: "/dentist-redwood-shores",
    ogImage: "/images/og/exterior-entry.jpg",
    indexable: false,
  },
  "/locations": {
    title: "Areas We Serve Near Palo Alto | Christopher B. Wong, DDS",
    description:
      "Patients visit our Cambridge Ave office from Menlo Park, Stanford, Mountain View, Los Altos, Atherton and more. Directions, parking and Caltrain tips.",
    canonicalPath: "/locations",
    ogImage: "/images/og/atrium-courtyard.jpg",
  },
  "/dental-implants": {
    title: "Dental Implants in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Replace missing teeth with dental implants in Palo Alto. Dr. Wong plans and restores your implant in-office, with trusted surgical partners for placement.",
    canonicalPath: "/dental-implants",
    ogImage: "/images/og/practice-og.jpg",
    primaryKeyword: "dental implants palo alto",
    secondaryKeywords: [
      "implant crown palo alto",
      "missing tooth replacement",
      "implant cost palo alto",
      "implants vs bridge",
    ],
  },
  "/dental-veneers": {
    title: "Porcelain Veneers in Palo Alto | Christopher B. Wong, DDS",
    description:
      "Porcelain and composite veneers in Palo Alto, planned conservatively to keep healthy enamel. See options, steps, care and cost factors before you decide.",
    canonicalPath: "/dental-veneers",
    ogImage: "/images/og/practice-og.jpg",
    primaryKeyword: "veneers palo alto",
    secondaryKeywords: [
      "porcelain veneers palo alto",
      "veneers cost palo alto",
      "cosmetic dentist palo alto",
    ],
  },
  "/accessibility": {
    title: "Accessibility Statement | Christopher B. Wong, DDS",
    description:
      "Learn about Dr. Wong's commitment to web accessibility and providing equal access to dental care for all patients, along with efforts to improve our site.",
    canonicalPath: "/accessibility",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/hipaa": {
    title: "HIPAA Notice | Christopher B. Wong, DDS",
    description:
      "Learn about HIPAA rights and how Dr. Wong's dental practice protects health information privacy with policies for security and patient confidentiality.",
    canonicalPath: "/hipaa",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/privacy-policy": {
    title: "Privacy Policy | Christopher B. Wong, DDS",
    description:
      "Learn how Dr. Wong's dental practice protects your personal information and maintains patient privacy in accordance with HIPAA regulations.",
    canonicalPath: "/privacy-policy",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/terms": {
    title: "Terms of Service | Christopher B. Wong, DDS",
    description:
      "Read the terms and conditions for using Dr. Wong's dental practice website and the guidelines for receiving dental services in our Palo Alto office.",
    canonicalPath: "/terms",
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/thank-you": {
    title: "Thank You | Request Received | Christopher B. Wong, DDS",
    description:
      "Thanks for contacting Dr. Wong's Palo Alto dental practice. We received your message and will follow up soon.",
    canonicalPath: "/thank-you",
    ogImage: DEFAULT_OG_IMAGE,
    robots: NOINDEX_ROBOTS,
  },
  "/analytics": {
    title: "Analytics Dashboard | Christopher B. Wong, DDS",
    description:
      "Secure analytics dashboard showing practice performance metrics, marketing ROI, and patient engagement data for Dr. Wong's dental practice.",
    canonicalPath: "/analytics",
    ogImage: DEFAULT_OG_IMAGE,
    robots: NOINDEX_ROBOTS,
  },
  "/ga-test": {
    title: "Google Analytics Test Page",
    description: "Internal testing page for Google Analytics events.",
    canonicalPath: "/ga-test",
    ogImage: DEFAULT_OG_IMAGE,
    robots: NOINDEX_ROBOTS,
  },
};

const PRIORITY_OVERRIDES: Record<string, number> = {
  "/": 1.0,
  "/services": 0.9,
  "/schedule": 0.9,
  "/blog": 0.8,
  "/about": 0.8,
  "/invisalign": 0.9,
  "/dental-veneers": 0.9,
  "/dental-implants": 0.9,
  "/emergency-dental": 1.0,
  "/locations": 0.8,
  "/dentist-menlo-park": 0.8,
  "/dentist-stanford": 0.8,
  "/dentist-mountain-view": 0.8,
};

const CHANGEFREQ_OVERRIDES: Partial<
  Record<string, SitemapEntry["changefreq"]>
> = {
  "/": "weekly",
  "/services": "weekly",
  "/schedule": "weekly",
  "/blog": "weekly",
};

// Keep these honest: update when the page's rendered content actually
// changes (scripts/seo-freshness-audit.ts fails the SEO gate when these
// drift past the per-cluster staleness threshold).
//
// 2026-10-16: the "Rooted" redesign replaced the shared chrome (header,
// footer, type, tokens) and rebuilt every page body, so every indexable route
// was materially re-rendered that day. Redirected and noindex routes carry no
// lastmod — they never appear in a sitemap.
const REDESIGN_LAUNCH_DATE = "2026-10-16";
const LASTMOD_OVERRIDES: Partial<Record<string, string>> = {
  "/": REDESIGN_LAUNCH_DATE,
  "/about": REDESIGN_LAUNCH_DATE,
  "/services": REDESIGN_LAUNCH_DATE,
  "/preventive-dentistry": REDESIGN_LAUNCH_DATE,
  "/restorative-dentistry": REDESIGN_LAUNCH_DATE,
  "/pediatric-dentistry": REDESIGN_LAUNCH_DATE,
  "/patient-resources": "2026-10-20",
  "/insurance": REDESIGN_LAUNCH_DATE,
  "/testimonials": "2026-10-23",
  "/patient-stories": REDESIGN_LAUNCH_DATE,
  "/blog": REDESIGN_LAUNCH_DATE,
  "/gallery": REDESIGN_LAUNCH_DATE,
  "/office-tour": REDESIGN_LAUNCH_DATE,
  "/contact": REDESIGN_LAUNCH_DATE,
  "/schedule": REDESIGN_LAUNCH_DATE,
  "/invisalign": REDESIGN_LAUNCH_DATE,
  "/emergency-dental": REDESIGN_LAUNCH_DATE,
  "/teeth-whitening-palo-alto": REDESIGN_LAUNCH_DATE,
  "/dental-cleaning-palo-alto": REDESIGN_LAUNCH_DATE,
  "/cavity-fillings-palo-alto": REDESIGN_LAUNCH_DATE,
  "/crowns-palo-alto": REDESIGN_LAUNCH_DATE,
  "/dentist-menlo-park": REDESIGN_LAUNCH_DATE,
  "/dentist-stanford": REDESIGN_LAUNCH_DATE,
  "/dentist-mountain-view": REDESIGN_LAUNCH_DATE,
  "/locations": REDESIGN_LAUNCH_DATE,
  "/dental-implants": REDESIGN_LAUNCH_DATE,
  "/dental-veneers": REDESIGN_LAUNCH_DATE,
  "/accessibility": REDESIGN_LAUNCH_DATE,
  "/hipaa": REDESIGN_LAUNCH_DATE,
  "/privacy-policy": REDESIGN_LAUNCH_DATE,
  "/terms": REDESIGN_LAUNCH_DATE,
};

function resolveIndexable(entry: SeoDefinitionInput): boolean {
  if (entry.indexable !== undefined) return entry.indexable;
  const robotsDirective = (entry.robots ?? DEFAULT_ROBOTS).toLowerCase();
  return !robotsDirective.includes("noindex");
}

function normalizeMetaText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function trimToWordBoundary(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const truncated = value.slice(0, Math.max(limit - 1, 0)).trimEnd();
  const lastSpace = truncated.lastIndexOf(" ");
  const trimmed =
    lastSpace >= Math.floor(limit * 0.6) ? truncated.slice(0, lastSpace) : truncated;
  return `${trimmed.trimEnd()}…`;
}

function resolveSeoCluster(pathname: string): NonNullable<SeoDefinition["seoCluster"]> {
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return "blog";
  if (
    pathname === "/about" ||
    pathname === "/testimonials" ||
    pathname === "/patient-stories" ||
    pathname === "/patient-resources" ||
    pathname === "/contact" ||
    pathname === "/schedule"
  ) {
    return "trust";
  }
  if (
    pathname === "/privacy-policy" ||
    pathname === "/terms" ||
    pathname === "/hipaa" ||
    pathname === "/accessibility"
  ) {
    return "legal";
  }
  if (pathname === "/locations" || pathname.startsWith("/dentist-")) {
    return "location";
  }
  return "service";
}

function inferPrimaryKeyword(
  pathname: string,
  title: string,
  cluster: NonNullable<SeoDefinition["seoCluster"]>,
): string {
  if (pathname === "/") return "palo alto dentist";
  if (pathname.startsWith("/dentist-")) {
    return pathname
      .replace("/dentist-", "dentist ")
      .replace(/-/g, " ")
      .trim()
      .toLowerCase();
  }
  if (pathname.startsWith("/blog/")) {
    return title.split("|")[0]?.trim().toLowerCase() || "dental blog";
  }
  if (cluster === "service") {
    return pathname.replace(/^\//, "").replace(/-/g, " ").trim().toLowerCase();
  }
  if (cluster === "location") return "palo alto family dentist";
  if (cluster === "legal") return "dental privacy policy";
  return title.split("|")[0]?.trim().toLowerCase() || "palo alto dental care";
}

function inferSecondaryKeywords(
  cluster: NonNullable<SeoDefinition["seoCluster"]>,
): string[] {
  if (cluster === "service") {
    return ["cosmetic dentistry palo alto", "family dental care palo alto"];
  }
  if (cluster === "location") {
    return ["nearby dentist palo alto", "dental office near me palo alto"];
  }
  if (cluster === "blog") {
    return ["dental health tips", "oral health education"];
  }
  if (cluster === "legal") {
    return ["hipaa dental office", "privacy statement"];
  }
  return ["trusted palo alto dentist", "new patient dentist palo alto"];
}

function enforceTitleLength(
  title: string,
  _minLen: number,
  maxLen: number,
  _cluster: NonNullable<SeoDefinition["seoCluster"]>,
): string {
  let resolved = normalizeMetaText(title);
  if (resolved.length > maxLen) {
    resolved = trimToWordBoundary(resolved, maxLen);
  }
  return resolved;
}

function enforceDescriptionLength(
  description: string,
  minLen: number,
  maxLen: number,
): string {
  let resolved = normalizeMetaText(description);
  if (resolved.length < minLen) {
    const base = resolved.endsWith(".") ? resolved : `${resolved}.`;
    resolved = `${base}${DESCRIPTION_EXTENSION}`;
  }
  if (resolved.length > maxLen) {
    resolved = trimToWordBoundary(resolved, maxLen);
  }
  if (resolved.length < minLen) {
    const expanded = `${resolved} New patients welcome.`;
    resolved = trimToWordBoundary(expanded, maxLen);
  }
  return resolved;
}

function resolveSchemaType(pathname: string): SeoDefinition["schemaType"] {
  if (pathname.startsWith("/blog/")) return "Article";
  // Location and contact pages describe the one practice; they must not be
  // labelled (or marked up) as separate LocalBusiness entities.
  if (
    pathname.startsWith("/dentist-") ||
    pathname === "/locations" ||
    pathname === "/contact"
  ) {
    return "WebPage";
  }
  if (
    pathname === "/services" ||
    pathname.includes("dentistry") ||
    pathname.includes("whitening") ||
    pathname.includes("veneers") ||
    pathname.includes("implants") ||
    pathname.includes("invisalign") ||
    pathname.includes("emergency")
  ) {
    return "Service";
  }
  return "WebPage";
}

export const seoByPath: Record<string, SeoDefinition> = Object.fromEntries(
  Object.entries(seoByPathSource).map(([path, entry]) => {
    const canonicalPath = normalizePathname(entry.canonicalPath || path);
    const indexable = resolveIndexable(entry);
    const seoCluster = entry.seoCluster ?? resolveSeoCluster(canonicalPath);
    const titleMaxLen = entry.titleMaxLen ?? DEFAULT_TITLE_MAX_LEN;
    const descriptionMinLen =
      entry.descriptionMinLen ?? DEFAULT_DESCRIPTION_MIN_LEN;
    const descriptionMaxLen =
      entry.descriptionMaxLen ?? DEFAULT_DESCRIPTION_MAX_LEN;
    const title = indexable
      ? enforceTitleLength(
          entry.title,
          DEFAULT_TITLE_MIN_LEN,
          titleMaxLen,
          seoCluster,
        )
      : normalizeMetaText(entry.title);
    const description = indexable
      ? enforceDescriptionLength(
          entry.description,
          descriptionMinLen,
          descriptionMaxLen,
        )
      : trimToWordBoundary(normalizeMetaText(entry.description), descriptionMaxLen);

    return [
      path,
      {
        ...entry,
        title,
        description,
        canonicalPath,
        robots: entry.robots ?? (indexable ? DEFAULT_ROBOTS : NOINDEX_ROBOTS),
        indexable,
        priority:
          entry.priority ??
          PRIORITY_OVERRIDES[path] ??
          CLUSTER_PRIORITY_DEFAULTS[seoCluster] ??
          DEFAULT_PRIORITY,
        changefreq:
          entry.changefreq ??
          CHANGEFREQ_OVERRIDES[path] ??
          CLUSTER_CHANGEFREQ_DEFAULTS[seoCluster] ??
          DEFAULT_CHANGEFREQ,
        lastmod: entry.lastmod ?? LASTMOD_OVERRIDES[path],
        schemaType: entry.schemaType ?? resolveSchemaType(canonicalPath),
        seoCluster,
        primaryKeyword:
          entry.primaryKeyword ??
          inferPrimaryKeyword(canonicalPath, title, seoCluster),
        secondaryKeywords:
          entry.secondaryKeywords ?? inferSecondaryKeywords(seoCluster),
        titleMaxLen,
        descriptionMinLen,
        descriptionMaxLen,
      },
    ];
  }),
) as Record<string, SeoDefinition>;

const DEFAULT_SEO: SeoDefinition = {
  title: seoByPath["/"].title,
  description: seoByPath["/"].description,
  canonicalPath: "/",
  ogImage: DEFAULT_OG_IMAGE,
  robots: DEFAULT_ROBOTS,
  indexable: true,
  priority: PRIORITY_OVERRIDES["/"] ?? DEFAULT_PRIORITY,
  changefreq: CHANGEFREQ_OVERRIDES["/"] ?? DEFAULT_CHANGEFREQ,
  schemaType: "WebPage",
  seoCluster: "service",
  primaryKeyword: "palo alto dentist",
  secondaryKeywords: ["family dentist palo alto", "cosmetic dentist palo alto"],
  titleMaxLen: DEFAULT_TITLE_MAX_LEN,
  descriptionMinLen: DEFAULT_DESCRIPTION_MIN_LEN,
  descriptionMaxLen: DEFAULT_DESCRIPTION_MAX_LEN,
};

export function getSeoForPath(pathname: string): SeoDefinition {
  const normalized = normalizePathname(pathname);
  const entry = seoByPath[normalized];
  if (entry) {
    return entry;
  }

  return {
    ...DEFAULT_SEO,
    canonicalPath: normalized,
    schemaType: resolveSchemaType(normalized),
    seoCluster: resolveSeoCluster(normalized),
    primaryKeyword: inferPrimaryKeyword(
      normalized,
      DEFAULT_SEO.title,
      resolveSeoCluster(normalized),
    ),
  };
}

export function getIndexablePaths(): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];

  Object.values(seoByPath).forEach((entry) => {
    if (!entry.indexable) return;
    if (seen.has(entry.canonicalPath)) return;
    seen.add(entry.canonicalPath);
    paths.push(entry.canonicalPath);
  });

  return paths;
}

export function getSitemapEntries(): SitemapEntry[] {
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  Object.values(seoByPath).forEach((entry) => {
    if (!entry.indexable) return;
    if (seen.has(entry.canonicalPath)) return;
    seen.add(entry.canonicalPath);
    entries.push({
      canonicalPath: entry.canonicalPath,
      priority: entry.priority,
      changefreq: entry.changefreq,
      lastmod: entry.lastmod,
    });
  });

  return entries;
}

export function buildExcerpt(text: string, limit = 160): string {
  const normalized = stripMarkdownToPlainText(text);
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(limit - 1, 0))}…`;
}
