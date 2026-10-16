import Link from "next/link";
import { ArrowRight, Clock, MapPin, Phone, ShieldCheck, TriangleAlert, Users } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import FAQSection from "@/components/common/FAQSection";
import OfficeHoursSummary from "@/components/common/OfficeHoursSummary";
import RelatedServices, { type RelatedServiceLink } from "@/components/common/RelatedServices";
import RelatedServicePosts from "@/components/blog/RelatedServicePosts";
import { CtaBand } from "@/components/ds/CtaBand";
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
import { FirstAidGrid, type FirstAidItem } from "@/components/services/FirstAidGrid";
import { JumpNav } from "@/components/services/JumpNav";
import { NearbyLine } from "@/components/services/NearbyLine";
import { QuickFacts } from "@/components/services/QuickFacts";
import { ServicePhoto } from "@/components/services/ServicePhoto";
import { StepList } from "@/components/services/StepList";
import { officeInfo } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/emergency-dental";
const SCHEDULE_HREF = "/schedule?intent=emergency&source=emergency-page#appointment";
const HERO_IMAGE = "/images/redesign/dr-wong-front-desk-laughing.webp";
const ENTRANCE_IMAGE = "/images/redesign/office-entrance-dr-wong.webp";

const emergencyFaqs: FAQEntry[] = [
  {
    question: "What counts as a dental emergency?",
    answer:
      "A dental emergency is any problem that causes significant pain, bleeding, swelling, or risk of losing a tooth. Examples include severe toothaches, a knocked‑out tooth, a broken tooth, facial swelling from infection, or trauma to the mouth. If you’re unsure, it’s always safer to call and ask.",
  },
  {
    question: "Can I get urgent dental care at your Palo Alto office?",
    answer: `Yes. If you're in pain or dealing with a broken tooth, call ${officeInfo.phone} right away. We prioritize same-day urgent visits whenever possible and will guide you on the next best steps.`,
  },
  {
    question: "Can you see me the same day?",
    answer:
      "We prioritize urgent cases and often can see patients the same day. The sooner you contact us, the more likely we can reserve a time to diagnose the issue and relieve pain quickly.",
  },
  {
    question: "What should I do if I knock out a tooth?",
    answer:
      "Handle the tooth by the crown (not the root), gently rinse it if dirty, and keep it moist—either in milk or against your cheek. Time matters, so seek care right away. Prompt treatment can sometimes save the tooth.",
  },
  {
    question: "Do you treat emergencies for new patients?",
    answer:
      "Yes. If you’re new to our practice and have a sudden dental problem, we’ll do our best to help you promptly. We’ll focus on getting you comfortable and explaining the next steps clearly.",
  },
  {
    question: "How much does an emergency visit cost?",
    answer:
      "Emergency care varies depending on what we find and what treatment is needed. We’ll review your options and costs after the exam. Many PPO plans help cover emergency evaluations, and we can discuss payment options if needed.",
  },
  {
    question: "Is it okay to wait if the pain comes and goes?",
    answer:
      "Intermittent pain can still signal a serious problem like deep decay or infection. Waiting can make treatment more complex. It’s best to be evaluated early, even if symptoms feel temporary.",
  },
];

const firstAid: readonly FirstAidItem[] = [
  {
    id: "toothache",
    title: "Severe toothache",
    icon: "emergency",
    signs: "Throbbing pain, pain when chewing, sensitivity to hot or cold, swelling around the tooth.",
    steps: ["Rinse with warm salt water", "Take over-the-counter pain medication", "Apply a cold compress", "Call us to be seen"],
    guide: { href: "/blog/emergency-dental-care-palo-alto", title: "Urgent dental care: what to expect" },
  },
  {
    id: "broken-tooth",
    title: "Broken or chipped tooth",
    icon: "filling",
    signs: "A visible crack or chip, sharp edges, pain when biting, sensitivity.",
    steps: ["Save any broken pieces", "Rinse your mouth with warm water", "Apply a cold compress for swelling"],
    guide: { href: "/blog/cracked-tooth-emergency-dentist-palo-alto", title: "When is a cracked tooth an emergency?" },
  },
  {
    id: "knocked-out-tooth",
    title: "Knocked-out tooth",
    icon: "tooth",
    urgency: "Time matters",
    signs: "A tooth fully out of its socket after trauma, with bleeding and pain.",
    steps: [
      "Handle the tooth by the crown, never the root",
      "Gently rinse it if dirty and keep it moist, in milk or against your cheek",
      "Call right away; care within 30 minutes gives the best chance of saving it",
    ],
    guide: {
      href: "/blog/what-to-do-if-your-child-knocks-out-a-permanent-tooth-palo-alto",
      title: "If your child knocks out a permanent tooth",
    },
  },
  {
    id: "lost-crown",
    title: "Lost crown or filling",
    icon: "crown",
    signs: "Exposed tooth structure, sensitivity, discomfort when eating.",
    steps: [
      "Keep the crown or filling safe and bring it with you",
      "Use dental cement or sugar-free gum as temporary protection",
    ],
    guide: { href: "/blog/crown-fell-off-palo-alto", title: "What to do if a crown falls off" },
  },
  {
    id: "swelling",
    title: "Swelling or abscess",
    icon: "gum",
    urgency: "Don’t delay",
    signs: "Severe pain, facial swelling, fever, a bad taste, swollen lymph nodes.",
    steps: ["Rinse with salt water", "Take pain medication", "Call now for immediate dental care"],
    guide: { href: "/blog/tooth-abscess-symptoms-palo-alto", title: "Can an abscess cause swelling or fever?" },
  },
  {
    id: "bleeding",
    title: "Bleeding or a mouth injury",
    icon: "shield",
    signs: "Cuts or tears to the gums, tongue, cheeks, or lips, with bleeding and swelling.",
    steps: ["Clean the area gently", "Apply pressure to control bleeding", "Use a cold compress for swelling"],
  },
];

