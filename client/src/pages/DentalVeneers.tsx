import { CalendarCheck, Clock, Gem, Layers, ShieldCheck, Stethoscope } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import { CtaBand } from "@/components/ds/CtaBand";
import type { Fact } from "@/components/ds/FactGrid";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewedBy } from "@/components/ds/ReviewedBy";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import type { Step } from "@/components/ds/Steps";
import { WhoTreats } from "@/components/ds/WhoTreats";
import { CostPanel } from "@/components/services/CostPanel";
import { DotList } from "@/components/services/Disclosure";
import { FitChecklist } from "@/components/services/FitChecklist";
import { GuideLinks } from "@/components/services/GuideLinks";
import { IconMedallion } from "@/components/services/IconMedallion";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
import { OptionCards, type ServiceOption } from "@/components/services/OptionCards";
import { QuickFacts } from "@/components/services/QuickFacts";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import { StepList } from "@/components/services/StepList";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/dental-veneers";
const SCHEDULE_HREF = "/schedule?intent=cosmetic&source=veneers-page#appointment";
const HERO_IMAGE = "/images/redesign/dr-wong-atrium-hallway.webp";

const facts: readonly Fact[] = [
  { icon: Layers, label: "Options", value: "Porcelain, composite, no-prep" },
  { icon: Clock, label: "Porcelain lasts", value: "10–15+ years with care" },
  { icon: CalendarCheck, label: "Composite", value: "Often done in one visit" },
  { icon: ShieldCheck, label: "Approach", value: "Minimal tooth preparation" },
];

const concerns = [
  "Discolored or stained teeth that don't respond to whitening",
  "Worn down, chipped, or broken teeth",
  "Misaligned, uneven, or irregularly shaped teeth",
  "Gaps between teeth",
] as const;

const veneerOptions: readonly ServiceOption[] = [
  {
    name: "Porcelain veneers",
    icon: "veneer",
    tagline: "Durable, natural-looking porcelain shells.",
    features: [
      "Natural aesthetics with translucent appearance",
      "Highly resistant to stains",
      "Conservative tooth preparation",
      "Custom-shaded to match your teeth",
    ],
    rows: [
      { label: "Process", value: "Consultation, tooth preparation and impressions, then a final bonding appointment" },
      { label: "Lifespan", value: "Durability and longevity (10–15+ years)" },
      {
        label: "Ideal for",
        value: "A long-lasting, highly aesthetic, natural-looking solution for significant cosmetic improvements.",
      },
    ],
  },
  {
    name: "Composite veneers",
    icon: "filling",
    tagline: "A versatile and more conservative option.",
    features: [
      "Minimally invasive, with little to no enamel removal",
      "Same-day transformation possible",
      "Cost-effective and easily repairable",
    ],
    rows: [
      { label: "Process", value: "Applied directly and sculpted in a single appointment" },
      { label: "Lifespan", value: "5–7 years with proper care" },
      {
        label: "Ideal for",
        value: "A budget-friendly, quicker, often more conservative fix for minor chips, gaps, or discoloration.",
      },
    ],
  },
  {
    name: "No-prep veneers (Lumineers®)",
    icon: "tooth",
    tagline: "Ultra-thin, for maximum enamel preservation.",
    features: [
      "May be reversible in some cases",
      "Reduced discomfort and treatment time",
      "No anesthesia typically required",
      "Stain-resistant like traditional porcelain",
    ],
    rows: [
      { label: "Process", value: "Quick application with minimal tooth preparation" },
      {
        label: "Ideal for",
        value: "Minor cosmetic imperfections when preserving natural enamel is the priority.",
      },
    ],
  },
];

const visitSteps: readonly Step[] = [
  {
    title: "Consultation and exam",
    meta: "First visit",
    body: "Dr. Wong examines your teeth, listens to your goals, and explains the advantages and disadvantages of each veneer option before you decide.",
  },
  {
    title: "Preparation and impressions",
    meta: "Porcelain veneers",
    body: "Teeth are prepared conservatively, with as little enamel removed as possible, and impressions are taken so your veneers can be custom-made and custom-shaded.",
  },
  {
    title: "Final bonding appointment",
    meta: "Porcelain veneers",
    body: "Your custom veneers are bonded to the front of your teeth, and we review how to care for them.",
  },
];

const careInstructions = [
  "Brush twice daily with non-abrasive fluoride toothpaste",
  "Floss daily to maintain gum health",
  "Attend regular dental check-ups and cleanings",
  "Avoid biting on hard objects like ice",
  "Don't use teeth to open packages",
] as const;

const costFactors = [
  "How many teeth you’d like to treat",
  "The material you choose: porcelain, composite, or no-prep",
  "Whether whitening, bonding, or other care is part of the plan",
  "Any treatment needed first so veneers sit on healthy teeth and gums",
] as const;

