import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Hand,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";

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
import { OptionCards, type ServiceOption } from "@/components/services/OptionCards";
import { PhaseTrack, type Phase } from "@/components/services/PhaseTrack";
import { QuickFacts } from "@/components/services/QuickFacts";
import { PhotoBadge, ServicePhoto } from "@/components/services/ServicePhoto";
import { StepList } from "@/components/services/StepList";
import { officeInfo } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildServiceSchema,
  type FAQEntry,
  type StructuredDataNode,
} from "@/lib/structuredData";

const PATH = "/invisalign";
const SCHEDULE_HREF = "/schedule?intent=invisalign&source=invisalign-page#appointment";
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
      "Cost varies based on the amount of tooth movement needed. During your consultation we’ll outline a clear fee estimate, expected phases, and payment options. Many PPO plans include orthodontic benefits that can apply to Invisalign.",
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

const phases: readonly Phase[] = [
  { label: "Consult & scan", time: "Week 1", icon: "calendar", weight: 1.1, tone: "light" },
  { label: "Plan & aligners made", time: "About 3–5 weeks", icon: "forms", weight: 1.4, tone: "light" },
  {
    label: "Active treatment",
    time: "Often 12–18 months",
    icon: "aligner",
    weight: 4.2,
    tone: "deep",
    detail: "A new set about every 1–2 weeks, with periodic check-ins.",
  },
  { label: "Refinements", time: "If needed", icon: "checkup", weight: 1.3, tone: "mid", detail: "Extra aligners to fine-tune details." },
  { label: "Retainers", time: "Long-term", icon: "shield", weight: 1.3, tone: "gold", detail: "Full-time at first, then nightly." },
];

