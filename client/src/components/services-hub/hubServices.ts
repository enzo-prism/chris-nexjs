import type { ServiceIconName } from "@/components/ds/ServiceIcon";
import { serviceGroups } from "@/data/siteNav";
import type { ScheduleIntent } from "@shared/scheduleRequest";

/** One service card on the /services hub. */
export type HubService = {
  readonly href: string;
  /** Visible card heading (sentence case, matches the header menu). */
  readonly label: string;
  /** Formal service name used in accessible link names and schema. */
  readonly name: string;
  readonly icon: ServiceIconName;
  /** 1–2 plain-language sentences. */
  readonly summary: string;
  /** "Best for…" line. */
  readonly bestFor: string;
  /** Pre-selects the visit type on /schedule. */
  readonly intent: ScheduleIntent;
  /** DOM id; keeps legacy `/services#<slug>` anchors working. */
  readonly anchor: string;
  /** Urgent care leads with the phone. */
  readonly urgent?: boolean;
  /** Full-width card on large screens (overview and urgent cards). */
  readonly wide?: boolean;
};

export type HubGroup = {
  readonly id: string;
  readonly title: string;
  readonly blurb: string;
  readonly services: readonly HubService[];
};

type ServiceDetail = Omit<HubService, "href" | "label" | "icon">;

// Copy for each card, keyed by route. Labels, icons, order, and grouping come
// from siteNav.serviceGroups so the hub never drifts from the header menu.
const details: Readonly<Record<string, ServiceDetail>> = {
  "/dental-cleaning-palo-alto": {
    name: "Teeth Cleanings & Exams",
    summary:
      "Thorough, gentle hygiene visits that clear plaque and tartar, check your gums, and pair with an exam so small problems stay small.",
    bestFor: "Everyone, usually every six months, plus deep cleaning when gums need it.",
    intent: "preventive",
    anchor: "dental-cleaning-palo-alto",
  },
  "/preventive-dentistry": {
    name: "Preventive Dentistry",
    summary:
      "Exams, digital X-rays, oral cancer screening, sealants, fluoride, and custom guards, planned around your own cavity and gum risk.",
    bestFor: "Keeping healthy teeth healthy, or getting back on track after a long gap.",
    intent: "preventive",
    anchor: "preventive-dentistry",
  },
  "/pediatric-dentistry": {
    name: "Children’s Dentistry",
    summary:
      "Calm, age-appropriate visits for kids and teens: gentle cleanings, cavity checks, sealants and fluoride when they help, and sports guards.",
    bestFor: "Families who want one dental home for parents and kids.",
    intent: "pediatric",
    anchor: "pediatric-dentistry",
  },
  "/invisalign": {
    name: "Invisalign",
    summary:
      "Clear, removable aligners that gradually straighten crowded or gapped teeth for teens and adults, with check-ins along the way.",
    bestFor: "Mild to moderate crowding, spacing, or bite concerns.",
    intent: "invisalign",
    anchor: "invisalign",
  },
  "/teeth-whitening-palo-alto": {
    name: "Teeth Whitening",
    summary:
      "Dentist-supervised whitening: one-visit ZOOM! in-office whitening or custom take-home trays, planned to limit sensitivity.",
    bestFor: "Brightening natural teeth, ideally right after a cleaning.",
    intent: "whitening",
    anchor: "zoom-whitening",
  },
  "/dental-veneers": {
    name: "Dental Veneers",
    summary:
      "Thin porcelain or composite shells that reshape chipped, worn, or uneven front teeth, planned conservatively to keep healthy enamel.",
    bestFor: "Changing the shape, size, or shade of front teeth.",
    intent: "cosmetic",
    anchor: "cosmetic-dentistry",
  },
  "/cavity-fillings-palo-alto": {
    name: "Tooth-Colored Fillings",
    summary:
      "Composite fillings that remove only the decayed part of a tooth, bond to what’s left, and match the shade of your enamel.",
    bestFor: "Small to moderate cavities, or old fillings that have worn or chipped.",
    intent: "restorative",
    anchor: "cavity-fillings-palo-alto",
  },
  "/crowns-palo-alto": {
    name: "Dental Crowns",
    summary:
      "A custom cap that protects a cracked, broken, or heavily filled tooth, with the fit and bite checked carefully.",
    bestFor: "Teeth too weakened for a filling to protect.",
    intent: "restorative",
    anchor: "crowns-palo-alto",
  },
  "/dental-implants": {
    name: "Dental Implants",
    summary:
      "Replace a missing tooth with an implant crown. Dr. Wong plans and restores your implant here, with trusted surgical partners for placement.",
    bestFor: "A missing tooth, or one that can’t be saved.",
    intent: "implants",
    anchor: "dental-implants",
  },
  "/restorative-dentistry": {
    name: "Restorative Dentistry",
    summary:
      "How fillings, crowns, bridges, and implant restorations fit together, and how Dr. Wong keeps as much natural tooth as possible.",
    bestFor: "Comparing repair options, including bridges.",
    intent: "restorative",
    anchor: "restorative-dentistry",
    wide: true,
  },
  "/emergency-dental": {
    name: "Emergency Dental Care",
    summary:
      "Toothache, swelling, a broken tooth, or a lost crown. Call first: we reserve time for urgent visits and do our best to see you the same day.",
    bestFor: "Pain, swelling, or a cracked or knocked-out tooth.",
    intent: "emergency",
    anchor: "emergency-dental",
    urgent: true,
    wide: true,
  },
};

const groupMeta: Readonly<Record<string, { id: string; blurb: string }>> = {
  "Preventive & family": {
    id: "preventive-family",
    blurb: "Keep healthy teeth healthy, for every age in your household.",
  },
  Cosmetic: {
    id: "cosmetic",
    blurb: "Straighter, brighter, or reshaped teeth, planned conservatively.",
  },
  Restorative: {
    id: "restorative",
    blurb: "Repair damage and replace missing teeth while keeping as much natural tooth as possible.",
  },
  Urgent: {
    id: "urgent",
    blurb: "Pain, swelling, or a broken tooth? Call first. We hold time for urgent visits.",
  },
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const hubGroups: readonly HubGroup[] = serviceGroups.map((group) => {
  const meta = groupMeta[group.title] ?? { id: slugify(group.title), blurb: "" };
  return {
    id: meta.id,
    title: group.title,
    blurb: meta.blurb,
    services: group.items.flatMap((item): HubService[] => {
      const detail = details[item.href];
      if (!detail) return [];
      return [{ ...detail, href: item.href, label: item.label, icon: item.icon ?? "tooth" }];
    }),
  };
});

export const hubServices: readonly HubService[] = hubGroups.flatMap((g) => g.services);
