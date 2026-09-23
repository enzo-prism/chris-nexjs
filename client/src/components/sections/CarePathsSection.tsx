import Link from "next/link";
import {
  AlignHorizontalSpaceAround,
  ArrowRight,
  Baby,
  HeartPulse,
  ShieldCheck,
  Siren,
  Smile,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { FeatureIcon, type FeatureIconTone } from "@/components/common/FeatureIcon";

type CarePath = {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly tone: FeatureIconTone;
};

// Plain-language entry points into the existing service pages, ordered by
// what brings most patients in. Every href is an indexable route.
const carePaths: readonly CarePath[] = [
  {
    href: "/preventive-dentistry",
    title: "Checkups & cleanings",
    description: "Exams and cleanings for kids and adults",
    icon: ShieldCheck,
    tone: "primary",
  },
  {
    href: "/emergency-dental",
    title: "Tooth pain or emergency",
    description: "Broken tooth, swelling, or sudden pain",
    icon: Siren,
    tone: "rose",
  },
  {
    href: "/invisalign",
    title: "Invisalign clear aligners",
    description: "Straighten teeth without braces",
    icon: AlignHorizontalSpaceAround,
    tone: "primary",
  },
  {
    href: "/restorative-dentistry",
    title: "Fillings & crowns",
    description: "Repair cavities, cracks, and worn teeth",
    icon: Wrench,
    tone: "emerald",
  },
  {
    href: "/dental-implants",
    title: "Replacing a missing tooth",
    description: "Implant restoration and your options",
    icon: HeartPulse,
    tone: "emerald",
  },
  {
    href: "/zoom-whitening",
    title: "Teeth whitening",
    description: "In-office ZOOM! whitening",
    icon: Sparkles,
    tone: "amber",
  },
  {
    href: "/dental-veneers",
    title: "Veneers & cosmetic care",
    description: "Improve chipped or uneven teeth",
    icon: Smile,
    tone: "amber",
  },
  {
    href: "/pediatric-dentistry",
    title: "Children’s dentistry",
    description: "Gentle first visits and checkups",
    icon: Baby,
    tone: "primary",
  },
];

const CarePathsSection = () => {
  return (
    <section
      id="services"
      aria-labelledby="home-services-title"
      className="bg-white py-14 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2
              id="home-services-title"
              className="text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
            >
              What brings you in?
            </h2>
            <p className="mt-3 text-pretty text-base leading-7 text-slate-600 md:text-lg">
              Start with your reason for visiting. Each page explains what to
              expect and how to request a visit.
            </p>
          </div>
          <Link
            href="/services"
            className="ui-link-premium inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold"
          >
            All dental services
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 md:mt-10">
          {carePaths.map((path) => (
            <li key={path.href}>
              <Link
                href={path.href}
                className="ui-focus-premium group flex h-full min-h-[4.5rem] flex-col items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 transition-[border-color,box-shadow,background-color] hover:border-primary/35 hover:bg-sky-50/40 hover:shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center sm:gap-4 sm:px-4"
              >
                <FeatureIcon icon={path.icon} tone={path.tone} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-5 text-slate-950 group-hover:text-primary sm:text-base sm:leading-6">
                    {path.title}
                  </span>
                  <span className="mt-0.5 hidden text-sm leading-5 text-slate-600 sm:block">
                    {path.description}
                  </span>
                </span>
                <ArrowRight
                  className="hidden h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transform-none sm:block"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CarePathsSection;
