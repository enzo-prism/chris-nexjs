import Link from "next/link";
import { ArrowRight, Check, CreditCard, PiggyBank, ShieldCheck } from "lucide-react";

import { insuranceProviders } from "@/lib/data";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";

type InsuranceInfoSectionProps = {
  readonly id?: string;
  readonly className?: string;
  readonly title?: React.ReactNode;
  readonly subtitle?: string;
};

// Payment copy must match AGENTS.md: Visa, MasterCard, FSA/HSA, and the
// in-house dental plan; PPO plans are out-of-network. Keep in lockstep with
// pages/Insurance.tsx and the payment FAQ in lib/data.ts.
const notes = [
  {
    icon: ShieldCheck,
    title: "PPO plans, out-of-network",
    body: "Many PPO plans still pay a share of your care here. We check your benefits before treatment.",
  },
  {
    icon: PiggyBank,
    title: "No insurance?",
    body: "Ask about our in-house dental plan, with savings on preventive care and treatment.",
  },
  {
    icon: CreditCard,
    title: "Ways to pay",
    body: "Visa, MasterCard, and FSA/HSA funds.",
  },
] as const;

/** Compact insurance + payment summary with the PPO plans we help verify. */
export default function InsuranceInfoSection({
  id = "insurance-info",
  className,
  title = (
    <>
      Insurance, <em>explained simply</em>
    </>
  ),
  subtitle = "You’ll hear what your plan is expected to pay, and what your portion would be, before treatment begins.",
}: InsuranceInfoSectionProps): React.JSX.Element {
  return (
    <Section id={id} tone="paper" labelledBy={`${id}-title`} className={className}>
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading id={`${id}-title`} eyebrow="Insurance & payment" title={title} lead={subtitle} />
          <ul className="mt-8 grid gap-3">
            {notes.map((note) => {
              const Icon = note.icon;
              return (
                <li key={note.title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] leading-6 text-ink-soft">
                    <strong className="block font-semibold text-ink">{note.title}</strong>
                    {note.body}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card self-start p-6 sm:p-8">
          <h3 className="h-card">PPO plans we can help verify</h3>
          <p className="mt-2 text-[15px] leading-6 text-ink-muted">
            Patients often use these plans here. Don’t see yours? Ask us, since most PPO plans include out-of-network benefits.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {insuranceProviders.map((provider) => (
              <li key={provider} className="pill">
                <Check className="h-3.5 w-3.5 text-evergreen-600" aria-hidden="true" />
                {provider}
              </li>
            ))}
            <li className="pill border-dashed text-ink-muted">And more PPO plans</li>
          </ul>
          <Link href="/insurance" className="btn btn-outline mt-8 w-full sm:w-auto">
            How insurance and payment work
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
