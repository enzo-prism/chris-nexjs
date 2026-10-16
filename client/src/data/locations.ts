import type { ServiceIconName } from "@/components/ds/ServiceIcon";
import type { ReviewTag } from "@/data/serviceReviews";
import type { FAQEntry } from "@/lib/structuredData";

/*
 * Content for the three neighboring-city pages (/dentist-menlo-park,
 * /dentist-stanford, /dentist-mountain-view), rendered by
 * components/locations/LocationPage.tsx.
 *
 * Doorway-page guardrails (Google spam policy; SEO strategy §4d):
 * - every city keeps its own copy, routes, audiences, FAQs and quotes;
 *   never copy a block from one city to another and swap the name;
 * - travel facts are only the ones the practice already published
 *   (Sand Hill Road / University Avenue from Menlo Park; a short drive or
 *   bike ride from Stanford; about 10 minutes from Mountain View on
 *   El Camino Real or Central Expressway). Parking specifics stay
 *   "we'll share them when you schedule" until the office supplies them.
 *
 * Copy strings may contain inline links as `[label](/path)` (rendered by
 * components/blog/InlineMarkdown) and headings may mark gold italic words
 * with `*word*`.
 */

export type LocationSlug = "menlo-park" | "stanford" | "mountain-view";

export type LocationVisit = {
  readonly href: string;
  readonly label: string;
  readonly description: string;
  readonly icon: ServiceIconName;
};

export type LocationAudience = {
  readonly title: string;
  /** Inline-markdown copy. */
  readonly body: string;
};

export type LocationRoute = {
  /** Where the trip starts, e.g. "Menlo Park". */
  readonly origin: string;
  /** Road or mode options, joined with "or" (each is one line on the card). */
  readonly ways: readonly string[];
  /** How the trip is described in the practice's own copy. */
  readonly summary: string;
  /** Travel mode per way (icon on the card; a bike way draws dotted). */
  readonly modes: readonly ("car" | "bike")[];
  /** Origin for the Google Maps directions link. */
  readonly mapsOrigin: string;
  /** Where the city lies relative to the office (north up), for the route art. */
  readonly direction: "nw" | "w" | "se";
};

export type LocationContent = {
  readonly slug: LocationSlug;
  readonly path: string;
  readonly city: string;
  /** Visible breadcrumb + BreadcrumbList name. */
  readonly crumb: string;
  readonly eyebrow: string;
  /** H1 text (SEO strategy §5b). */
  readonly h1: string;
  readonly lead: string;
  readonly chips: readonly string[];
  readonly heroImage: {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
    readonly position: string;
    readonly caption: string;
  };
  readonly route: LocationRoute;
  /** Paragraph under the route card ("Planning your visit from …"). */
  readonly planning: { readonly title: string; readonly body: string };
  readonly story: {
    readonly eyebrow: string;
    readonly title: string;
    readonly paragraphs: readonly string[];
  };
  readonly audiences?: {
    readonly title: string;
    readonly items: readonly LocationAudience[];
  };
  readonly visits: {
    readonly title: string;
    /** Inline-markdown lead. */
    readonly lead: string;
    readonly items: readonly LocationVisit[];
  };
  readonly reviews: {
    readonly tags: readonly ReviewTag[];
    readonly title: string;
    readonly note?: string;
  };
  readonly faqTitle: string;
  readonly faqs: readonly FAQEntry[];
  /** Short card copy for the /locations hub. */
  readonly hub: { readonly blurb: string; readonly routeLine: string };
};