const callSteps: readonly Step[] = [
  {
    title: "Call us right away",
    meta: "Same day when possible",
    body: `Call ${officeInfo.phone}. We prioritize same-day emergency visits whenever possible and will guide you on next steps.`,
  },
  {
    title: "Follow first aid on the way",
    body: "Apply the first-aid steps above while you travel to our office. They help manage pain and prevent further damage.",
  },
  {
    title: "Bring what you saved",
    body: "Save any broken tooth pieces, crowns, or fillings. These may be reusable in your treatment.",
  },
  {
    title: "Relief and a clear plan",
    body: "We diagnose the problem, focus on getting you comfortable, and explain your options and costs before treatment.",
  },
];

const facts: readonly Fact[] = [
  { icon: Clock, label: "Same day", value: "Whenever possible" },
  { icon: Users, label: "New patients", value: "Welcome for urgent visits" },
  { icon: ShieldCheck, label: "PPO plans", value: "Often help with emergency exams" },
  { icon: Phone, label: "Not sure?", value: "Call and ask, it’s safer" },
];

const preventionTips = [
  "Wear a mouthguard during sports and physical activities",
  "Avoid chewing ice, hard candies, or non-food items",
  "Don't use teeth as tools to open packages or bottles",
  "Maintain regular dental check-ups to catch problems early",
  "Keep an emergency dental kit with pain relievers and dental cement",
  "Know your dentist's emergency contact information",
] as const;

const costFactors = [
  "What we find during your exam",
  "The treatment needed to relieve pain and protect the tooth",
  "Whether follow-up care is recommended once you’re comfortable",
] as const;

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/crowns-palo-alto",
    anchorText: "Dental crowns",
    description: "Restore a cracked or broken tooth once the emergency is handled.",
  },
  {
    href: "/dental-implants",
    anchorText: "Dental implants",
    description: "Long‑term solutions for missing or severely damaged teeth.",
  },
  {
    href: "/preventive-dentistry",
    anchorText: "Preventive dentistry",
    description: "Routine exams and cleanings to help avoid emergencies.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Emergency dentist", path: PATH },
];

