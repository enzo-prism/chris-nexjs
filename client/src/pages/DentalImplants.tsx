import { Award, CalendarCheck, Clock, Heart, ScanLine, Shield, ShieldCheck, Smile, Stethoscope, Users } from "lucide-react";

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
import { Disclosure, DotList } from "@/components/services/Disclosure";
import { FeatureGrid, type Feature } from "@/components/services/FeatureList";
import { FitChecklist } from "@/components/services/FitChecklist";
import { GuideLinks } from "@/components/services/GuideLinks";
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

const PATH = "/dental-implants";
const SCHEDULE_HREF = "/schedule?intent=implants&source=implants-page#appointment";
const HERO_IMAGE = "/images/redesign/dr-wong-treatment-room-portrait.webp";

const facts: readonly Fact[] = [
  { icon: Stethoscope, label: "Planning", value: "Exam, X-rays, 3D imaging if needed" },
  { icon: ShieldCheck, label: "Placement", value: "Trusted surgical partners" },
  { icon: Clock, label: "Healing", value: "Often 3–6 months" },
  { icon: Smile, label: "Your new tooth", value: "Restored here by Dr. Wong" },
];

const benefits = [
  { label: "Natural look and feel", text: "Implants fuse with your jawbone, becoming a permanent part of your mouth." },
  { label: "Durability and longevity", text: "With proper care, dental implants can last many years." },
  { label: "Improved chewing ability", text: "Eat comfortably with stable chewing support." },
  { label: "Preservation of jawbone", text: "Implants help stimulate bone and support facial structure." },
  { label: "No impact on adjacent teeth", text: "Unlike bridges, implants don’t require altering healthy neighboring teeth." },
  { label: "Everyday confidence", text: "A complete smile that looks and functions more like natural teeth." },
  { label: "Straightforward maintenance", text: "Care for implants much like natural teeth, with brushing and flossing." },
] as const;

const implantTypes: readonly ServiceOption[] = [
  {
    name: "Single tooth implants",
    icon: "implant",
    tagline: "Ideal for replacing one missing tooth with a natural-looking restoration.",
  },
  {
    name: "Multiple tooth implants",
    icon: "implant",
    tagline: "Individual implants or implant-supported bridges to replace several missing teeth.",
  },
  {
    name: "Implant-supported dentures",
    icon: "tooth",
    tagline: "A secure and stable alternative to traditional dentures, improving comfort and function.",
  },
  {
    name: "All-on-4® / All-on-X concepts",
    icon: "crown",
    tagline: "For replacing a full arch of teeth, using strategically placed implants to support a full prosthetic arch.",
  },
];

const procedureSteps: readonly Step[] = [
  {
    title: "Consultation and treatment planning",
    meta: "At our office",
    body: "A comprehensive exam, including X-rays and potentially 3D imaging, plus a talk about your medical history, smile goals, and options. We coordinate surgical placement with trusted partners when needed.",
  },
  {
    title: "Implant placement",
    meta: "With a surgical partner",
    body: "The titanium implant post is surgically placed into the jawbone by a surgical partner, under local anesthesia when indicated.",
  },
  {
    title: "Osseointegration (healing)",
    meta: "About 3–6 months",
    body: "The implant post naturally fuses with your jawbone, creating a strong and stable foundation.",
  },
  {
    title: "Abutment placement",
    meta: "After healing",
    body: "Once osseointegration is complete, a small connector piece called an abutment is attached to the top of the implant post.",
  },
  {
    title: "Custom crown, restored here",
    meta: "At our office",
    body: "Impressions are taken to create a custom crown, and Dr. Wong restores the implant so it matches your natural teeth.",
  },
];

const careInstructions = [
  "Brush twice daily with a soft-bristled toothbrush and non-abrasive toothpaste",
  "Floss daily, paying special attention around the implant abutment",
  "Attend regular dental check-ups and professional cleanings every six months",
  "Avoid chewing extremely hard items like ice or hard candy directly on the implant",
  "Use a custom nightguard if you clench or grind your teeth",
] as const;