const visitSteps: readonly Step[] = [
  {
    title: "Consultation and exam",
    meta: "About 60 minutes",
    body: "Dr. Wong evaluates your teeth, gum health, and bite, and talks through your goals. Any cavities or gum inflammation are treated first, so aligners start on a healthy foundation.",
  },
  {
    title: "3D digital scan",
    meta: "About 30 minutes",
    body: "A digital scan creates precise 3D images of your teeth and maps tooth movement more precisely than old-style impressions.",
  },
  {
    title: "Your custom treatment plan",
    meta: "1–2 weeks",
    body: "Your plan shows the step-by-step movement of your teeth, about how many aligners you’ll need, and whether attachments or elastics will help.",
  },
  {
    title: "Aligners are made",
    meta: "2–3 weeks",
    body: "Your custom aligners are made from your plan. You’ll get your first set plus clear instructions for wearing and caring for them.",
  },
  {
    title: "Treatment and check-ins",
    meta: "12–18 months on average",
    body: "You switch to each new set as directed, often every one to two weeks, and come in periodically so we can confirm your teeth are tracking.",
  },
  {
    title: "Retainers protect your result",
    meta: "Long-term",
    body: "Once your teeth are aligned, retainers keep them there: typically full-time for a short period, then at night long-term.",
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

const ageOptions: readonly ServiceOption[] = [
  {
    name: "Invisalign for teens",
    icon: "kids",
    tagline:
      "Features designed for teenage lifestyles, including compliance indicators and replacement aligners for lost or broken ones.",
    features: ["Blue dot wear indicators", "Replacement aligners included", "Designed for growing mouths"],
  },
  {
    name: "Invisalign for adults",
    icon: "aligner",
    tagline:
      "Discreet treatment for working adults who want to improve their smile without changing how they look at work.",
    features: ["Clear, discreet aligners", "Minimal lifestyle disruption", "No dietary restrictions"],
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
      pageName: "Invisalign in Palo Alto",
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
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="invisalign-hero"
        chips={["PPO ortho benefits checked first"]}
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

      <Section id="invisalign-candidacy" tone="white" labelledBy="invisalign-candidacy-title">
        <JumpNav
          items={[
            { href: "#invisalign-candidacy", label: "Is it right for me?" },
            { href: "#invisalign-process", label: "How it works" },
            { href: "#invisalign-care", label: "Aftercare & retainers" },
            { href: "#invisalign-cost", label: "Cost & insurance" },
            { href: "#invisalign-faq", label: "FAQ" },
          ]}
        />
        <QuickFacts facts={facts} className="mt-6" />
        <ReviewedBy date="2026-10-16" className="mt-5" />

        <div className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="invisalign-candidacy-title"
            eyebrow="Is it right for you?"
            title={
              <>
                Is Invisalign right <em>for you?</em>
              </>
            }
            lead="Invisalign can treat many alignment and bite concerns, but the best option depends on your bite, gum health, and goals. The most important factor for success is consistent wear, typically 20–22 hours per day."
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
      </Section>

      <Section id="what-is-invisalign" tone="cream" labelledBy="what-is-invisalign-title">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              id="what-is-invisalign-title"
              eyebrow="The basics"
              title={
                <>
                  What Invisalign is, and <em>how it works</em>
                </>
              }
            />
            <div className="prose-rooted mt-5 space-y-4">
              <p>
                Invisalign® is a clear aligner system that straightens teeth using a series of custom-made, removable
                trays. Each set makes small, controlled movements, and you progress through aligners as directed so
                your smile improves step by step.
              </p>
              <p>
                Because aligners are removable, you can eat normally and keep up with brushing and flossing. Your plan
                is based on a comprehensive exam and a digital scan, so tooth movement is mapped precisely and
                monitored along the way. Dr. Wong keeps movement conservative: the goal is to move teeth accurately,
                comfortably, and in a way that stays stable, not just quickly.
              </p>
            </div>
            <Disclosure title="Is Invisalign faster than braces?" className="mt-5">
              <p>
                Sometimes, but not always. For the right case, Invisalign can be very efficient because treatment is
                digitally planned from the beginning and aligners make small, controlled movements in sequence. Braces
                may still be the better choice for certain complex cases, or for patients who know they’ll have trouble
                wearing removable aligners consistently. A personalized exam matters more than broad claims online.
              </p>
            </Disclosure>
          </div>
          <div className="min-w-0">
            <h3 className="h-card text-[1.4rem] sm:text-[1.6rem]">
              Invisalign for <em>every age</em>
            </h3>
            <p className="mt-2 text-[15px] leading-6 text-ink-soft sm:text-base sm:leading-7">
              Whether you’re a teenager or an adult, Invisalign offers age-appropriate options designed to fit your
              lifestyle and orthodontic needs.
            </p>
            <OptionCards options={ageOptions} columns={2} rail className="mt-5 md:grid-cols-1 md:gap-4" />
          </div>
        </div>
      </Section>

      <Section id="invisalign-process" tone="white" labelledBy="invisalign-process-title">
        <SectionHeading
          id="invisalign-process-title"
          eyebrow="Your visits, step by step"
          title={
            <>
              Your Invisalign <em>journey</em>
            </>
          }
          lead="From consultation to your new smile, here’s what to expect at our Palo Alto practice, and roughly how long each phase takes."
        />
        <div className="card mt-10 hidden p-8 lg:block">
          <PhaseTrack phases={phases} label="Typical Invisalign timeline" />
        </div>
        <StepList steps={visitSteps} className="mt-8 lg:mt-6" />
        <div className="mt-6 grid gap-3 lg:mt-8 lg:grid-cols-2 lg:items-end lg:gap-4">
          <Disclosure title="What can slow treatment down?">
            <p>
              The biggest factor you control is wear time. If aligners aren’t worn 20–22 hours a day, teeth may not
              track, which can mean delays, extra trays, or more refinements.
            </p>
            <DotList
              items={[
                "Skipping check-ins",
                "Losing trays and going too long without the right aligner",
                "Not wearing elastics as directed",
                "Bite issues that need slower, more controlled movement",
              ]}
            />
          </Disclosure>
          <GuideLinks
            columns={1}
            title="Read the full guide"
            guides={[{ href: "/blog/how-long-does-invisalign-take", title: "How long does Invisalign take?" }]}
            className="mt-3 lg:mt-0"
          />
        </div>

        <div className="mt-12 sm:mt-16">
          <h3 className="h-card text-[1.4rem] sm:text-[1.75rem]">
            Comfort and <em>technology</em>
          </h3>
          <FeatureGrid features={comfort} columns={4} headingLevel="h4" rail className="mt-5" />
        </div>
      </Section>

      <Section id="invisalign-care" tone="cream" labelledBy="invisalign-care-title">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-16 lg:gap-y-8">
          <div className="lg:col-start-1 lg:row-start-1">
            <SectionHeading
              id="invisalign-care-title"
              eyebrow="Details that keep you on track"
              title={
                <>
                  Attachments, aftercare, <em>and retainers</em>
                </>
              }
              lead="Many Invisalign plans include small details that make aligners more effective. We’ll explain what your case needs so there are no surprises."
            />
          </div>
          <div className="space-y-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
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
              <p>We’ll recommend the best option based on where your teeth are most likely to shift.</p>
            </Disclosure>
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
            <Disclosure title="Refinements">
              <p>
                Refinement aligners are common near the end to fine-tune details. Teeth don’t always move exactly as
                predicted, so refinements aren’t a sign anything went wrong.
              </p>
            </Disclosure>
            <Disclosure title="Caring for your aligners">
              <p>Proper care of your aligners is essential for successful treatment and good oral hygiene.</p>
              <DotList items={[...careInstructions]} />
            </Disclosure>
            <Disclosure title="Retainer care, and when to replace one">
              <DotList
                items={[
                  "Rinse after removal and clean daily",
                  "Avoid hot water, which can warp plastic",
                  "Store it in a protective case to prevent loss or pet damage",
                  "Bring retainers to checkups so we can confirm fit",
                ]}
              />
              <p>
                If a retainer cracks, feels loose, or no longer fits snugly, don’t wait. Small shifts can happen
                quickly, and a replacement is usually easier than correcting movement later.
              </p>
            </Disclosure>
          </div>
          <GuideLinks
            className="lg:col-start-1 lg:row-start-2"
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
            Invisalign cost in Palo Alto: <em>what affects it</em>
          </>
        }
        lead="Invisalign fees vary because every bite and timeline is different. After your exam and digital scan, you’ll get a clear, written estimate and a walk-through of insurance and payment options."
        drivers={costFactors}
        coverage="Many PPO plans include orthodontic benefits that can apply to Invisalign."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="invisalign-cost"
      >
        <div className="mt-3 space-y-3">
          <Disclosure title="Your consultation checklist">
            <DotList items={[...consultationChecklist]} />
          </Disclosure>
          <Link
            href="/patient-stories#invisalign-whitening-bonding-66yo"
            className="group flex min-h-14 items-center gap-3 rounded-[1.5rem] border border-cream-300/80 bg-white px-5 py-3.5 transition-colors hover:border-evergreen-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen-500"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-[1.1rem] font-medium text-ink">See a real patient story</span>
              <span className="mt-0.5 block text-sm leading-6 text-ink-muted">
                Invisalign combined with whitening and bonding for a natural, confident smile.
              </span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </CostPanel>

      <ServiceReviews
        tags={["gentle", "honest"]}
        note="Reviews about care at our office; none of these mention Invisalign specifically."
      />

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong creates and reviews every Invisalign plan from your 3D scan, keeps tooth movement conservative, and gives clear check-ins and retainer guidance so results stay stable."
      />

      <div id="invisalign-faq">
        <FAQSection
          title="Invisalign FAQs"
          subtitle="Clear answers to common questions about clear aligner treatment."
          items={invisalignFaqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="More ways we can help"
        subtitle="Other care from Dr. Wong and the team in Palo Alto."
      />
      <NearbyLine subject="Invisalign patients" />

      <RelatedServicePosts serviceSlug="invisalign" serviceName="Invisalign" category="Invisalign" />

      <CtaBand
        analyticsContext="invisalign-cta"
        title={
          <>
            Ready to see if Invisalign <em>fits?</em>
          </>
        }
        lead="Request a consultation online in about a minute, or call the front desk. You’ll leave your first visit with a scan, a clear plan, and an honest answer about whether aligners are right for you."
      />
    </>
  );
};

export default Invisalign;
