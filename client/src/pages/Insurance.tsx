// Server component: no client state, so the page ships no page-level JS.
// Internal links use next/link (a wouter Link on this dedicated route changed
// the URL without swapping the page).
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, MessageSquare, Phone, PiggyBank, ShieldCheck, Wallet } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { PageHero } from "@/components/ds/PageHero";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { FaqList } from "@/components/ds/FaqList";
import { CtaBand } from "@/components/ds/CtaBand";
import { insuranceProviders, officeInfo } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

// AGENTS.md lockstep rule: accepted payment is Visa, MasterCard, FSA/HSA and
// the in-house dental plan; PPO plans are out-of-network. Keep this page,
// the payment FAQ in lib/data.ts (faqItems), and InsuranceInfoSection in sync.
const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Insurance & Payment Options", path: "/insurance" },
];

const faqs: FAQEntry[] = [
  {
    question: "Do you accept my dental insurance?",
    answer:
      "We work with most major PPO dental insurance plans as an out-of-network provider. Many PPO plans include out-of-network benefits, so patients often still receive meaningful coverage here. Contact our office with your plan details and we'll help you verify your specific coverage before your appointment.",
  },
  {
    question: "What does out-of-network actually mean for my costs?",
    answer:
      "Out-of-network means our office doesn't have a contracted rate with your insurer. Your PPO plan typically still pays a percentage of treatment costs based on its fee schedule, and you cover the difference. Before any treatment, our team walks you through what your plan is expected to pay and what your portion would be, so there are no surprises.",
  },
  {
    question: "Can you verify my benefits before my first visit?",
    answer:
      "Yes. Include only your insurance carrier in the online request. Our team will contact you through your preferred method for any additional plan details needed to verify benefits.",
  },
  {
    question: "What if I don't have dental insurance?",
    answer:
      "We offer an in-house dental plan with savings on preventive care and treatments for patients without insurance, and we accept Visa, MasterCard, and FSA/HSA funds. Call our office for current plan details.",
  },
  {
    question: "Do you offer payment plans or financing?",
    answer:
      "We accept Visa and MasterCard, along with flexible spending account (FSA) or health savings account (HSA) funds. Patients without insurance can also ask about our in-house dental plan. Our team can help you choose the option that fits your situation.",
  },
  {
    question: "Will you give me a cost estimate before treatment?",
    answer:
      "Yes. After your exam, we explain what we see and provide clear recommendations with expected costs, including what your insurance is likely to cover, before you commit to any treatment.",
  },
];

const benefitSteps: readonly {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly body: string;
}[] = [
  {
    icon: "forms",
    title: "Share your carrier",
    body: "Add just your insurance carrier’s name when you request a visit. We follow up for any other plan details we need.",
  },
  {
    icon: "insurance",
    title: "We check your benefits",
    body: "Our team verifies your out-of-network benefits and what your plan typically pays, before your appointment.",
  },
  {
    icon: "checkup",
    title: "You know your portion first",
    body: "After your exam you get clear next steps with expected costs, including what insurance is likely to cover, before anything is scheduled.",
  },
];

const paymentMethods = [
  {
    icon: ShieldCheck,
    title: "PPO insurance, out-of-network",
    body: "Most major PPO dental plans include out-of-network benefits. We verify your coverage and explain expected costs before treatment.",
  },
  {
    icon: CreditCard,
    title: "Visa & MasterCard",
    body: "For treatment and preventive visits.",
  },
  {
    icon: Wallet,
    title: "FSA & HSA funds",
    body: "Flexible spending and health savings accounts can be used for eligible dental care.",
  },
] as const;

