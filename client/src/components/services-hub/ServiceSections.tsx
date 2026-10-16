import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CreditCard, MapPin, PiggyBank, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Section, type SectionTone } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";

/* Sections used by the /services hub. (Service pages use ServiceBlocks.tsx
   plus the shared helpers in components/services/.) Server-renderable. */

/* ------------------------------------------- Cost, insurance & payment */
const costCards = [
  {
    icon: ShieldCheck,
    title: "Have PPO insurance?",
    body: "We’re out-of-network, but most PPO plans still pay a share of your care here. Send us your plan and we’ll check your benefits and explain your portion before treatment.",
  },
  {
    icon: PiggyBank,
    title: "No dental insurance?",
    body: "Ask about our in-house dental plan, which offers savings on preventive care and treatment.",
  },
  {
    icon: CreditCard,
    title: "Ways to pay",
    body: "We accept Visa, MasterCard, and FSA/HSA funds.",
  },
] as const;

export function CostSection({
  id = "cost-and-insurance",
  title = (
    <>
      Know your cost <em>before</em> you commit
    </>
  ),
  lead,
  coverage,
  drivers,
  tone = "paper",
  analyticsContext = "service-cost",
}: {
  readonly id?: string;
  readonly title?: ReactNode;
  readonly lead: ReactNode;
  /** Typical PPO category for this treatment, in plain words. */
  readonly coverage?: ReactNode;
  /** What changes the price. */
  readonly drivers?: readonly string[];
  readonly tone?: SectionTone;
  readonly analyticsContext?: string;
}) {
  return (
    <Section id={id} tone={tone} labelledBy={`${id}-title`}>
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading id={`${id}-title`} eyebrow="Cost, insurance & payment" title={title} lead={lead} />
          {coverage || drivers?.length ? (
            <div className="mt-8 rounded-[1.5rem] border border-cream-300/80 bg-white/70 p-5 sm:p-6">
              {coverage ? <p className="text-[15px] leading-7 text-ink-soft">{coverage}</p> : null}
              {drivers?.length ? (
                <>
                  <h3 className={cn("text-sm font-bold uppercase tracking-[0.14em] text-ink-muted", coverage ? "mt-5" : null)}>
                    What affects the cost
                  </h3>
                  <ul className="mt-3 grid gap-2">
                    {drivers.map((d) => (
                      <li key={d} className="flex items-start gap-2.5 text-[15px] leading-6 text-ink-soft">
                        <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}
          <Link
            href="/insurance"
            className="btn btn-outline mt-8"
            data-analytics-context={`${analyticsContext}-insurance`}
          >
            How out-of-network coverage works
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ul className="reveal-stagger grid content-start gap-4">
          {costCards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.title} className="card flex items-start gap-5 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="h-card text-[1.3rem]">{card.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-7 text-ink-soft">{card.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* ---------------------------------------------- Guides + nearby line */
export type Guide = {
  readonly href: string;
  readonly title: string;
};

export function NearbyLine({ className }: { readonly className?: string }) {
  return (
    <p className={cn("flex items-start gap-3 text-[15px] leading-7 text-ink-soft", className)}>
      <MapPin className="mt-1 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
      <span>
        Patients visit our Cambridge Avenue office from{" "}
        <Link href="/dentist-menlo-park" className="link-rooted">
          Menlo Park
        </Link>
        ,{" "}
        <Link href="/dentist-stanford" className="link-rooted">
          Stanford
        </Link>
        ,{" "}
        <Link href="/dentist-mountain-view" className="link-rooted">
          Mountain View
        </Link>
        , and Los Altos.{" "}
        <Link href="/locations" className="link-rooted">
          See the areas we serve
        </Link>
        .
      </span>
    </p>
  );
}

export function KeepReading({
  guides = [],
  className,
}: {
  readonly guides?: readonly Guide[];
  readonly className?: string;
}) {
  return (
    <Section tone="white" spacing="none" className={cn("pb-16 sm:pb-20", className)} label="Guides and nearby areas">
      <div className={cn("grid gap-4", guides.length ? "lg:grid-cols-[1.2fr_0.8fr]" : null)}>
        {guides.length ? (
          <div className="rounded-[1.75rem] bg-cream-100 p-6 sm:p-7">
            <h2 className="flex items-center gap-2.5 font-heading text-xl font-medium text-ink">
              <BookOpen className="h-5 w-5 text-evergreen-600" aria-hidden="true" />
              Guides from our blog
            </h2>
            <ul className="mt-3 divide-y divide-cream-300/80">
              {guides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="group flex min-h-12 items-center justify-between gap-4 py-3 text-[15px] font-semibold leading-6 text-evergreen-800 hover:text-evergreen-950"
                  >
                    {g.title}
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-evergreen-500 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex items-center rounded-[1.75rem] border border-cream-300/80 p-6 sm:p-7">
          <NearbyLine />
        </div>
      </div>
    </Section>
  );
}
