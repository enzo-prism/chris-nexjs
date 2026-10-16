import Link from "next/link";
import { Baby, CalendarClock, HeartHandshake, MessageCircle, ShieldCheck, Smile, Sprout, Trophy } from "lucide-react";

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

// Copy note: this is a general family practice. Say "children's dentistry"
// and "kids", never "pediatric dentist" (a specialist title; SEO report §0.8).
const PATH = "/pediatric-dentistry";
const SCHEDULE_HREF = "/schedule?intent=pediatric&source=pediatric-page#appointment";
const HERO_IMAGE = "/images/redesign/office-aquarium-lounge.webp";

const pediatricFaqs: FAQEntry[] = [
  {
    question: "When should my child first see a dentist?",
    answer:
      "We recommend a first visit by age one or within six months of the first tooth. Early visits help kids get comfortable and allow us to guide parents on brushing and nutrition.",
  },
  {
    question: "How often do children need checkups?",
    answer:
      "Most kids benefit from exams and cleanings every six months. If your child is cavity‑prone, we may recommend shorter intervals to keep teeth protected.",
  },
  {
    question: "Do you offer fluoride and sealants?",
    answer:
      "Yes. We recommend fluoride or sealants based on your child’s risk factors. Sealants protect deep grooves on chewing surfaces where toothbrushes can miss.",
  },
  {
    question: "What if my child is nervous?",
    answer:
      "That’s common. We use a calm, tell‑show‑do approach and move at your child’s pace. Our goal is to build positive experiences that last into adulthood.",
  },
  {
    question: "Do you treat teens and orthodontic concerns?",
    answer:
      "Yes. We monitor growth and bite development, and we can discuss Invisalign for teens when appropriate.",
  },
];

const facts: readonly QuickFact[] = [
  { icon: Baby, label: "First visit", value: "By age one, or 6 months after the first tooth" },
  { icon: CalendarClock, label: "Checkups", value: "Every six months for most kids" },
  { icon: ShieldCheck, label: "Prevention", value: "Fluoride and sealants when they help" },
  { icon: Trophy, label: "Teens", value: "Sports guards, wisdom teeth, Invisalign" },
];

const ages: readonly Spoke[] = [
  {
    title: "Little ones and first visits",
    icon: "kids",
    tag: "From age one",
    body: "Short, friendly visits that help kids get comfortable, plus practical coaching for parents on brushing and nutrition.",
  },
  {
    title: "School-age kids",
    icon: "shield",
    tag: "Prevention first",
    body: "Enamel is thinner and brushing habits are still developing, so we focus on cleanings, fluoride advice, and sealants when appropriate.",
    href: "/blog/are-dental-sealants-worth-it-for-kids-palo-alto",
    linkLabel: "Are sealants worth it?",
  },
  {
    title: "Teens",
    icon: "aligner",
    tag: "Changing needs",
    body: "Sports mouthguards, wisdom-tooth monitoring, and orthodontic planning, including clear aligners when they’re a good fit.",
    href: "/invisalign",
    linkLabel: "Invisalign for teens",
  },
];

const visitSteps: readonly Step[] = [
  {
    title: "A calm hello",
    body: "We meet your child (and you) and explain what we’ll do in simple terms, so kids feel involved and safe.",
  },
  {
    title: "Tell, show, do",
    body: "We show each tool before we use it and move at your child’s pace. Nervous kids are common, and we never rush.",
  },
  {
    title: "A gentle cleaning and check",
    body: "A gentle cleaning, a careful cavity and gum check, and a look at how baby teeth are spacing and permanent teeth are coming in.",
  },
  {
    title: "Tips that fit your family",
    body: "Brushing and flossing guidance matched to your child’s age and coordination, nutrition tips that work for busy schedules, and fluoride or sealants if they’d help.",
  },
];

const comfort: readonly IconPoint[] = [
  {
    icon: MessageCircle,
    title: "Kid-friendly explanations",
    body: "Age-appropriate words, short explanations, and plenty of positive reinforcement.",
  },
  {
    icon: HeartHandshake,
    title: "At your child’s pace",
    body: "A calm tell-show-do approach that builds trust visit by visit.",
  },
  {
    icon: Sprout,
    title: "Early insight",
    body: "Spotting crowding or bite issues early gives families more options later.",
  },
  {
    icon: Smile,
    title: "One dental home",
    body: "Parents and kids can see the same team, from a first tooth through the teen years and beyond.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/dental-cleaning-palo-alto",
    anchorText: "Teeth cleanings and exams",
    description: "Preventive cleanings for every age, parents included.",
  },
  {
    href: "/cavity-fillings-palo-alto",
    anchorText: "Tooth-colored fillings",
    description: "Comfortable cavity repair for baby or adult teeth.",
  },
  {
    href: "/invisalign",
    anchorText: "Invisalign for teens",
    description: "Clear aligners for mild to moderate alignment needs.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Children's dentistry", path: PATH },
];

