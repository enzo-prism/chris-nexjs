import { Suspense } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Hand,
  Phone,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import type { Fact } from "@/components/ds/FactGrid";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewedBy } from "@/components/ds/ReviewedBy";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import type { Step } from "@/components/ds/Steps";
import { WhoTreats } from "@/components/ds/WhoTreats";
import { CostPanel } from "@/components/services/CostPanel";
import { Disclosure, DotList } from "@/components/services/Disclosure";
import { FeatureGrid, type Feature } from "@/components/services/FeatureList";
import { FitChecklist } from "@/components/services/FitChecklist";
import { GuideLinks } from "@/components/services/GuideLinks";
import { TreatsChips } from "@/components/services/IconMedallion";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import { QuickFacts } from "@/components/services/QuickFacts";
import { StepList } from "@/components/services/StepList";
import InvisalignConsultForm from "@/components/sections/InvisalignConsultForm";
import { officeInfo } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/invisalign";
const CONSULT_HREF = "#invisalign-consult";
const HERO_IMAGE = "/images/redesign/jamal-itero-scan.webp";

const invisalignFaqs: FAQEntry[] = [
  {
    question: "How long does Invisalign treatment take?",
    answer:
      "Most Invisalign cases take about 12–18 months, but timing depends on the complexity of your bite and how consistently you wear your aligners. Some minor corrections can finish sooner, while more involved plans may take longer. We’ll review your estimated timeline after your digital scan.",
  },
  {
    question: "How many hours per day do I need to wear aligners?",
    answer:
      "For the best results, aligners should be worn 20–22 hours per day. You’ll take them out to eat, drink anything besides water, and brush and floss, then place them right back in.",
  },
  {
    question: "Does Invisalign hurt?",
    answer:
      "You may feel pressure or mild soreness for a day or two when you switch to a new set of aligners. That’s a sign your teeth are moving. Most patients find the discomfort manageable and far less irritating than braces.",
  },
  {
    question: "Can I eat and drink normally with Invisalign?",
    answer:
      "Yes—one of the biggest benefits is that you remove aligners to eat. That means no food restrictions. We recommend brushing before reinserting aligners to keep trays clear and reduce the risk of cavities.",
  },
  {
    question: "How much does Invisalign cost?",
    answer:
      "Pricing is discussed at your consult. Cost varies based on the amount of tooth movement needed. During your consultation we’ll outline a clear fee estimate, expected phases, and payment options. Many PPO plans include orthodontic benefits that can apply to Invisalign.",
  },
  {
    question: "Will I need attachments or rubber bands?",
    answer:
      "Some Invisalign plans use small, tooth‑colored attachments to help aligners grip and guide specific tooth movements. Rubber bands (elastics) are sometimes used to correct bite relationships. Not every case needs these—your exam and digital scan will determine what’s appropriate.",
  },
  {
    question: "How often are Invisalign checkups?",
    answer:
      "You’ll return for periodic checkups so we can confirm your teeth are tracking and make any needed adjustments. Visit frequency varies by plan and how your teeth respond, and we’ll outline your schedule at the start.",
  },
  {
    question: "Where is your Palo Alto Invisalign office located?",
    answer: `We’re located at ${officeInfo.address.line1}, ${officeInfo.address.line2}. We welcome Invisalign patients from Palo Alto, Menlo Park, Stanford, and Mountain View.`,
  },
  {
    question: "What happens after Invisalign is finished?",
    answer:
      "Once your teeth are aligned, you’ll wear retainers to maintain the result. Retainers are typically worn full‑time for a short period and then at night long‑term. We’ll guide you on a schedule that keeps your smile stable.",
  },
];

const facts: readonly Fact[] = [
  { icon: Clock, label: "Typical length", value: "About 12–18 months" },
  { icon: CalendarCheck, label: "Wear time", value: "20–22 hours a day" },
  { icon: ShieldCheck, label: "Insurance", value: "PPO ortho benefits may apply" },
  { icon: Stethoscope, label: "Who", value: "Planned and monitored by Dr. Wong" },
];

const conditions = [
  "Crowded teeth",
  "Gaps between teeth",
  "Overbite or underbite",
  "Crossbite",
  "Open bite",
  "Crooked or misaligned teeth",
  "Teeth shifting after past braces",
] as const;

