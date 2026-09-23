import { ArrowRight, CreditCard, PiggyBank, ShieldCheck, type LucideIcon } from "lucide-react";

import ButtonLink from "@/components/common/ButtonLink";
import { FeatureIcon, type FeatureIconTone } from "@/components/common/FeatureIcon";

type CostOption = {
  readonly icon: LucideIcon;
  readonly tone: FeatureIconTone;
  readonly title: string;
  readonly body: string;
};

// Payment copy must match accepted methods exactly (see AGENTS.md): PPO
// out-of-network, Visa, MasterCard, FSA/HSA, and the in-house dental plan.
const costOptions: readonly CostOption[] = [
  {
    icon: ShieldCheck,
    tone: "primary",
    title: "Have PPO insurance?",
    body: "We’re out-of-network, but most PPO plans still pay a share of your care here. Send us your plan and we’ll check your benefits and explain your portion before treatment.",
  },
  {
    icon: PiggyBank,
    tone: "emerald",
    title: "No dental insurance?",
    body: "Ask about our in-house dental plan, which offers savings on preventive care and treatment.",
  },
  {
    icon: CreditCard,
    tone: "amber",
    title: "Ways to pay",
    body: "We accept Visa, MasterCard, and FSA/HSA funds.",
  },
];

const CostClaritySection = () => {
  return (
    <section
      id="insurance-and-cost"
      aria-labelledby="cost-clarity-title"
      className="bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Insurance &amp; cost
            </p>
            <h2
              id="cost-clarity-title"
              className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl"
            >
              Know your cost before you commit
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-slate-600 md:text-lg">
              &ldquo;Out-of-network&rdquo; sounds more alarming than it is.
              Most PPO plans still contribute, and you&apos;ll hear what your
              plan is expected to pay, and what you&apos;d pay, before
              treatment begins.
            </p>
            <ButtonLink
              href="/insurance"
              variant="outline"
              size="lg"
              className="mt-7 min-h-12 rounded-full px-7 text-base font-semibold"
            >
              How out-of-network coverage works
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          <ul className="grid gap-4">
            {costOptions.map((option) => (
              <li
                key={option.title}
                className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 md:p-6"
              >
                <FeatureIcon icon={option.icon} tone={option.tone} size="md" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{option.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 md:text-base md:leading-7">
                    {option.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CostClaritySection;