const approach: readonly Feature[] = [
  {
    icon: Award,
    title: "Careful planning and restoration",
    body: "From single-tooth cases to more complex restorations.",
  },
  {
    icon: ScanLine,
    title: "Thoughtful technology",
    body: "Digital imaging and planning tools support precise diagnosis and treatment coordination.",
  },
  {
    icon: Heart,
    title: "Personalized care",
    body: "We take time to understand your needs and create a tailored treatment plan.",
  },
  {
    icon: Shield,
    title: "Conservative approach",
    body: "We preserve natural tooth structure and recommend implants when they’re truly the best solution.",
  },
  {
    icon: Users,
    title: "Coordinated surgical partners",
    body: "When placement surgery is needed, we work with trusted surgical partners and restore the final crown in-office.",
  },
  {
    icon: CalendarCheck,
    title: "Long-term health focus",
    body: "Our goal is to restore function and help keep your smile healthy for years to come.",
  },
];

const costFactors = [
  "The number of implants needed",
  "The type of restoration (crown, bridge, denture)",
  "The need for preparatory procedures like bone grafting or sinus lifts",
  "The complexity of your individual case",
] as const;

const faqs: FAQEntry[] = [
  {
    question: "Is the dental implant procedure painful?",
    answer:
      "Most patients report minimal discomfort during the procedure, often comparable to a simple extraction. Local anesthesia is used, and post-operative discomfort is typically manageable with over-the-counter pain relievers.",
  },
  {
    question: "How long do dental implants last?",
    answer:
      "With proper care and regular dental visits, dental implants can last many years—often a lifetime. The crown attached to the implant may need replacement after 10-15 years due to normal wear and tear.",
  },
  {
    question: "How successful are dental implants?",
    answer:
      "Dental implants have a high success rate—typically above 95%—when carefully planned, placed by an experienced surgeon, and properly cared for.",
  },
  {
    question: "Can I get a dental implant if I have bone loss?",
    answer:
      "Yes, in many cases. Bone grafting procedures can augment the existing bone, creating a suitable foundation for implant placement. Dr. Wong will assess this during your consultation.",
  },
  {
    question: "How long will the entire dental implant process take?",
    answer:
      "The entire process can take anywhere from a few months to over a year, depending on the complexity of your case and the healing time required for osseointegration.",
  },
];

const relatedServices: RelatedServiceLink[] = [
  {
    href: "/restorative-dentistry",
    anchorText: "Restorative dentistry",
    description: "Fillings, crowns, and bridges to restore function.",
  },
  {
    href: "/crowns-palo-alto",
    anchorText: "Dental crowns",
    description: "Protect a cracked or heavily filled tooth before it needs replacing.",
  },
  {
    href: "/emergency-dental",
    anchorText: "Emergency dental care",
    description: "Fast help when you have sudden pain or a broken tooth.",
  },
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Dental implants", path: PATH },
];