const faqs: FAQEntry[] = [
  {
    question: "How long do veneers last?",
    answer:
      "Porcelain veneers are durable and often last 10–15 years or more with good care. Composite veneers typically last about 5–7 years with proper care, and they’re easy to repair if needed.",
  },
  {
    question: "Porcelain or composite: which veneer is right for me?",
    answer:
      "Porcelain suits patients who want a long-lasting, highly aesthetic result for significant cosmetic changes. Composite is a quicker, budget-friendly, and often more conservative choice for minor chips, gaps, or discoloration. Dr. Wong will explain the trade-offs for your teeth.",
  },
  {
    question: "Are veneers reversible?",
    answer:
      "Porcelain veneers need conservative tooth preparation, so they’re considered a long-term commitment. No-prep veneers (Lumineers®) preserve the most enamel and may be reversible in some cases.",
  },
  {
    question: "Can veneers cover stains that whitening can’t fix?",
    answer:
      "Yes. Veneers can change the color of teeth with deep discoloration that doesn’t respond to whitening, and they can improve shape, size, or length at the same time.",
  },
  {
    question: "How do I care for veneers?",
    answer:
      "Brush twice daily with a non-abrasive fluoride toothpaste, floss daily, and keep up with checkups and cleanings. Avoid biting ice or opening packages with your teeth. If you clench or grind, Dr. Wong may recommend a custom nightguard.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/teeth-whitening-palo-alto",
    anchorText: "Teeth whitening",
    description: "Brighten natural teeth first, or match your shade before veneers.",
  },
  {
    href: "/invisalign",
    anchorText: "Invisalign in Palo Alto",
    description: "Straighten teeth with clear aligners for a balanced smile.",
  },
  {
    href: "/crowns-palo-alto",
    anchorText: "Dental crowns",
    description: "Full coverage for cracked, broken, or heavily filled teeth.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Dental veneers", path: PATH },
];

