import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleDollarSign, CreditCard, PiggyBank, ShieldCheck } from "lucide-react";

import { Section, type SectionTone } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";

type CostPanelProps = {
  readonly id?: string;
  readonly tone?: SectionTone;
  readonly title: ReactNode;
  readonly lead: ReactNode;
  readonly drivers: readonly string[];
  readonly driversTitle?: string;
  /** Service-specific sentence about how PPO plans usually treat this care. */
  readonly coverage?: string;
  /** Extra content under the cost drivers (checklists, disclosures). */
  readonly children?: ReactNode;
  readonly scheduleHref?: string;
  readonly analyticsContext: string;
};

/**
 * Cost, insurance & payment block shared by every service page. Payment copy
 * must match AGENTS.md exactly: PPO out-of-network, the in-house plan, and
 * Visa, MasterCard, FSA/HSA (no CareCredit).
 */
export function CostPanel({
  id = "cost",
  tone = "paper",
  title,
  lead,
  drivers,
  driversTitle = "What affects your cost",
  coverage,
  children,
  scheduleHref = "/schedule#appointment",
  analyticsContext,
}: CostPanelProps) {
  const cards = [
    {
      icon: ShieldCheck,
      title: "Have PPO insurance?",
      body: `We’re out-of-network, but most PPO plans still pay a share of your care here.${
        coverage ? ` ${coverage}` : ""
      } Send us your plan and we’ll check your benefits and explain your portion before treatment.`,
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

  return (
    <Section id={id} tone={tone} labelledBy={`${id}-title`}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionHeading id={`${id}-title`} eyebrow="Cost, insurance & payment" title={title} lead={lead} />
          <div className="card mt-6 p-5 sm:mt-8 sm:p-7">
            <h3 className="flex items-center gap-3 font-heading text-[1.25rem] font-medium text-ink">
              <CircleDollarSign className="h-5 w-5 text-evergreen-600" aria-hidden="true" />
              {driversTitle}
            </h3>
            <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
              {drivers.map((driver) => (
                <li key={driver} className="flex gap-3 text-[15px] leading-6 text-ink-soft sm:leading-7">
                  <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500 sm:mt-[0.7rem]" />
                  {driver}
                </li>
              ))}
            </ul>
          </div>
          {children}
        </div>
        <div className="grid content-start gap-4">
          <ul className="reveal-stagger grid divide-y divide-cream-300/70 overflow-hidden rounded-[1.75rem] border border-cream-300/70 bg-white shadow-soft sm:gap-4 sm:divide-y-0 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:shadow-none">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <li
                  key={card.title}
                  className="flex items-start gap-4 p-5 sm:gap-5 sm:rounded-[1.75rem] sm:border sm:border-cream-300/70 sm:bg-white sm:p-6 sm:shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="h-card text-[1.25rem]">{card.title}</h3>
                    <p className="mt-1 text-[15px] leading-6 text-ink-soft sm:mt-1.5 sm:leading-7">{card.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={scheduleHref}
              className="btn btn-primary"
              data-analytics-context={`${analyticsContext}-request`}
            >
              <CalendarDays aria-hidden="true" />
              Request a visit
            </Link>
            <Link href="/insurance" className="btn btn-outline" data-analytics-context={`${analyticsContext}-insurance`}>
              How out-of-network coverage works
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default CostPanel;
