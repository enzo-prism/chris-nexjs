import { CalendarClock, HeartHandshake, ScanLine, ShieldCheck, Sparkles, Wind } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import { CtaBand } from "@/components/ds/CtaBand";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewedBy } from "@/components/ds/ReviewedBy";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { Steps, type Step } from "@/components/ds/Steps";
import { WhoTreats } from "@/components/ds/WhoTreats";
import { CostPanel } from "@/components/services/CostPanel";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import {
  AsideNote,
  FitAndDefinition,
  IconPoints,
  QuickFacts,
  SpokeCards,
  type IconPoint,
  type QuickFact,
  type Spoke,
} from "@/components/services-hub/ServiceBlocks";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/preventive-dentistry";
const SCHEDULE_HREF = "/schedule?intent=preventive&source=preventive-page#appointment";
const HERO_IMAGE = "/images/redesign/care-through-glass-courtyard.webp";

const preventiveFaqs: FAQEntry[] = [
  {
    question: "How often should I get a checkup and cleaning?",
    answer:
      "Most patients do well with preventive visits every six months. If you have gum disease, a history of frequent cavities, or implants, we may recommend visits every 3–4 months to keep things stable.",
  },
  {
    question: "What’s included in a preventive appointment?",
    answer:
      "A typical visit includes a professional cleaning, a detailed dental exam, gum health screening, and digital X‑rays when appropriate. We look for early signs of decay, infection, wear, or bite issues so treatment stays simple.",
  },
  {
    question: "Are digital X‑rays safe?",
    answer:
      "Yes. Digital imaging uses significantly less radiation than older film systems. We only take X‑rays at intervals that match your age and risk profile.",
  },
  {
    question: "Can preventive care really prevent bigger problems?",
    answer:
      "Preventive care can’t remove risk entirely, but it dramatically lowers it. Cleanings remove hardened tartar that brushing can’t, and exams help us catch problems early—before they become painful or require more extensive treatment.",
  },
  {
    question: "What if I haven’t seen a dentist in years?",
    answer:
      "You’re not alone. We’ll start with a comfortable, judgment‑free exam and prioritize what matters most for your health. Getting back to routine preventive care is the best first step.",
  },
];

const facts: readonly QuickFact[] = [
  { icon: CalendarClock, label: "How often", value: "Every 6 months for most; 3–4 for some" },
  { icon: Sparkles, label: "Includes", value: "Cleaning, exam, gum and oral cancer screening" },
  { icon: ScanLine, label: "X-rays", value: "Digital, at intervals matched to your risk" },
  { icon: ShieldCheck, label: "Insurance", value: "PPO benefits checked before your visit" },
];

const included: readonly Spoke[] = [
  {
    title: "Cleanings and exams",
    icon: "brush",
    body: "Plaque and hardened tartar removed, especially around the gumline, plus a detailed exam at the same visit.",
    href: "/dental-cleaning-palo-alto",
    linkLabel: "About cleanings and exams",
  },
  {
    title: "Digital X-rays",
    icon: "checkup",
    body: "See between teeth and under existing fillings, with far less radiation than older film. Taken only when they’re due.",
  },
  {
    title: "Gum and oral cancer screening",
    icon: "gum",
    body: "Part of every comprehensive exam, along with checks for bite wear and early signs of infection or stress fractures.",
  },
  {
    title: "Fluoride and sealants",
    icon: "shield",
    body: "Recommended when your risk calls for them. Sealants protect the deep grooves on chewing surfaces that brushes miss.",
    href: "/pediatric-dentistry",
    linkLabel: "Sealants and fluoride for kids",
  },
  {
    title: "Custom guards",
    icon: "tooth",
    body: "Night guards for grinding and clenching, and custom sports mouthguards for active kids and adults.",
    href: "/blog/night-guard-teeth-grinding-palo-alto",
    linkLabel: "Do you need a night guard?",
  },
  {
    title: "A schedule that fits your risk",
    icon: "calendar",
    body: "Six-month visits suit most people; gum disease, frequent cavities, or implants may call for every 3–4 months.",
  },
];