const PediatricDentistry = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Children's Dentistry",
      pageName: "Children's dentistry in Palo Alto",
      description:
        "Gentle family dental care for children and teens, focused on prevention and long‑term oral health.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Children's dentistry",
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(pediatricFaqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="kids"
        eyebrow="Kids and teens"
        title={
          <>
            Children’s dentistry in <em>Palo Alto</em>
          </>
        }
        lead="Calm, age-appropriate visits that help kids build healthy habits and positive experiences from the start. Dr. Christopher B. Wong and our team care for kids, teens, and parents."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="pediatric-hero"
        chips={["First visits by age one"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="The office lounge, with a reef aquarium and leather chairs"
            focus="55% 40%"
            aspect="aspect-[16/10] lg:aspect-[6/5]"
            badge={
              <PhotoBadge icon="kids" title="One dental home">
                Kids, teens, and parents can all see the same team.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="kids-overview" tone="white" className="pt-10 sm:pt-14 lg:pt-16" labelledBy="kids-fit-title">
        <JumpNav
          items={[
            { href: "#kids-overview", label: "When to come in" },
            { href: "#kids-ages", label: "By age" },
            { href: "#kids-visit", label: "The visit" },
            { href: "#kids-cost", label: "Cost & insurance" },
            { href: "#kids-faq", label: "FAQ" },
          ]}
        />
        <ReviewedBy date="2026-10-16" className="mt-7" />
        <QuickFacts facts={facts} className="mt-5" />

        <FitAndDefinition
          className="mt-12 lg:mt-20"
          fitId="kids-fit-title"
          fitEyebrow="When to come in"
          fitTitle={
            <>
              Is it time for <em>a kids’ visit?</em>
            </>
          }
          signs={[
            "Your child is turning one, or their first tooth came in six months ago",
            "It’s been six months since their last checkup",
            "They’re nervous about the dentist and need a calm, unhurried visit",
            "You’d like brushing or snack advice that fits real life",
            "Your teen plays sports, has crowding, or wisdom teeth on the way",
          ]}
          whatId="what-is-childrens-dentistry"
          whatTitle="What is children’s dentistry?"
        >
          <p>
            Children’s dentistry is preventive, age-appropriate dental care for kids and teens. Visits include a gentle
            cleaning, a careful cavity and gum check, and guidance on brushing and flossing that matches your child’s
            age and coordination.
          </p>
          <p>
            We’re a general family practice, so Dr. Wong and the team see kids, teens, and parents. We also monitor how
            baby teeth are spacing and how permanent teeth are coming in; early insight into crowding or bite issues
            gives families more options later.
          </p>
        </FitAndDefinition>
      </Section>

      <Section id="kids-ages" tone="cream" labelledBy="kids-ages-title">
        <SectionHeading
          id="kids-ages-title"
          eyebrow="Care that grows with them"
          title={
            <>
              From first tooth <em>to teens</em>
            </>
          }
          lead="Children are more prone to cavities, so prevention comes first: professional cleanings, fluoride recommendations, and sealants when appropriate."
        />
        <SpokeCards items={ages} columns={3} rail className="mt-8" />

        <div
          id="kids-visit"
          className="mt-14 grid scroll-mt-24 gap-8 sm:mt-20 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-16"
        >
          <SectionHeading
            eyebrow="What to expect"
            title={
              <>
                What happens at <em>a children’s visit</em>
              </>
            }
          />
          <Steps steps={visitSteps} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <AsideNote
            title="If a tooth gets knocked out"
            icon="emergency"
            href="/blog/what-to-do-if-your-child-knocks-out-a-permanent-tooth-palo-alto"
            linkLabel="What to do, step by step"
            className="lg:col-start-1 lg:row-start-2"
          >
            <p>
              Call the office right away; we reserve time for urgent visits. See{" "}
              <Link href="/emergency-dental" className="link-rooted">
                emergency dental care
              </Link>{" "}
              for what to do on the way in.
            </p>
          </AsideNote>
        </div>

        <div className="mt-14 sm:mt-20">
          <h3 className="h-card text-[1.45rem] sm:text-[1.7rem]">
            Comfort comes <em>first</em>
          </h3>
          <IconPoints items={comfort} columns={4} rail headingLevel="h4" className="mt-5" />
        </div>
      </Section>

      <CostPanel
        id="kids-cost"
        title={
          <>
            Kids’ visit cost and <em>insurance</em>
          </>
        }
        lead="Checkups and cleanings are preventive care, which most PPO plans cover for children. We check your benefits before the visit, so there are no surprises."
        drivers={[
          "Your child’s age and which preventive care is due",
          "Whether X-rays, fluoride, or sealants are recommended",
          "Any fillings needed for baby or adult teeth",
          "Your plan’s preventive benefits and visit frequency",
        ]}
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="pediatric-cost"
      />

      <ServiceReviews
        tags={["family"]}
        title={
          <>
            Families who <em>stay</em>
          </>
        }
        note="Reviews from families and from patients who started coming here as kids."
      />

      <WhoTreats
        teamSlugs={["kaye", "helen"]}
        intro="Dr. Wong cares for patients of every age. He and the team explain things to kids in simple terms, move at their pace, and keep parents in the loop."
      />

      <div id="kids-faq" className="scroll-mt-24">
        <FAQSection
          title="Children’s dentistry FAQs"
          subtitle="First visits, checkups, sealants, nerves, and teens."
          items={pediatricFaqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="More family-focused care at our Palo Alto office."
      />
      <NearbyLine subject="Families" />

      <RelatedServicePosts serviceSlug="pediatric-dentistry" serviceName="Children's Dentistry" />

      <CtaBand
        analyticsContext="pediatric-cta"
        showSteps={false}
        title={
          <>
            Ready for a calm <em>first visit?</em>
          </>
        }
        lead="Request a kids’ visit online in about a minute, or call the front desk. Bringing siblings or a parent too? Mention it in your request."
      />
    </>
  );
};

export default PediatricDentistry;
