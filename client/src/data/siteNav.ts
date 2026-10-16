import type { ServiceIconName } from "@/components/ds/ServiceIcon";

export type NavItem = {
  readonly href: string;
  readonly label: string;
  /** One-line plain-language description (menus, finder tiles). */
  readonly blurb?: string;
  readonly icon?: ServiceIconName;
};

export type NavGroup = {
  readonly title: string;
  readonly items: readonly NavItem[];
};

/**
 * Services, grouped by what a patient is trying to do. Every href is an
 * indexable route; this list drives the header mega menu, the mobile menu,
 * the footer, and the homepage care finder so they never drift apart.
 */
export const serviceGroups: readonly NavGroup[] = [
  {
    title: "Preventive & family",
    items: [
      {
        href: "/dental-cleaning-palo-alto",
        label: "Cleanings & exams",
        blurb: "Thorough, gentle hygiene visits",
        icon: "brush",
      },
      {
        href: "/preventive-dentistry",
        label: "Preventive care",
        blurb: "Screenings, sealants, fluoride",
        icon: "shield",
      },
      {
        href: "/pediatric-dentistry",
        label: "Children’s dentistry",
        blurb: "Calm visits for kids and teens",
        icon: "kids",
      },
    ],
  },
  {
    title: "Cosmetic",
    items: [
      {
        href: "/invisalign",
        label: "Invisalign",
        blurb: "Straighten teeth with clear aligners",
        icon: "aligner",
      },
      {
        href: "/teeth-whitening-palo-alto",
        label: "Teeth whitening",
        blurb: "ZOOM! in-office or take-home trays",
        icon: "whitening",
      },
      {
        href: "/dental-veneers",
        label: "Veneers",
        blurb: "Reshape chipped or worn teeth",
        icon: "veneer",
      },
    ],
  },
  {
    title: "Restorative",
    items: [
      {
        href: "/cavity-fillings-palo-alto",
        label: "Tooth-colored fillings",
        blurb: "Treat cavities early, blend in",
        icon: "filling",
      },
      {
        href: "/crowns-palo-alto",
        label: "Dental crowns",
        blurb: "Protect cracked or weak teeth",
        icon: "crown",
      },
      {
        href: "/dental-implants",
        label: "Dental implants",
        blurb: "Replace a missing tooth",
        icon: "implant",
      },
      {
        href: "/restorative-dentistry",
        label: "Restorative overview",
        blurb: "Fillings, crowns, bridges, implants",
        icon: "tooth",
      },
    ],
  },
  {
    title: "Urgent",
    items: [
      {
        href: "/emergency-dental",
        label: "Emergency dentist",
        blurb: "Pain, swelling, or a broken tooth",
        icon: "emergency",
      },
    ],
  },
];

export const allServices: readonly NavItem[] = serviceGroups.flatMap((g) => g.items);

export const aboutLinks: readonly NavItem[] = [
  { href: "/about", label: "Meet Dr. Wong", blurb: "His story, training, and approach" },
  { href: "/about#team", label: "Our team", blurb: "Hygienists, assistants, front desk" },
  { href: "/office-tour", label: "Office tour & film", blurb: "Watch “Full Circle” and step inside" },
  { href: "/gallery", label: "Photo & video gallery", blurb: "Real moments from the practice" },
];

export const patientLinks: readonly NavItem[] = [
  { href: "/patient-resources", label: "New patients & forms", blurb: "What to expect, paperwork", icon: "forms" },
  { href: "/insurance", label: "Insurance & costs", blurb: "PPO benefits, payment options", icon: "insurance" },
  { href: "/schedule", label: "Request an appointment", blurb: "About a minute online", icon: "calendar" },
  { href: "/locations", label: "Areas we serve", blurb: "Palo Alto and nearby" },
  { href: "/blog", label: "Dental health blog", blurb: "Plain-language answers" },
];

export const reviewLinks: readonly NavItem[] = [
  { href: "/testimonials", label: "Patient reviews", blurb: "Hundreds of five-star reviews" },
  { href: "/patient-stories", label: "Patient stories", blurb: "Letters and longer stories" },
];

/** Plain-language entry points for the homepage “What brings you in?” finder. */
export const careFinder: readonly (NavItem & { readonly icon: ServiceIconName })[] = [
  { href: "/dental-cleaning-palo-alto", label: "A cleaning & checkup", blurb: "Exams and cleanings for every age", icon: "brush" },
  { href: "/emergency-dental", label: "Tooth pain or a broken tooth", blurb: "Call us — urgent visits when available", icon: "emergency" },
  { href: "/invisalign", label: "Straighter teeth", blurb: "Invisalign clear aligners", icon: "aligner" },
  { href: "/teeth-whitening-palo-alto", label: "A brighter smile", blurb: "Professional whitening", icon: "whitening" },
  { href: "/dental-implants", label: "Replacing a missing tooth", blurb: "Implant restoration and your options", icon: "implant" },
  { href: "/crowns-palo-alto", label: "A cracked or worn tooth", blurb: "Crowns and fillings", icon: "crown" },
  { href: "/pediatric-dentistry", label: "Care for my kids", blurb: "Gentle visits for children & teens", icon: "kids" },
  { href: "/insurance", label: "Insurance & costs", blurb: "Know your portion before treatment", icon: "insurance" },
];