const DentalImplants = () => {
  const schemas: StructuredDataNode[] = [
    buildServiceSchema({
      name: "Dental Implants",
      pageName: "Dental implants in Palo Alto",
      description:
        "Dental implant planning and restoration in Palo Alto: Dr. Wong plans and restores your implant in-office, with surgical placement coordinated through trusted partners.",
      slug: PATH,
      image: HERO_IMAGE,
      serviceType: "Dental implant restoration",
      procedure: {
        name: "Dental implant treatment (planning, placement by a surgical partner, and restoration)",
        bodyLocation: "Jaw and teeth",
        howPerformed:
          "A titanium implant post is placed in the jawbone by a surgical partner. After it fuses with the bone (osseointegration, often 3–6 months), an abutment is attached and Dr. Wong restores the implant with a custom crown in our office.",
        preparation:
          "A comprehensive exam with X-rays and 3D imaging (CBCT) if necessary; gum disease is treated first, and bone grafting may be recommended.",
        followup:
          "Brushing, flossing around the abutment, professional cleanings every six months, and a custom nightguard if you clench or grind.",
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
        icon="implant"
        eyebrow="Implant planning & restoration"
        title={
          <>
            Dental implants in <em>Palo Alto</em>
          </>
        }
        lead="Missing one or more teeth? Dr. Christopher B. Wong plans your implant and restores it in our office, with trusted surgical partners for placement, so your new tooth looks and works like the rest of your smile."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="implants-hero"
        chips={["Final crown restored in-office"]}
        media={
          <ServicePhoto
            src={HERO_IMAGE}
            alt="Dr. Christopher B. Wong seated in a treatment room"
            focus="50% 14%"
            aspect="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/6]"
            badge={
              <PhotoBadge icon="implant" title="Planned and restored here">
                Placement by trusted surgical partners; your crown is restored in our office.
              </PhotoBadge>
            }
          />
        }
      />

      <Section id="implants-candidacy" tone="white" labelledBy="implants-candidacy-title">
        <JumpNav
          items={[
            { href: "#implants-candidacy", label: "Am I a candidate?" },
            { href: "#implants-process", label: "The process" },
            { href: "#implant-options", label: "Implant options" },
            { href: "#implants-cost", label: "Cost" },
            { href: "#implants-faq", label: "FAQ" },
          ]}
        />
        <QuickFacts facts={facts} className="mt-6" />
        <ReviewedBy date="2026-10-16" className="mt-5" />

        <div className="mt-12 grid gap-8 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading
            id="implants-candidacy-title"
            eyebrow="Is it right for you?"
            title={
              <>
                Are you a candidate for <em>dental implants?</em>
              </>
            }
            lead="Many people in Palo Alto who are missing teeth are excellent candidates for dental implants. During your consultation, Dr. Wong conducts a thorough examination, including 3D imaging (CBCT scans if necessary), to see whether implants are the right solution for you."
          />
          <FitChecklist
            goodTitle="Ideal candidates usually have"
            good={[
              { label: "Good overall health", text: "Certain uncontrolled chronic conditions may affect healing." },
              { label: "Sufficient jawbone density", text: "Adequate bone is needed to support the implant." },
              { label: "Healthy gums", text: "Gum disease needs treatment before implant placement." },
              { label: "A commitment to oral hygiene", text: "Good daily care is crucial for long-term success." },
            ]}
            plan={[
              { label: "Smoking", text: "Non-smokers are preferred; smoking can impede healing and increase the risk of implant failure." },
              { label: "Bone loss", text: "Bone grafting can often augment existing bone to create a suitable foundation." },
            ]}
          />
        </div>
      </Section>

      <Section id="what-are-implants" tone="cream" labelledBy="what-are-implants-title">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              id="what-are-implants-title"
              eyebrow="The basics"
              title={
                <>
                  Why choose <em>dental implants?</em>
                </>
              }
            />
            <div className="prose-rooted mt-5 space-y-4">
              <p>
                A dental implant is a titanium post that fuses with your jawbone and supports a custom crown, an
                implant bridge, or a denture. Implants are a well-established option for tooth replacement, and
                compared with bridges or removable dentures they offer several practical advantages.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-evergreen-800 text-gold-300">
                  <ServiceIcon name="implant" className="h-6 w-6" animated={false} />
                </span>
                <h3 className="mt-3 font-heading text-[1.1rem] font-medium leading-snug text-ink">
                  Placed by a trusted surgical partner
                </h3>
                <p className="mt-1 text-[15px] leading-6 text-ink-soft">
                  When surgical placement is needed, we coordinate it with trusted surgical partners.
                </p>
              </div>
              <div className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-200 text-gold-700">
                  <ServiceIcon name="crown" className="h-6 w-6" animated={false} />
                </span>
                <h3 className="mt-3 font-heading text-[1.1rem] font-medium leading-snug text-ink">
                  Planned and restored by Dr. Wong
                </h3>
                <p className="mt-1 text-[15px] leading-6 text-ink-soft">
                  He plans your treatment and restores the final crown in our office so it matches your natural teeth.
                </p>
              </div>
            </div>
          </div>
          <ul className="card divide-y divide-cream-300/70 px-5 sm:px-7">
            {benefits.map((benefit) => (
              <li key={benefit.label} className="flex gap-3 py-3.5">
                <ServiceIcon name="checkup" className="mt-0.5 h-6 w-6 shrink-0 text-evergreen-600" animated={false} />
                <span className="text-[15px] leading-6 text-ink-soft">
                  <strong className="font-semibold text-ink">{benefit.label}.</strong> {benefit.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="implants-process" tone="white" labelledBy="implants-process-title">
        <SectionHeading
          id="implants-process-title"
          eyebrow="Your visits, step by step"
          title={
            <>
              The dental implant process <em>with Dr. Wong</em>
            </>
          }
          lead="Implant care is a multi-step process tailored to your needs. Dr. Wong plans your treatment, coordinates surgical placement with trusted partners when needed, and restores the final crown in our Palo Alto office."
        />
        <StepList steps={procedureSteps} columns={3} className="mt-8" />
        <div className="mt-6 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-4">
          <Disclosure title="Caring for your implants for lifelong success">
            <p>Maintaining dental implants is straightforward and similar to caring for your natural teeth:</p>
            <DotList items={[...careInstructions]} />
          </Disclosure>
          <GuideLinks
            columns={1}
            title="Timing after an extraction"
            className="mt-3 lg:mt-0"
            guides={[{ href: "/blog/dental-implant-after-extraction-palo-alto", title: "How long after an extraction can you get an implant?" }]}
          />
        </div>

        <div className="mt-12 sm:mt-16">
          <h3 className="h-card text-[1.4rem] sm:text-[1.75rem]">
            Comfort, technology, <em>and approach</em>
          </h3>
          <FeatureGrid features={approach} columns={3} headingLevel="h4" rail className="mt-5" />
        </div>
      </Section>

      <Section id="implant-options" tone="cream" labelledBy="implant-options-title">
        <SectionHeading
          id="implant-options-title"
          eyebrow="Options"
          title={
            <>
              Types of implant <em>restorations</em>
            </>
          }
          lead="Depending on your specific situation, Dr. Wong may recommend different types of implant solutions."
        />
        <OptionCards options={implantTypes} columns={4} rail className="mt-8" />
        <GuideLinks
          className="mt-6"
          columns={1}
          title="Comparing options"
          guides={[{ href: "/blog/dental-implants-vs-bridge-palo-alto", title: "Implant or bridge? How to choose tooth replacement" }]}
        />
      </Section>

      <CostPanel
        id="implants-cost"
        tone="white"
        title={
          <>
            Dental implant cost in Palo Alto: <em>what affects it</em>
          </>
        }
        lead="While dental implants may cost more initially than other tooth replacement options, their longevity and function often make them a sound long-term choice. During your consultation, we’ll provide a clear breakdown of costs for your treatment plan."
        drivers={costFactors}
        coverage="Implant benefits vary widely from plan to plan."
        scheduleHref={SCHEDULE_HREF}
        analyticsContext="implants-cost"
      />

      <ServiceReviews
        tags={["gentle", "honest"]}
        note="Reviews about care at our office; none of these mention implants specifically."
      />

      <WhoTreats
        teamSlugs={["jamal", "rachel"]}
        intro="Dr. Wong plans your implant, coordinates placement with trusted surgical partners, and restores the final crown in our office so it matches your natural teeth."
      />

      <div id="implants-faq">
        <FAQSection
          title="Dental implant FAQs"
          subtitle="Comfort, success rates, bone loss, and how long the process takes."
          items={faqs}
        />
      </div>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="See other treatments we offer in Palo Alto."
      />
      <NearbyLine subject="Implant patients" />

      <RelatedServicePosts serviceSlug="dental-implants" serviceName="Dental Implants" />

      <CtaBand
        analyticsContext="implants-cta"
        title={
          <>
            Request a dental implant <em>consultation</em>
          </>
        }
        lead="If you’d like to learn whether dental implants are a good fit, request a consultation with Dr. Christopher B. Wong. We’ll review your options and outline a clear next step."
      />
    </>
  );
};

export default DentalImplants;