export const menloPark: LocationContent = {
  slug: "menlo-park",
  path: "/dentist-menlo-park",
  city: "Menlo Park",
  crumb: "Menlo Park",
  eyebrow: "Near Menlo Park",
  h1: "A dentist near Menlo Park, on Cambridge Ave in Palo Alto",
  lead:
    "Our office is a short drive from Menlo Park, with easy access from Sand Hill Road and University Avenue. Dr. Christopher B. Wong provides modern, conservative care for children, teens, adults, and seniors, with clear communication and a calm environment.",
  chips: ["Kids through seniors", "Family visits coordinated"],
  heroImage: {
    src: "/images/redesign/team-group-reception.webp",
    alt: "Dr. Christopher B. Wong and the dental team standing together in the office reception area",
    width: 1600,
    height: 1066,
    position: "52% 45%",
    caption: "The team your family will see",
  },
  route: {
    origin: "Menlo Park",
    ways: ["Sand Hill Road", "University Avenue"],
    summary: "A short drive into Palo Alto",
    modes: ["car"],
    mapsOrigin: "Menlo Park, CA",
    direction: "nw",
  },
  planning: {
    title: "Scheduling for busy families",
    body:
      "Many families choose us for consistent, long-term care even when their home address is in Menlo Park. If you’d like to coordinate visits for parents and kids, call our team and we’ll help build a plan that fits school and work schedules, with fewer trips. We’ll also share parking tips and arrival guidance so your visit feels predictable.",
  },
  story: {
    eyebrow: "Family dentistry",
    title: "Family dentistry for *Menlo Park families*",
    paragraphs: [
      "“Family dentist” should mean more than a convenient location. It should feel easy to keep everyone’s care on track, from first cleanings to adult restorative work. We take time to explain what we see, make sure kids feel comfortable, and recommend treatment that supports long-term oral health.",
      "If your child needs a gentle start, our [children’s dental care](/pediatric-dentistry) focuses on prevention, confidence, and age-appropriate coaching. For adults, our goal is conservative care that protects healthy tooth structure and keeps future treatment simpler.",
    ],
  },
  audiences: {
    title: "Care for *every age*",
    items: [
      {
        title: "Kids",
        body: "Gentle visits focused on prevention, cavity risk reduction, and building comfort early. Explore [children’s dentistry](/pediatric-dentistry) for Menlo Park families.",
      },
      {
        title: "Teens",
        body: "Checkups, sports mouthguard planning, and guidance on habits that affect enamel. For alignment goals, many teens choose [Invisalign](/invisalign) because it’s discreet and removable.",
      },
      {
        title: "Adults",
        body: "Prevention, fillings, crowns, and cosmetic improvements with clear recommendations. Start with [preventive dentistry](/preventive-dentistry) and regular [cleanings](/dental-cleaning-palo-alto).",
      },
      {
        title: "Seniors",
        body: "Support for older restorations, bite wear, and long-term maintenance. If a tooth breaks or starts hurting, our [emergency dental care](/emergency-dental) team can often help the same day.",
      },
    ],
  },
  visits: {
    title: "Common visits for *Menlo Park families*",
    lead:
      "We’re known for thorough, comfortable preventive visits, and for making the next steps easy when something needs attention. Invisalign is popular with Menlo Park patients because it fits work and school schedules, and for cosmetic goals we also offer [whitening](/teeth-whitening-palo-alto) and [veneers](/dental-veneers) when appropriate.",
    items: [
      {
        href: "/pediatric-dentistry",
        label: "Children’s dentistry",
        description: "Gentle kids’ dentistry in a calm, family-friendly environment.",
        icon: "kids",
      },
      {
        href: "/dental-cleaning-palo-alto",
        label: "Cleanings and exams",
        description: "Preventive visits that help avoid surprises.",
        icon: "brush",
      },
      {
        href: "/cavity-fillings-palo-alto",
        label: "Tooth-colored fillings",
        description: "Conservative repairs for cavities.",
        icon: "filling",
      },
      {
        href: "/crowns-palo-alto",
        label: "Dental crowns",
        description: "Added protection when a tooth needs it.",
        icon: "crown",
      },
      {
        href: "/invisalign",
        label: "Invisalign",
        description: "Clear aligners for teens and adults.",
        icon: "aligner",
      },
      {
        href: "/emergency-dental",
        label: "Urgent visits",
        description: "Help for toothaches, broken teeth, and trauma, often the same day.",
        icon: "emergency",
      },
    ],
  },
  reviews: {
    tags: ["family"],
    title: "Families who keep *coming back*",
  },
  faqTitle: "Menlo Park family dentist FAQs",
  faqs: [
    {
      question: "Do you accept patients from Menlo Park?",
      answer:
        "Yes. Many of our patients live or work in Menlo Park and appreciate how close our Palo Alto office is for routine and urgent care.",
    },
    {
      question: "Do you see kids, teens, and adults?",
      answer:
        "Yes. We’re a family practice and care for children, teens, adults, and seniors. We focus on prevention first and explain options clearly so families can make confident decisions.",
    },
    {
      question: "Can family members schedule appointments together?",
      answer:
        "Often, yes. If you’d like to coordinate visits for multiple family members, call our team and we’ll do our best to find times that fit your schedule.",
    },
    {
      question: "What care is most common for Menlo Park families?",
      answer:
        "Preventive checkups and cleanings, cavity fillings, crowns, Invisalign, and cosmetic dentistry are common reasons Menlo Park families see us. We also help with urgent toothaches and broken teeth when needed.",
    },
    {
      question: "Is parking easy at your office?",
      answer:
        "Yes. Our Palo Alto location has nearby street and lot parking, and we’ll share the best options when you schedule.",
    },
    {
      question: "How far are you from Menlo Park?",
      answer:
        "Our office is in Palo Alto, a short drive from Menlo Park with easy access from Sand Hill Road and University Avenue. Once you schedule, we’ll share the easiest arrival tips and directions.",
    },
  ],
  hub: {
    blurb: "Family dentistry near Menlo Park, with visits for parents and kids coordinated to save trips.",
    routeLine: "Sand Hill Road or University Avenue",
  },
};