const visitSteps: readonly Step[] = [
  {
    title: "Your history and goals",
    body: "We review your health history, any concerns, and your goals, including cosmetic plans like whitening or Invisalign.",
  },
  {
    title: "A professional cleaning",
    body: "Your hygienist removes plaque and the hardened tartar home brushing can’t reach, especially around the gumline.",
  },
  {
    title: "Exam, screenings, and X-rays when due",
    body: "Dr. Wong checks for cavities, gum inflammation, bite wear, and early signs of infection or stress fractures, and screens for oral cancer.",
  },
  {
    title: "Your prevention plan",
    body: "Home-care coaching, fluoride or sealants if they’d help, and the right interval for your next visit.",
  },
];

const comfort: readonly IconPoint[] = [
  {
    icon: HeartHandshake,
    title: "A judgment-free restart",
    body: "Haven’t been in years? You’re not alone. We start with a comfortable exam and focus on what matters most.",
  },
  {
    icon: ScanLine,
    title: "Digital imaging",
    body: "Significantly less radiation than film, taken at intervals that match your age and risk.",
  },
  {
    icon: Sparkles,
    title: "Gentle cleanings",
    body: "Sensitive teeth or inflamed gums? We go gently and can add topical numbing.",
  },
  {
    icon: Wind,
    title: "Careful infection control",
    body: "Current CDC and ADA guidelines, rigorous sterilization, and medical-grade air filtration.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/dental-cleaning-palo-alto",
    anchorText: "Teeth cleanings and exams",
    description: "Thorough, gentle hygiene visits, plus deep cleaning when gums need it.",
  },
  {
    href: "/cavity-fillings-palo-alto",
    anchorText: "Tooth-colored fillings",
    description: "Conservative restorations when decay is caught early.",
  },
  {
    href: "/emergency-dental",
    anchorText: "Emergency dental care",
    description: "Same-day help when we can for pain, swelling, or a broken tooth.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Preventive dentistry", path: PATH },
];