const Insurance = () => {
  const structuredDataNodes: StructuredDataNode[] = [];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const faqSchema = buildFAQSchema(faqs, "/insurance");
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  if (faqSchema) structuredDataNodes.push(faqSchema);

  return (
    <>
      <StructuredData data={structuredDataNodes} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Insurance & payment"
        icon="insurance"
        title={
          <>
            Dental insurance and <em>payment options</em>
          </>
        }
        lead="We’re out-of-network with PPO plans, and most still pay a share of your care here. We check your benefits first and tell you your portion before treatment begins."
        analyticsContext="insurance-hero"
        chips={["PPO benefits checked first", "Visa · MasterCard · FSA/HSA", "In-house plan if uninsured"]}
        media={
          <figure className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] bg-cream-200 shadow-lift lg:ml-auto lg:max-w-md">
            <div className="relative aspect-[16/11] sm:aspect-[4/3] lg:aspect-[4/5]">
              <Image
                src="/images/redesign/team-rachel-reception.webp"
                alt="Rachel, the office’s insurance coordinator, smiling at the reception desk"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 28rem"
                className="object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-evergreen-950/85 via-evergreen-950/30 to-transparent"
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-5 text-cream-50 sm:p-6">
              <span className="block font-heading text-2xl font-medium leading-tight">Rachel</span>
              <span className="mt-0.5 block text-sm font-medium text-cream-100/90">
                Insurance coordinator &amp; front-desk lead
              </span>
              <span className="mt-2 inline-flex rounded-full bg-cream-50/15 px-3 py-1 text-xs font-semibold text-cream-50 backdrop-blur">
                Here since 2019
              </span>
            </figcaption>
          </figure>
        }
      />

      {/* How out-of-network benefits work */}
      <Section id="how-it-works" tone="white" labelledBy="how-title">
        <SectionHeading
          id="how-title"
          eyebrow="Out-of-network, explained"
          title={
            <>
              How your PPO benefits <em>still work</em> here
            </>
          }
          lead="“Out-of-network” sounds more alarming than it is. Most PPO plans include out-of-network benefits, so your plan still pays a share of your care at our office."
        />

        <ol className="reveal-stagger mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {benefitSteps.map((step, i) => (
            <li key={step.title} className="card group relative flex gap-4 p-5 sm:p-6 md:flex-col md:gap-5">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300 shadow-soft">
                <ServiceIcon name={step.icon} className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gold-400 text-xs font-bold text-evergreen-950">
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="h-card text-[1.3rem]">{step.title}</h3>
                <p className="mt-1.5 text-[15px] leading-7 text-ink-soft">{step.body}</p>
              </div>
              {i < benefitSteps.length - 1 ? (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-4 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-white p-1 text-gold-600 shadow-soft md:block"
                />
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 rounded-[1.75rem] bg-cream-100 p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
          <div>
            <h3 className="h-card">What it means for your bill</h3>
            <p className="mt-2 text-[15px] leading-7 text-ink-soft">
              Your plan pays a percentage of your care based on its own fee schedule rather than a contracted
              rate. Your portion is the difference, and we tell you what that looks like before treatment, not
              after.
            </p>
          </div>
          <figure>
            <div
              role="img"
              aria-label="Illustration: your plan pays its share of the fee and you pay the difference"
              className="flex h-14 overflow-hidden rounded-full bg-white ring-1 ring-cream-300"
            >
              <span className="flex w-[62%] items-center gap-2 bg-evergreen-800 pl-4 pr-2 text-sm font-semibold text-cream-50 sm:pl-5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                Your plan’s share
              </span>
              <span className="flex flex-1 items-center justify-center px-2 text-sm font-semibold text-gold-700">
                Your portion
              </span>
            </div>
            <figcaption className="mt-3 text-sm leading-6 text-ink-muted">
              Illustration only. Every plan pays a different share, so we give you your real numbers before you
              commit.
            </figcaption>
          </figure>
        </div>

        <details className="faq-item group mt-4 rounded-[1.5rem] border border-cream-300/80 bg-white">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 py-3 font-semibold text-ink sm:px-6">
            Why patients stay with an out-of-network dentist
            <span
              aria-hidden="true"
              className="faq-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-lg leading-none text-evergreen-700 group-open:bg-evergreen-800 group-open:text-gold-300"
            >
              +
            </span>
          </summary>
          <div className="prose-rooted px-5 pb-5 sm:px-6">
            <p>
              Choosing a dentist out-of-network often comes down to continuity and quality of care: you keep a
              doctor who knows your history and takes a{" "}
              <Link href="/preventive-dentistry">prevention-first, conservative approach</Link>, and your plan
              still contributes. If you’re comparing options, send us your plan details and we’ll give you real
              numbers to compare instead of guesswork.
            </p>
          </div>
        </details>
      </Section>

      {/* Every way to pay */}
      <Section id="payment" tone="cream" labelledBy="payment-title">
        <SectionHeading
          id="payment-title"
          eyebrow="Ways to pay"
          title={
            <>
              Every way <em>to pay</em>
            </>
          }
          lead="Simple and predictable: insurance, two cards, your health accounts, or our in-house plan."
        />
        <ul className="reveal-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <li key={method.title} className="card flex items-start gap-4 p-5 sm:flex-col sm:p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="h-card text-[1.25rem]">{method.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-6 text-ink-soft">{method.body}</p>
                </div>
              </li>
            );
          })}
          <li
            id="in-house-plan"
            className="surface-evergreen on-dark flex flex-wrap items-start gap-4 rounded-[1.75rem] p-5 shadow-lift sm:flex-col sm:flex-nowrap sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold-300">
              <PiggyBank className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 sm:flex-none">
              <h3 className="h-card text-[1.25rem]">In-house dental plan</h3>
              <p className="mt-1.5 text-[15px] leading-6 text-evergreen-100">
                No insurance? Our in-house plan offers savings on preventive care and treatment. Ask our team for
                current details.
              </p>
            </div>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-gold btn-sm ml-16 self-start sm:ml-0 sm:mt-auto"
              data-analytics-context="insurance-plan-call"
              aria-label={`Ask about the in-house plan: call ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              Ask about the plan
            </a>
          </li>
        </ul>
      </Section>

      {/* Plans we verify + what we need */}
      <Section id="plans" tone="white" labelledBy="plans-title">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="card self-start p-6 sm:p-8">
            <p className="eyebrow">Insurance carriers</p>
            <h2 id="plans-title" className="h-section mt-3 text-[1.9rem] sm:text-[2.3rem]">
              PPO plans we can <em>help verify</em>
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-ink-soft">
              Patients often use these plans here. Don’t see yours? Ask us, since most PPO plans include
              out-of-network benefits.
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
          </div>

          <div className="grid content-start gap-4">
            <div className="rounded-[1.75rem] bg-cream-100 p-6 sm:p-8">
              <h3 className="h-card flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                  <ServiceIcon name="forms" className="h-6 w-6" animated={false} />
                </span>
                What we need from you
              </h3>
              <p className="mt-4 text-[15px] leading-7 text-ink-soft">
                Include only your insurance carrier with your online{" "}
                <Link
                  href="/schedule#appointment"
                  className="link-rooted"
                  data-analytics-context="insurance-need-request"
                >
                  appointment request
                </Link>
                . Our team follows up through your preferred contact method for any other plan details needed to
                verify benefits.
              </p>
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                Please don’t put a member ID, date of birth, or medical details in the notes field.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-ink">First visit coming up?</h3>
              <p className="mt-1 text-[15px] leading-6 text-ink-soft">
                Download the new-patient forms and see what to bring.
              </p>
              <Link href="/patient-resources" className="link-rooted mt-2 inline-flex min-h-11 items-center gap-1.5">
                New patients &amp; forms
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <ServiceReviews
        tags={["honest"]}
        title={
          <>
            Clear answers, <em>no pressure</em>
          </>
        }
        note="These reviews are about how Dr. Wong explains treatment and options, not about insurance specifically."
      />

      <Section id="insurance-faq" tone="white" labelledBy="insurance-faq-title">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              id="insurance-faq-title"
              eyebrow="Questions"
              title={
                <>
                  Insurance &amp; payment <em>FAQs</em>
                </>
              }
              lead="Still unsure about your plan? Send it to us and we’ll check."
            />
            <Link
              href="/contact#message"
              className="btn btn-outline mt-8"
              data-analytics-context="insurance-faq-ask"
            >
              <MessageSquare aria-hidden="true" />
              Ask about your plan
            </Link>
          </div>
          <FaqList items={faqs} />
        </div>
      </Section>

      <CtaBand
        analyticsContext="insurance-cta"
        title={
          <>
            Know your cost <em>before you commit</em>
          </>
        }
        lead="Request a visit and add your carrier. We’ll check your benefits and walk you through expected costs before any treatment."
      />
    </>
  );
};

export default Insurance;