const whyFeatures: readonly Feature[] = [
  {
    icon: Stethoscope,
    title: "Planned by Dr. Wong",
    body: "Invisalign is part of Dr. Wong’s clinical focus. Every plan is created from your scan and monitored at each check-in, with conservative movement aimed at a stable result.",
  },
  {
    icon: ScanLine,
    title: "A digital scan, not putty",
    body: "A 3D scan maps your teeth precisely and lets Dr. Wong plan each movement before your first aligner.",
  },
  {
    icon: UtensilsCrossed,
    title: "Removable for meals",
    body: "Take aligners out to eat and to brush and floss, so there are no food restrictions.",
  },
  {
    icon: CalendarCheck,
    title: "Check-ins that fit your week",
    body: "Visit frequency depends on your plan and how your teeth respond; we set the schedule with you at the start.",
  },
];

const visitSteps: readonly Step[] = [
  {
    title: "Consult",
    meta: "About 60 minutes",
    body: "Dr. Wong evaluates your teeth, gum health, and bite, and talks through your goals. Any cavities or gum inflammation are treated first, so aligners start on a healthy foundation.",
  },
  {
    title: "Scan",
    meta: "About 30 minutes",
    body: "A digital scan creates precise 3D images of your teeth and maps tooth movement more precisely than old-style impressions.",
  },
  {
    title: "Aligners",
    meta: "Often 12–18 months",
    body: "Your custom aligners are made from your plan. You switch to each new set as directed, often every one to two weeks, and come in periodically so we can confirm your teeth are tracking.",
  },
  {
    title: "Refinements",
    meta: "If needed",
    body: "Refinement aligners are common near the end to fine-tune details. Teeth don’t always move exactly as predicted, so refinements aren’t a sign anything went wrong.",
  },
];

const comfort: readonly Feature[] = [
  {
    icon: ScanLine,
    title: "A digital scan, not putty",
    body: "A 3D scan maps your teeth precisely and lets Dr. Wong plan each movement before your first aligner.",
  },
  {
    icon: Hand,
    title: "Pressure, not pain",
    body: "Expect a day or two of pressure or mild soreness with each new set, a sign your teeth are moving.",
  },
  {
    icon: UtensilsCrossed,
    title: "Removable for meals",
    body: "Take aligners out to eat and to brush and floss, so there are no food restrictions.",
  },
  {
    icon: CalendarCheck,
    title: "Check-ins that fit your week",
    body: "Visit frequency depends on your plan and how your teeth respond; we set the schedule with you at the start.",
  },
];

const careInstructions = [
  "Wear aligners 20–22 hours per day for optimal results",
  "Remove aligners when eating or drinking (except water)",
  "Clean aligners daily with lukewarm water and mild soap",
  "Brush and floss teeth before reinserting aligners",
  "Store aligners in their case when not wearing them",
  "Follow your scheduled aligner changes as directed",
] as const;

const costFactors = [
  "How much tooth movement and bite correction you need",
  "Whether attachments, elastics, or refinements are recommended",
  "Any dental work needed before you start (cleanings, fillings, gum care)",
  "Retainers and follow-up to protect your result",
  "Orthodontic benefits through PPO insurance, plus HSA/FSA options",
] as const;

const consultationChecklist = [
  "Share your goals (crowding, spacing, bite, finishing touches)",
  "Ask if you’ll need attachments, elastics, or refinements",
  "Review estimated timing and how often you’ll check in",
  "Confirm what’s included in the plan and retainer options",
  "Bring insurance information so we can help estimate benefits",
] as const;

const careGuides = [
  { href: "/blog/invisalign-attachments-and-refinements", title: "Invisalign attachments & refinements: why they matter" },
  { href: "/blog/retainers-after-invisalign", title: "Retainers after Invisalign: keep your smile straight" },
  { href: "/blog/lost-retainer-palo-alto", title: "Lost or broken retainer? What to do" },
] as const;

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/teeth-whitening-palo-alto",
    anchorText: "Teeth whitening",
    description: "Finish your new alignment with ZOOM! in-office whitening or take-home trays.",
  },
  {
    href: "/dental-veneers",
    anchorText: "Dental veneers",
    description: "Reshape chipped, worn, or uneven teeth once they’re aligned.",
  },
  {
    href: "/dental-cleaning-palo-alto",
    anchorText: "Cleanings and exams",
    description: "Healthy teeth and gums come first, before and during aligner treatment.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Invisalign", path: PATH },
];