export const stanford: LocationContent = {
  slug: "stanford",
  path: "/dentist-stanford",
  city: "Stanford",
  crumb: "Stanford",
  eyebrow: "Near Stanford",
  // §5b's "minutes from campus" needs a verified drive time; the published
  // copy only says "a short drive or bike ride", so the fallback H1 is used.
  h1: "A dentist near Stanford University",
  lead:
    "Stanford students, faculty, staff, and families often want a dentist close to campus who can keep care simple, modern, and easy to schedule. Our Palo Alto office is a short drive or bike ride away, with conservative dentistry, clear explanations, and a calm experience.",
  chips: ["Students, faculty & staff", "Planned around quarters"],
  heroImage: {
    src: "/images/redesign/office-garden-courtyard-fountain.webp",
    alt: "Quiet garden courtyard with a stone fountain, seen through the office’s glass walls",
    width: 1024,
    height: 768,
    position: "50% 55%",
    caption: "The garden courtyard, between classes",
  },
  route: {
    origin: "Stanford campus",
    ways: ["A short drive", "Or an easy bike ride"],
    summary: "Realistic between classes, meetings, and hospital shifts",
    modes: ["car", "bike"],
    mapsOrigin: "Stanford University, Stanford, CA",
    direction: "w",
  },
  planning: {
    title: "Planning around classes, clinic shifts, or travel",
    body:
      "If you’re trying to fit care between classes, research deadlines, hospital shifts, or school breaks, our team can help build a sensible plan, starting with the most important treatment before finals, a busy rotation, or a trip. We’ll also share parking and arrival tips so your visit feels predictable from the start.",
  },
  story: {
    eyebrow: "Campus life",
    title: "Dental care for Stanford students, *faculty, and families*",
    paragraphs: [
      "Life at Stanford moves quickly, and dental care shouldn’t feel like one more complicated task. We help patients stay ahead of problems with efficient preventive visits, clear treatment planning, and practical follow-up that works with a full calendar.",
      "If you’re new to the area, juggling a heavy academic schedule, or coordinating care for your household, we’ll walk through what matters most first. Our goal is to make decisions feel straightforward and keep treatment aligned with your priorities.",
    ],
  },
  audiences: {
    title: "Care that fits *the Stanford schedule*",
    items: [
      {
        title: "Students",
        body: "Cleanings, exams, cavity checks, and bite-friendly planning that fit around classes, finals, and travel. Many students also choose [Invisalign](/invisalign) because it’s discreet and easy to manage.",
      },
      {
        title: "Faculty and staff",
        body: "Preventive care, restorative treatment, and long-term planning for busy professional schedules. We focus on clear recommendations and efficient visits that make sense between meetings and teaching.",
      },
      {
        title: "Residents and researchers",
        body: "When your time is limited, we help prioritize the most important care first. If a tooth starts hurting, our [emergency dental care](/emergency-dental) team can often help quickly.",
      },
      {
        title: "Families",
        body: "For Stanford families living nearby, we provide a calm, prevention-focused environment for every age. If your child needs a gentle start, explore [children’s dentistry](/pediatric-dentistry) in Palo Alto.",
      },
    ],
  },
  visits: {
    title: "Common visits for *Stanford patients*",
    lead:
      "We also see plenty of patients who want proactive care before a busy quarter or an upcoming trip. And if a filling breaks or pain starts suddenly, staying close to Stanford makes urgent dental care much more realistic.",
    items: [
      {
        href: "/dental-cleaning-palo-alto",
        label: "Cleanings and exams",
        description: "Preventive visits that help you avoid mid-quarter surprises.",
        icon: "brush",
      },
      {
        href: "/invisalign",
        label: "Invisalign",
        description: "Clear aligners for students, residents, and working professionals.",
        icon: "aligner",
      },
      {
        href: "/emergency-dental",
        label: "Urgent dental care",
        description: "Help for sudden pain, chips, and broken teeth, often the same day.",
        icon: "emergency",
      },
      {
        href: "/cavity-fillings-palo-alto",
        label: "Tooth-colored fillings",
        description: "Repairs with a conservative treatment philosophy.",
        icon: "filling",
      },
      {
        href: "/crowns-palo-alto",
        label: "Dental crowns",
        description: "Added protection when a tooth needs more support.",
        icon: "crown",
      },
    ],
  },
  reviews: {
    tags: ["emergency", "honest"],
    title: "Straight answers, *and help when it’s urgent*",
  },
  faqTitle: "Stanford dentist FAQs",
  faqs: [
    {
      question: "Do you see Stanford students and faculty?",
      answer:
        "Yes. We regularly care for Stanford students, faculty, staff, and families who want a nearby Palo Alto dental office with a practical, conservative approach.",
    },
    {
      question: "Can you help with dental emergencies?",
      answer:
        "Yes. If you have sudden pain, swelling, a chipped tooth, or a broken filling, call us as soon as you can and we will help you find the soonest urgent visit available.",
    },
    {
      question: "Do you offer Invisalign for Stanford patients?",
      answer:
        "Yes. Invisalign is a popular option for students and professionals who want discreet orthodontic treatment that fits around classes, research, and work.",
    },
    {
      question: "Is your office close to campus?",
      answer:
        "Yes. Our Palo Alto office is a short drive or bike ride from Stanford, making it realistic to fit visits between classes, meetings, and hospital shifts.",
    },
    {
      question: "Do you accept PPO dental insurance?",
      answer:
        "We work with many PPO plans as an out-of-network provider and can help verify benefits before treatment so there are fewer surprises.",
    },
    {
      question: "Can you help me plan care around quarters or travel?",
      answer:
        "Yes. If you are heading into finals, a busy rotation, or a school break, we can help prioritize the most important treatment and build a sensible schedule.",
    },
  ],
  hub: {
    blurb: "Care for students, faculty, staff, and families, planned around quarters, rotations, and travel.",
    routeLine: "A short drive or bike ride",
  },
};

