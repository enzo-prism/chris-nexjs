import {
  Heart,
  MessageCircle,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";

import { FeatureIcon, type FeatureIconTone } from "@/components/common/FeatureIcon";

type PracticeDifference = {
  readonly icon: LucideIcon;
  readonly tone: FeatureIconTone;
  readonly title: string;
  readonly description: string;
};

const practiceDifferences: readonly PracticeDifference[] = [
  {
    icon: Search,
    tone: "primary",
    title: "Prevention Before Intervention",
    description:
      "Early detection and conservative planning help preserve healthy tooth structure whenever possible.",
  },
  {
    icon: MessageCircle,
    tone: "amber",
    title: "Clear Recommendations",
    description:
      "You will understand what Dr. Wong sees, why it matters, and which options make sense before moving forward.",
  },
  {
    icon: Heart,
    tone: "rose",
    title: "Comfort at Every Step",
    description:
      "Visits are designed around a calm pace, thoughtful communication, and your questions—not a rushed checklist.",
  },
  {
    icon: Users,
    tone: "emerald",
    title: "One Practice for the Family",
    description:
      "Children, teens, and adults can build healthy routines with a local team that gets to know them over time.",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      aria-labelledby="practice-differences-title"
      className="bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Why Patients Choose Dr. Wong
            </p>
            <h2
              id="practice-differences-title"
              className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl"
            >
              A Clearer, More Considered Experience
            </h2>
          </div>
          <p className="max-w-2xl text-pretty text-base leading-7 text-slate-600 md:text-lg lg:justify-self-end">
            Good dental care is not only about the procedure. It is also about
            knowing what to expect, feeling heard, and leaving with a plan you
            understand.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {practiceDifferences.map((feature, index) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 md:p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <FeatureIcon icon={feature.icon} tone={feature.tone} size="lg" />
                <span className="font-heading text-sm font-semibold tabular-nums text-slate-300" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold leading-snug text-slate-950">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base md:leading-7">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