const Invisalign = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Invisalign Clear Aligners",
      pageName: "Invisalign Palo Alto",
      description:
        "Invisalign clear aligner treatment in Palo Alto for teens and adults: a 3D digital scan, a personalized plan created and monitored by Dr. Wong, check-ins that fit busy schedules, and retainers to protect the result.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Invisalign clear aligner treatment",
      procedure: {
        name: "Clear aligner orthodontic treatment (Invisalign)",
        procedureType: "Noninvasive",
        bodyLocation: "Teeth",
        howPerformed:
          "A series of custom, removable clear aligners, each worn about one to two weeks, gradually moves teeth along a plan built from a 3D digital scan.",
        preparation: "A comprehensive exam and digital scan; any cavities or gum inflammation are treated first.",
        followup: "Periodic check-ins during treatment, then retainers to keep teeth in their new position.",
      },
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(invisalignFaqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="aligner"
        eyebrow="Invisalign® clear aligners"
        title={
          <>
            Invisalign in <em>Palo Alto</em>
          </>
        }
        lead="Clear aligner treatment for adults and teens, planned by Dr. Christopher B. Wong from a 3D digital scan, with check-ins built for busy schedules and retainers to keep your result."
        analyticsContext="invisalign-hero"
        chips={["PPO ortho benefits checked first"]}
        actions={
          <>
            <a
              href={CONSULT_HREF}
              className="btn btn-lg btn-primary"
              data-analytics-context="invisalign-hero-consult"
            >
              <CalendarDays aria-hidden="true" />
              Book an Invisalign consult
            </a>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-lg btn-outline"
              data-analytics-context="invisalign-hero-call"
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              {officeInfo.phone}
            </a>
          </>
        }
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Jamal, registered dental assistant, reviewing a digital scan on the iTero screen"
            focus="35% 40%"
            aspect="aspect-[16/10] sm:aspect-[16/11] lg:aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 46vw"
            badge={
              <PhotoBadge icon="aligner" title="Planned by Dr. Wong">
                Every plan is created from your scan and monitored at each check-in.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="invisalign-why" tone="white" labelledBy="invisalign-why-title">
        <JumpNav
          items={[
            { href: "#invisalign-why", label: "Why here" },
            { href: "#invisalign-process", label: "How it works" },
            { href: "#invisalign-cost", label: "Cost & financing" },
            { href: "#invisalign-faq", label: "FAQ" },
            { href: "#invisalign-consult", label: "Book a consult" },
          ]}
        />
        <QuickFacts facts={facts} className="mt-6" />
        <ReviewedBy date="2026-10-23" className="mt-5" />

        <div className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="invisalign-why-title"
            eyebrow="Why Invisalign here"
            title={
              <>
                Why Invisalign at <em>Dr. Wong&apos;s</em>
              </>
            }
            lead="Invisalign is part of Dr. Wong’s clinical focus. Plans start with a comprehensive exam and a 3D digital scan, stay conservative so results hold, and include check-ins that fit work and school schedules in Palo Alto."
          >
            <h3 className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Invisalign can treat</h3>
            <TreatsChips items={conditions} className="mt-3" />
          </SectionHeading>
          <FitChecklist
            good={[
              "Mild to moderate crowding or spacing",
              "Teeth that shifted after previous orthodontics",
              "You’re a teen or adult who wants removable aligners",
              "You can wear aligners 20–22 hours per day",
            ]}
            goodTitle="Often a good fit for"
            plan={[
              "Active gum disease or untreated cavities (we’ll address these first)",
              "More complex bite issues that may be better treated with braces or specialist care",
              "Trouble wearing aligners consistently (compliance matters)",
            ]}
            planTitle="A few important considerations"
            note="If aligners aren’t the best option for long-term stability, we’ll explain alternatives and help you choose the right path."
          />
        </div>

        <FeatureGrid features={whyFeatures} columns={4} headingLevel="h3" rail className="mt-12 sm:mt-16" />

        {/*
          TODO: Official Invisalign graphics — render <InvisalignOfficialGraphics />
          here once Align Technology brand assets arrive. Do not invent artwork.
          <InvisalignOfficialGraphics />
        */}
      </Section>

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong creates and reviews every Invisalign plan from your 3D scan, keeps tooth movement conservative, and gives clear check-ins and retainer guidance so results stay stable."
      />

      <Section id="invisalign-process" tone="cream" labelledBy="invisalign-process-title">
        <SectionHeading
          id="invisalign-process-title"
          eyebrow="Your visits, step by step"
          title={
            <>
              How Invisalign <em>works</em>
            </>
          }
          lead="Consult, scan, aligners, then refinements if they’re needed. Here’s what to expect at our Palo Alto practice, and roughly how long each phase takes."
        />
        <StepList steps={visitSteps} columns={4} className="mt-10" />

        {/*
          TODO: Official Invisalign video — render <InvisalignOfficialVideo />
          here once Align Technology provides the embed. Do not invent a clip.
          <InvisalignOfficialVideo />
        */}

        <div className="mt-12 sm:mt-16">
          <h3 className="h-card text-[1.4rem] sm:text-[1.75rem]">
            Comfort and <em>technology</em>
          </h3>
          <FeatureGrid features={comfort} columns={4} headingLevel="h4" rail className="mt-5" />
        </div>

        <div className="mt-8 space-y-3 lg:mt-10">
          <Disclosure title="Attachments">
            <p>
              Tiny, tooth-colored shapes bonded to select teeth help aligners grip and guide movements like rotations
              and root control. They don’t usually hurt, and they’re removed and polished away at the end.
            </p>
          </Disclosure>
          <Disclosure title="Elastics (rubber bands)">
            <p>
              Some cases use elastics to improve bite relationships. Not everyone needs them, and we’ll show you
              exactly where they hook and how to wear them if they’re part of your plan.
            </p>
          </Disclosure>
          <Disclosure title="Retainers after Invisalign">
            <p>
              Teeth naturally want to drift, and the tissues around them need time to stabilize after they move.
              Most patients wear a retainer full-time right after Invisalign, then switch to nighttime wear.
              Consistent wear matters most in the first year.
            </p>
            <DotList
              items={[
                "Clear retainers made from durable plastic, often similar in look to aligners",
                "Fixed retainers bonded behind teeth, in select cases",
              ]}
            />
          </Disclosure>
          <Disclosure title="Caring for your aligners">
            <DotList items={[...careInstructions]} />
          </Disclosure>
          <GuideLinks
            className="mt-6"
            title="Aligner and retainer guides"
            columns={1}
            guides={careGuides}
          />
        </div>
      </Section>

      <CostPanel
        id="invisalign-cost"
        tone="white"
        title={
          <>
            Cost and financing: <em>discussed at your consult</em>
          </>
        }
        lead="Invisalign fees vary because every bite and timeline is different. We do not publish a single fee online."
        drivers={costFactors}
        coverage="Many PPO plans include orthodontic benefits that can apply to Invisalign."
        scheduleHref={CONSULT_HREF}
        analyticsContext="invisalign-cost"
      >
        <div
          className="card mt-3 p-5 sm:p-6"
          data-placeholder="invisalign-pricing"
        >
          <p className="font-heading text-[1.25rem] font-medium text-ink">
            Pricing discussed at your consult
          </p>
          <p className="mt-1.5 text-[15px] leading-6 text-ink-soft sm:leading-7">
            After your exam and digital scan, you’ll get a clear, written estimate and a walk-through of insurance
            and payment options. We accept Visa, MasterCard, and FSA/HSA funds, and can explain our in-house dental
            plan if you don’t have insurance.
          </p>
        </div>
        <div className="mt-3 space-y-3">
          <Disclosure title="Your consultation checklist">
            <DotList items={[...consultationChecklist]} />
          </Disclosure>
        </div>
      </CostPanel>

      <ServiceReviews
        tags={["gentle", "honest"]}
        note="Reviews about care at our office; none of these mention Invisalign specifically."
      />

      <div id="invisalign-faq">
        <FAQSection
          title="Invisalign FAQs"
          subtitle="Clear answers to common questions about clear aligner treatment."
          items={invisalignFaqs}
        />
      </div>

      <Section id="invisalign-consult" tone="paper" labelledBy="invisalign-consult-title" width="narrow">
        <SectionHeading
          id="invisalign-consult-title"
          eyebrow="Book a consult"
          title={
            <>
              Book an Invisalign <em>consult</em>
            </>
          }
          lead="About a minute to fill out. We’ll call or email within one business day to confirm a time. Your visit is not booked until we confirm it."
        />
        <div className="mt-8 rounded-[1.75rem] border border-cream-300/80 bg-white px-5 py-6 shadow-lift sm:px-8 sm:py-8">
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="min-h-[960px] w-full rounded-[1.25rem] bg-cream-50 md:min-h-[852px]"
              />
            }
          >
            <InvisalignConsultForm />
          </Suspense>
        </div>
      </Section>

      <RelatedServices
        items={relatedServices}
        title="More ways we can help"
        subtitle="Other care from Dr. Wong and the team in Palo Alto."
      />
      <NearbyLine subject="Invisalign patients" />

      <RelatedServicePosts serviceSlug="invisalign" serviceName="Invisalign" category="Invisalign" />
    </>
  );
};

export default Invisalign;