export const mountainView: LocationContent = {
  slug: "mountain-view",
  path: "/dentist-mountain-view",
  city: "Mountain View",
  crumb: "Mountain View",
  eyebrow: "Near Mountain View",
  h1: "A dentist near Mountain View, in Palo Alto",
  lead:
    "Mountain View families and campus-area patients visit Dr. Christopher B. Wong for modern, conservative dental care in nearby Palo Alto, usually around 10 minutes north on El Camino Real or Central Expressway.",
  chips: ["About 10 minutes away", "Kids through seniors"],
  heroImage: {
    src: "/images/redesign/office-front-desk-atrium.webp",
    alt: "Front desk with wood-slat panels beside the glass garden atrium",
    width: 1280,
    height: 720,
    position: "45% 50%",
    caption: "Check-in, beside the garden atrium",
  },
  route: {
    origin: "Mountain View",
    ways: ["El Camino Real", "Central Expressway"],
    summary: "Usually around 10 minutes north",
    modes: ["car"],
    mapsOrigin: "Mountain View, CA",
    direction: "se",
  },
  planning: {
    title: "Planning your visit from Mountain View",
    body:
      "Our office sits in Palo Alto’s California Avenue district, a quick trip north from Mountain View. Many patients schedule checkups on the same day as work or school commitments on the Peninsula. We’ll share the easiest route and parking tips when you schedule, and if you’d like to coordinate appointments for several family members, call our team and we’ll help build a plan that fits your calendar.",
  },
  story: {
    eyebrow: "Family dentistry",
    title: "Family dentistry for *Mountain View patients*",
    paragraphs: [
      "Mountain View families often want a practice that feels calm, consistent, and easy to work with. We serve kids, teens, adults, and seniors, focusing on prevention, comfort, clear communication, and conservative care so you can keep your dental health on track without surprises.",
      "If your child needs a gentle start, our [children’s dental care](/pediatric-dentistry) emphasizes comfort and confidence. For adults, we prioritize early detection and treatment that protects healthy tooth structure, starting with [preventive dentistry](/preventive-dentistry) and regular [cleanings](/dental-cleaning-palo-alto).",
    ],
  },
  visits: {
    title: "Common visits for *Mountain View families*",
    lead:
      "Common visits include preventive cleanings, cavity fillings, Invisalign, and emergency dental care. We help you understand your options so you can choose the best next step for your smile, and for cosmetic goals we also offer [whitening](/teeth-whitening-palo-alto) and [veneers](/dental-veneers) when appropriate.",
    items: [
      {
        href: "/dental-cleaning-palo-alto",
        label: "Cleanings and exams",
        description: "Preventive visits that keep small issues from growing.",
        icon: "brush",
      },
      {
        href: "/cavity-fillings-palo-alto",
        label: "Tooth-colored fillings",
        description: "Conservative repairs for cavities and cracks.",
        icon: "filling",
      },
      {
        href: "/invisalign",
        label: "Invisalign",
        description: "A discreet orthodontic plan for teens and adults.",
        icon: "aligner",
      },
      {
        href: "/emergency-dental",
        label: "Emergency dental care",
        description: "Help for toothaches and dental trauma, with same-day visits when available.",
        icon: "emergency",
      },
      {
        href: "/pediatric-dentistry",
        label: "Children’s dentistry",
        description: "Gentle care for kids and teens in a calm environment.",
        icon: "kids",
      },
      {
        href: "/crowns-palo-alto",
        label: "Dental crowns",
        description: "Added protection for a cracked or heavily filled tooth.",
        icon: "crown",
      },
    ],
  },
  reviews: {
    tags: ["visit", "fillings"],
    title: "Easy to park, *easy in the chair*",
  },
  faqTitle: "Mountain View dentist FAQs",
  faqs: [
    {
      question: "Do you accept patients from Mountain View?",
      answer:
        "Yes. Many Mountain View patients visit our Palo Alto office for preventive care, restorative treatment, and cosmetic dentistry.",
    },
    {
      question: "How far is your office from Mountain View?",
      answer:
        "We are a short drive from Mountain View, usually around 10 minutes north on El Camino Real or Central Expressway. When you schedule, we share the easiest routes and arrival tips.",
    },
    {
      question: "Do you see kids, teens, and adults?",
      answer:
        "Yes. We provide family dentistry for every age and focus on prevention, comfort, and clear explanations.",
    },
    {
      question: "Do you offer Invisalign for Mountain View patients?",
      answer:
        "Yes. Invisalign is a popular option for Mountain View patients who want a discreet orthodontic plan.",
    },
    {
      question: "Can you help with dental emergencies?",
      answer:
        "Yes. If you have sudden pain, swelling, or a broken tooth, call us and we will help you find a same-day visit when available.",
    },
    {
      question: "Do you accept PPO dental insurance?",
      answer:
        "We work with many PPO plans as an out-of-network provider and will help verify benefits before treatment.",
    },
  ],
  hub: {
    blurb: "Cleanings, fillings, Invisalign, and urgent care for Mountain View families.",
    routeLine: "About 10 minutes via El Camino Real or Central Expressway",
  },
};