const EmergencyDental = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Emergency Dental Care",
      pageName: "Emergency dentist in Palo Alto",
      description:
        "Urgent dental care in Palo Alto for toothaches, broken teeth, infections, and dental trauma, with same-day visits whenever possible.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Emergency dentist",
      areaServed: ["Palo Alto", "Stanford", "Menlo Park", "Mountain View"],
    }),
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  const faqSchema = buildFAQSchema(emergencyFaqs, PATH);
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <StructuredData data={schemas} />

      <PageHero
        crumbs={breadcrumbItems}
        icon="emergency"
        eyebrow="Urgent dental care"
        title={
          <>
            Emergency dentist in <em>Palo Alto</em>
          </>
        }
        lead="In pain or dealing with a broken tooth? Call us. Dr. Christopher B. Wong sees urgent toothaches, swelling, and dental trauma, and we hold time to see you the same day whenever possible."
        callFirst
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="emergency-hero"
        mediaClassName="hidden lg:block"
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Dr. Christopher B. Wong laughing with two team members at the front desk"
            focus="60% 30%"
            priority={false}
            aspect="aspect-[16/10]"
            sizes="44vw"
          />
        }
      >
        <p className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-gold-300 bg-gold-200/60 px-4 py-3 text-[15px] leading-6 text-ink">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Go to the ER right away</strong> for uncontrolled bleeding, trouble
            breathing, or rapidly worsening facial swelling.
          </span>
        </p>
      </PageHero>

      <Section id="first-aid" tone="white" labelledBy="first-aid-title" className="pt-10 sm:pt-14 lg:pt-16">
        <SectionHeading
          id="first-aid-title"
          eyebrow="What to do right now"
          title={
            <>
              First aid until <em>you’re seen</em>
            </>
          }
          lead="Recognize the signs and know what to do before you reach our office. Quick action can often save your tooth and reduce pain and complications."
        />
        <ReviewedBy date="2026-10-16" className="mt-5" />
        <JumpNav
          className="mt-6"
          items={firstAid.map((item) => ({ href: `#${item.id}`, label: item.title }))}
        />
        <FirstAidGrid items={firstAid} className="mt-6" />
        <p className="mt-6 rounded-[1.5rem] border border-cream-300/80 bg-cream-50 px-5 py-4 text-[15px] leading-6 text-ink-soft">
          <strong className="font-semibold text-ink">Call us right away</strong> for severe pain, a knocked-out or
          broken tooth, swelling, or a lost crown. If you’re unsure, it’s always safer to{" "}
          <a
            href={`tel:${officeInfo.phoneE164}`}
            className="link-rooted"
            data-analytics-context="emergency-first-aid-call"
          >
            call and ask
          </a>
          .
        </p>
        <Disclosure title="Preventing dental emergencies" className="mt-4">
          <p>While accidents happen, many dental emergencies can be prevented with proper care and precautions.</p>
          <DotList items={[...preventionTips]} />
        </Disclosure>
      </Section>

      <Section id="urgent-visit" tone="cream" labelledBy="urgent-visit-title">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <SectionHeading
              id="urgent-visit-title"
              eyebrow="Your urgent visit"
              title={
                <>
                  What happens <em>when you call</em>
                </>
              }
              lead="Dental emergencies move fast. We reserve time for urgent visits and work to see you the same day whenever possible, so you can get relief and a clear plan quickly. Take a breath: most dental emergencies can be treated effectively when addressed promptly."
            />
            <QuickFacts facts={facts} className="mt-6 lg:grid-cols-2" />
            <StepList steps={callSteps} columns={2} className="mt-8" />
          </div>

          <aside aria-labelledby="visit-info-title" className="card self-start overflow-hidden">
            <ServicePhoto
              src={ENTRANCE_IMAGE}
              alt="Office entrance with the Christopher Wong D.D.S. sign, a sculpted pine, and Dr. Wong in a white coat"
              focus="55% 15%"
              priority={false}
              aspect="aspect-[16/10]"
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="[&>div]:rounded-none [&>div]:shadow-none [&>div]:ring-0"
            />
            <div className="p-5 sm:p-7">
              <h3 id="visit-info-title" className="h-card text-[1.3rem]">
                Urgent dental care close to home
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-ink-soft">
                Our Palo Alto office helps patients from Stanford, Menlo Park, and Mountain View with urgent dental
                problems. Call for fast guidance, and we’ll prioritize urgent appointments whenever possible.
              </p>
              <dl className="mt-5 space-y-4 text-[15px] leading-6">
                <div className="flex gap-3">
                  <dt className="sr-only">Address</dt>
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
                  <dd className="text-ink">
                    {officeInfo.address.line1}
                    <br />
                    {officeInfo.address.line2}
                    <br />
                    <a
                      href={officeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-rooted mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm"
                    >
                      Get directions <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="sr-only">Hours</dt>
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
                  <dd>
                    <OfficeHoursSummary className="text-ink-soft" noteClassName="text-ink-muted" />
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="btn btn-primary"
                  data-analytics-context="emergency-visit-call"
                  aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
                >
                  <Phone aria-hidden="true" />
                  Call {officeInfo.phone}
                </a>
                <Link href={SCHEDULE_HREF} className="btn btn-outline" data-analytics-context="emergency-visit-request">
                  Request an urgent visit online
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <CostPanel
        id="emergency-cost"
        tone="white"
        title={
          <>
            Emergency visit cost: <em>no surprises</em>
          </>
        }
        lead="Emergency care varies depending on what we find and what treatment is needed. We’ll review your options and costs after the exam, before any treatment."
        drivers={costFactors}
        driversTitle="What affects the cost"
        coverage="Many PPO plans help cover emergency evaluations."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="emergency-cost"
      />

      <ServiceReviews
        tags={["emergency", "gentle"]}
        note="The first two describe urgent visits; the third is about care at our office generally."
      />

      <WhoTreats
        teamSlugs={["kelty", "rachel"]}
        intro="Dr. Wong diagnoses the problem, focuses on getting you comfortable, and explains the next steps clearly. The front-desk team finds you the soonest available time."
      />

      <div id="emergency-faq">
        <FAQSection
          title="Emergency dental FAQs"
          subtitle="Answers to common questions about urgent dental care."
          items={emergencyFaqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="After urgent care, explore these next steps."
      />
      <NearbyLine />

      <RelatedServicePosts serviceSlug="emergency-dental" serviceName="Emergency Dental Care" />

      <CtaBand
        analyticsContext="emergency-cta"
        showSteps={false}
        callFirst
        title={
          <>
            In pain right now? <em>Call us.</em>
          </>
        }
        lead="If you’re experiencing a dental emergency, time is critical. Call our Palo Alto office for prompt care and clear next steps, or request an appointment online for something less urgent."
      />
    </>
  );
};

export default EmergencyDental;