const DentalVeneers = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Dental Veneers",
      pageName: "Dental veneers in Palo Alto",
      description:
        "Custom porcelain, composite, and no-prep veneers in Palo Alto, planned conservatively by Dr. Wong to preserve as much natural enamel as possible.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Dental veneers",
      procedure: {
        name: "Dental veneers (porcelain, composite, or no-prep)",
        bodyLocation: "Front teeth",
        howPerformed:
          "Thin custom shells are bonded to the front surface of the teeth: porcelain veneers after conservative preparation and impressions, composite veneers sculpted directly in one appointment.",
        preparation: "A thorough examination and a discussion of each option’s advantages and disadvantages.",
        followup: "Daily brushing and flossing, regular checkups, and a custom nightguard if you clench or grind.",
      },
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(faqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="veneer"
        eyebrow="Porcelain, composite & no-prep veneers"
        title={
          <>
            Dental veneers in <em>Palo Alto</em>
          </>
        }
        lead="Custom porcelain, composite, and no-prep veneers at the practice of Christopher B. Wong, DDS, planned conservatively to keep as much healthy enamel as possible."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="veneers-hero"
        chips={["Every option explained first"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Dr. Christopher B. Wong seated in the office hallway beside the garden atrium"
            focus="54% 36%"
            aspect="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/6]"
            badge={
              <PhotoBadge icon="veneer" title="Enamel comes first">
                Minimal preparation whenever it can meet your goals.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="veneers-candidacy" tone="white" labelledBy="veneers-candidacy-title">
        <JumpNav
          items={[
            { href: "#veneers-candidacy", label: "Are veneers right for me?" },
            { href: "#veneer-options", label: "Porcelain vs composite" },
            { href: "#veneers-process", label: "Your visits" },
            { href: "#veneers-cost", label: "Cost" },
            { href: "#veneers-faq", label: "FAQ" },
          ]}
        />
        <QuickFacts facts={facts} className="mt-6" />
        <ReviewedBy date="2026-10-16" className="mt-5" />

        <div className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="veneers-candidacy-title"
            eyebrow="Is it right for you?"
            title={
              <>
                Are veneers right <em>for you?</em>
              </>
            }
            lead="Veneers can address several cosmetic concerns at once. During your consultation, Dr. Wong conducts a thorough examination and explains the advantages and disadvantages of each option, including simpler ones."
          />
          <FitChecklist
            good={concerns}
            goodTitle="Veneers can address"
            plan={[
              {
                label: "Clenching or grinding",
                text: "Dr. Wong may recommend a custom nightguard to protect your veneers and help them last.",
              },
              {
                label: "Stains that may whiten",
                text: "If professional whitening can reach your goal, we’ll say so before suggesting veneers.",
              },
              {
                label: "One small chip",
                text: "Cosmetic bonding is sometimes the more conservative fix; we’ll compare both.",
              },
            ]}
            planTitle="We’ll talk through"
          />
        </div>
      </Section>

      <Section id="what-are-veneers" tone="cream" labelledBy="what-are-veneers-title">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              id="what-are-veneers-title"
              eyebrow="The basics"
              title={
                <>
                  What are <em>dental veneers?</em>
                </>
              }
            />
            <div className="prose-rooted mt-5 space-y-4">
              <p>
                Dental veneers are thin, custom-made shells designed to cover the front surface of your teeth,
                improving their appearance by changing their color, shape, size, or length. They are a versatile
                solution for addressing various cosmetic concerns.
              </p>
              <p>
                Dr. Christopher B. Wong is committed to preserving as much of your natural tooth structure as possible
                while achieving your aesthetic goals. During your consultation at our Palo Alto office, he will conduct
                a thorough examination and explain the advantages and disadvantages of each option.
              </p>
            </div>
          </div>
          <div className="card p-5 sm:p-8">
            <IconMedallion name="veneer" className="mx-auto mb-6 hidden sm:flex" />
            <h3 className="h-card text-[1.25rem] sm:text-center">Our conservative, patient-first approach</h3>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                  <Gem className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-[1.1rem] font-medium text-ink">Enamel preservation</span>
                  <span className="mt-0.5 block text-[15px] leading-6 text-ink-soft">
                    We prioritize minimal tooth preparation to preserve your natural enamel.
                  </span>
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                  <Stethoscope className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-[1.1rem] font-medium text-ink">Thorough consultation</span>
                  <span className="mt-0.5 block text-[15px] leading-6 text-ink-soft">
                    A comprehensive evaluation to determine the best veneer option for your needs.
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="veneer-options" tone="white" labelledBy="veneer-options-title">
        <SectionHeading
          id="veneer-options-title"
          eyebrow="Options & materials"
          title={
            <>
              Types of veneers <em>we offer</em>
            </>
          }
          lead="Dr. Wong will carefully evaluate your needs and discuss the most suitable veneer option for you. Here are the primary types of veneers we offer at our Palo Alto practice."
        />
        <OptionCards options={veneerOptions} columns={3} rail className="mt-8" />
        <GuideLinks
          className="mt-6"
          columns={1}
          title="Deciding on one tooth?"
          guides={[
            {
              href: "/blog/cosmetic-bonding-vs-veneer-for-one-chipped-front-tooth-palo-alto",
              title: "Cosmetic bonding or a veneer for one chipped front tooth?",
            },
          ]}
        />
      </Section>

      <Section id="veneers-process" tone="cream" labelledBy="veneers-process-title">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionHeading
              id="veneers-process-title"
              eyebrow="Your visits, step by step"
              title={
                <>
                  How veneers <em>are made</em>
                </>
              }
              lead="Porcelain veneers usually take a consultation plus two treatment visits. Composite veneers are applied directly and sculpted in a single appointment."
            />
            <StepList steps={visitSteps} columns={2} className="mt-8 md:grid-cols-1 lg:grid-cols-1" />
          </div>
          <div className="card self-start p-5 sm:p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
              <ServiceIcon name="brush" className="h-6 w-6" />
            </span>
            <h3 className="h-card mt-4 text-[1.25rem]">Caring for your veneers</h3>
            <p className="mt-1.5 text-[15px] leading-6 text-ink-soft">
              Regardless of the type of veneer you choose, excellent oral hygiene is crucial for their longevity and the
              health of your underlying teeth.
            </p>
            <DotList className="mt-3 text-[15px] leading-6 text-ink-soft" items={[...careInstructions]} />
            <p className="mt-4 rounded-2xl bg-cream-100 p-4 text-[15px] leading-6 text-ink-soft">
              If you clench or grind your teeth, Dr. Wong may recommend a custom nightguard to protect your veneers.
              Regular check-ups at our Palo Alto practice help keep them in optimal condition.
            </p>
          </div>
        </div>
      </Section>

      <CostPanel
        id="veneers-cost"
        tone="white"
        title={
          <>
            Veneer cost: <em>what affects it</em>
          </>
        }
        lead="Veneer fees depend on how many teeth are involved and the material you choose. After your consultation, you’ll get a clear, written estimate before any treatment begins."
        drivers={costFactors}
        coverage="Veneers are usually considered cosmetic, so coverage is often limited."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="veneers-cost"
      />

      <ServiceReviews
        tags={["gentle", "honest"]}
        note="Reviews about care at our office; none of these mention veneers specifically."
      />

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong plans veneers conservatively, explains every option (including simpler ones like whitening or bonding), and keeps as much natural enamel as possible."
      />

      <div id="veneers-faq">
        <FAQSection
          title="Dental veneer FAQs"
          subtitle="How long veneers last, how to choose, and how to care for them."
          items={faqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Explore more options for your smile in Palo Alto."
      />
      <NearbyLine subject="Veneer patients" />

      <RelatedServicePosts serviceSlug="dental-veneers" serviceName="Dental Veneers" />

      <CtaBand
        analyticsContext="veneers-cta"
        title={
          <>
            Ready to discuss <em>veneers?</em>
          </>
        }
        lead="Request a veneer consultation at our Palo Alto office. We’ll review your goals, explain options, and outline a clear treatment plan."
      />
    </>
  );
};

export default DentalVeneers;