export const cityPages: readonly LocationContent[] = [menloPark, stanford, mountainView];

/**
 * Communities whose thin city pages were retired on 2026-07-15. Their old
 * URLs 301 to /locations (shared/redirects.ts); each keeps a short, honest
 * entry and a stable anchor on the hub.
 */
export const nearbyCommunities: readonly { readonly id: string; readonly name: string; readonly body: string }[] = [
  {
    id: "los-altos",
    name: "Los Altos",
    body: "Los Altos patients choose our nearby Palo Alto office for attentive care and long-term planning.",
  },
  {
    id: "los-altos-hills",
    name: "Los Altos Hills",
    body: "Conservative care for Los Altos Hills families: preventive exams, cosmetic options, and urgent visits when available.",
  },
  {
    id: "atherton",
    name: "Atherton",
    body: "Modern dentistry for Atherton families near Palo Alto, with prevention first and clear next steps.",
  },
  {
    id: "redwood-city",
    name: "Redwood City",
    body: "Conservative care for Redwood City patients: preventive cleanings, restorative care, and cosmetic dentistry.",
  },
  {
    id: "redwood-shores",
    name: "Redwood Shores",
    body: "Preventive and cosmetic care for Redwood Shores patients, with conservative plans and clear explanations.",
  },
  {
    id: "sunnyvale",
    name: "Sunnyvale",
    body: "Family-friendly dental care for Sunnyvale patients, from cleanings and fillings to Invisalign.",
  },
  {
    id: "cupertino",
    name: "Cupertino",
    body: "Comprehensive dental care for Cupertino families, tailored to your goals and schedule.",
  },
];