const PreventiveDentistry = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Preventive Dentistry",
      pageName: "Preventive dentistry in Palo Alto",
      description:
        "Preventive dentistry including exams, cleanings, screenings, and personalized care plans to keep teeth and gums healthy.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Preventive dentistry",
      procedure: {
        name: "Comprehensive dental exam and preventive care",
        procedureType: "Noninvasive",
        bodyLocation: "Teeth and gums",
        howPerformed:
          "A professional cleaning, a detailed exam with gum health and oral cancer screening, and digital X-rays at intervals matched to your risk.",
        followup: "A personalized prevention plan and visit interval, usually every six months or every 3–4 months for higher risk.",
      },
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(preventiveFaqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="shield"
        eyebrow="Prevention first"
        title={
          <>
            Preventive dentistry in <em>Palo Alto</em>
          </>
        }
        lead="Thorough, comfortable checkups that catch issues early, when they’re easiest to treat, planned by Dr. Christopher B. Wong around your own cavity and gum risk."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="preventive-hero"
        chips={["PPO benefits checked first"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="A clinician treating a patient in a glass-walled treatment room off the garden courtyard"
            focus="50% 45%"
            aspect="aspect-[16/10] lg:aspect-[6/5]"
            badge={
              <PhotoBadge icon="shield" title="Planned around your risk">
                Six-month visits for most; every 3–4 months when gums or cavities need it.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="preventive-overview" tone="white" className="pt-10 sm:pt-14 lg:pt-16" labelledBy="preventive-fit-title">
        <JumpNav
          items={[
            { href: "#preventive-overview", label: "Is it right for me?" },
            { href: "#preventive-included", label: "What’s included" },
            { href: "#preventive-visit", label: "Your visit" },
            { href: "#preventive-cost", label: "Cost & insurance" },
            { href: "#preventive-faq", label: "FAQ" },
          ]}
        />
        <ReviewedBy date="2026-10-16" className="mt-7" />
        <QuickFacts facts={facts} className="mt-5" />

        <FitAndDefinition
          className="mt-12 lg:mt-20"
          fitId="preventive-fit-title"
          fitTitle={
            <>
              Prevention that fits <em>your mouth</em>
            </>
          }
          signs={[
            "You’re due for a checkup, or it’s been years and you want a fresh start",
            "You’ve had frequent cavities, dry mouth, or gum problems",
            "Your gums bleed, or a tooth is sensitive to cold",
            "You grind or clench, or play contact sports",
            "You’re planning whitening, veneers, or Invisalign",
          ]}
          whatId="what-is-preventive-dentistry"
          whatTitle="What is preventive dentistry?"
        >
          <p>
            Preventive dentistry is the simplest way to protect your teeth, avoid surprise emergencies, and keep your
            smile healthy long-term. Each visit combines a professional cleaning with a detailed exam, so we can catch
            small problems before they become painful or expensive.
          </p>
          <p>
            Digital X-rays let us see between teeth and under existing restorations. Taken at the right intervals, they
            let us treat a small cavity with a conservative filling rather than waiting until a crown or root canal is
            needed.
          </p>
        </FitAndDefinition>
      </Section>

      <Section id="preventive-included" tone="cream" labelledBy="preventive-included-title">
        <SectionHeading
          id="preventive-included-title"
          eyebrow="What’s included"
          title={
            <>
              What preventive care <em>includes</em>
            </>
          }
          lead="Each visit pairs a professional cleaning with a detailed exam. The extras depend on your risk, not a template."
        />
        <SpokeCards items={included} columns={3} rail className="mt-8" />

        <div
          id="preventive-visit"
          className="mt-14 grid scroll-mt-24 gap-8 sm:mt-20 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16"
        >
          <SectionHeading
            eyebrow="Your visit, step by step"
            title={
              <>
                A checkup, <em>start to finish</em>
              </>
            }
          />
          <Steps steps={visitSteps} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <AsideNote title="A personalized prevention plan" icon="calendar" className="lg:col-start-1 lg:row-start-2">
            <p>
              No two mouths are the same. We tailor your schedule to your risk factors: dry mouth, diet, past cavities,
              orthodontic history, and gum health. Some patients need standard six-month visits; others do best with
              shorter intervals to keep inflammation and bacteria controlled.
            </p>
            <p>
              Working toward cosmetic goals? Healthy gums and enamel help whitening, veneers, and Invisalign results
              look better and last longer.
            </p>
          </AsideNote>
        </div>

        <div className="mt-14 sm:mt-20">
          <h3 className="h-card text-[1.45rem] sm:text-[1.7rem]">
            Comfort and <em>technology</em>
          </h3>
          <IconPoints items={comfort} columns={4} rail headingLevel="h4" className="mt-5" />
        </div>
      </Section>

      <CostPanel
        id="preventive-cost"
        title={
          <>
            Preventive care cost and <em>insurance</em>
          </>
        }
        lead="Exams, cleanings, and X-rays are preventive care, which most PPO plans cover. We check your benefits first, so there are no surprises."
        drivers={[
          "Whether X-rays are due at this visit",
          "A routine cleaning or a deep cleaning",
          "Extras like fluoride, sealants, or a custom guard",
          "Your plan’s preventive benefits and visit frequency",
        ]}
        coverage="Preventive visits are often a plan’s best-covered category."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="preventive-cost"
      />

      <ServiceReviews
        tags={["visit", "honest"]}
        title={
          <>
            Clear advice, <em>no pressure</em>
          </>
        }
        note="Reviews about visits and advice at our office."
      />

      <WhoTreats
        teamSlugs={["angelisa", "helen", "kaye"]}
        intro="Dr. Wong does your exam and explains what he sees in plain language. Our registered dental hygienists handle cleanings and home-care coaching."
      />

      <div id="preventive-faq" className="scroll-mt-24">
        <FAQSection
          title="Preventive dentistry FAQs"
          subtitle="Visit frequency, X-ray safety, and getting back on track."
          items={preventiveFaqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="More ways to maintain and restore your smile."
      />
      <NearbyLine />

      <RelatedServicePosts serviceSlug="preventive-dentistry" serviceName="Preventive Dentistry" />

      <CtaBand
        analyticsContext="preventive-cta"
        showSteps={false}
        title={
          <>
            Due for <em>a checkup?</em>
          </>
        }
        lead="Request a visit online in about a minute, or call the front desk. We’ll check your benefits first and plan a schedule that fits your risk."
      />
    </>
  );
};

export default PreventiveDentistry;
