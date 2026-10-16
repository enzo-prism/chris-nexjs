import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleCheck, CircleDot, Clock, PenLine, Sparkles, SwatchBook } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { CtaBand } from "@/components/ds/CtaBand";
import { FactGrid, type Fact } from "@/components/ds/FactGrid";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewCard, type ReviewQuote } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { Steps, type Step } from "@/components/ds/Steps";
import { HandwrittenNote } from "@/components/trust/HandwrittenNote";
import { featuredQuote } from "@/data/reviewHighlights";
import { reviewsFor } from "@/data/serviceReviews";
import { officeInfo } from "@/lib/data";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildPracticeReference,
  type StructuredDataNode,
} from "@/lib/structuredData";

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Patient stories", path: "/patient-stories" },
];

// Real clinical photos from the case, already published on the site
// (Cloudinary, resized at the CDN before next/image). No before/after labels:
// the files don't record which visit each photo is from.
const cld = (path: string, w = 1000) =>
  `https://res.cloudinary.com/dhqpqfw6w/image/upload/c_limit,w_${w},q_auto/${path}`;

const caseStudy = {
  id: "invisalign-whitening-bonding-66yo",
  title: "Never too late for a new smile",
  subtitle: "A 66-year-old patient · alignment, whitening, and bonding",
  patientSummary: "She wanted a confident smile for everyday moments and photos.",
  summary:
    "A thoughtful sequence of orthodontics, whitening, and minimally invasive bonding created a brighter, fuller smile without aggressive drilling or veneers.",
  timeline:
    "Roughly 12 months with Invisalign®, 1 in-office Zoom! Whitening session, followed by precise bonding to close lower black triangles.",
  challenges: [
    "Crowding and rotated teeth that had shifted over time",
    "Black triangle spaces on the lower front teeth",
    "Darkened shade from years of coffee and tea",
  ],
  outcomes: [
    "Aligned, more balanced smile arc",
    "Brighter shade after whitening with a natural finish",
    "Closed black triangles for a fuller, more youthful look",
  ],
} as const;

const caseSteps: readonly Step[] = [
  {
    title: "Align with Invisalign®",
    meta: "About 12 months",
    body: "Clear aligners for about a year to gently align the crowded and rotated teeth.",
  },
  {
    title: "Brighten with ZOOM! whitening",
    meta: "1 visit",
    body: "One in-office Zoom! Whitening session after aligner therapy.",
  },
  {
    title: "Refine with bonding",
    meta: "Detailing",
    body: "Targeted composite bonding on the lower front teeth to close the black triangles.",
  },
];

const caseFacts: readonly Fact[] = [
  { icon: Clock, label: "Treatment span", value: "About 12 months of clear aligners" },
  { icon: Sparkles, label: "Finishing touch", value: "1 in-office Zoom! Whitening visit" },
  { icon: SwatchBook, label: "Detailing", value: "Composite bonding on the lower front teeth" },
];

const casePhotos = [
  { path: "v1765382511/IMG_8340_xzb2ng.webp", alt: "Close-up of the patient’s smile", ratio: "square" },
  { path: "v1765382511/IMG_8352_qyutwv.webp", alt: "A second close-up of the patient’s smile", ratio: "square" },
  { path: "v1765382510/IMG_8356_bjxk7p.webp", alt: "Front view of the patient’s teeth with cheek retractors", ratio: "wide" },
  { path: "v1765382510/IMG_8358_ksxmqv.webp", alt: "Side view of the patient’s teeth with cheek retractors", ratio: "wide" },
  { path: "v1765382511/IMG_8360_jdhsxg.webp", alt: "Opposite side view with cheek retractors, showing gold crowns on the back teeth", ratio: "wide" },
  { path: "v1765382511/IMG_8344_jdmiv8.webp", alt: "Front view of the patient’s front teeth", ratio: "wide" },
  { path: "v1765382511/IMG_8346_aqnhjl.webp", alt: "Side view of the patient’s teeth", ratio: "wide" },
  { path: "v1765382511/IMG_8348_rk2lap.webp", alt: "Side view of the patient’s teeth, with gold crowns on the back teeth", ratio: "wide" },
] as const;

const services = [
  { label: "Invisalign®", href: "/invisalign" },
  { label: "Teeth whitening", href: "/teeth-whitening-palo-alto" },
  { label: "Bonding vs. veneers", href: "/dental-veneers" },
] as const;

// Long relationships, in patients' own words (verbatim, guarded by
// `pnpm test:reviews` in client/src/data/serviceReviews.ts + reviewHighlights.ts).
const GENERATION_NAMES = ["Ross Veltman", "Seth Leslie", "Irma Gali"];
const generationQuotes: ReviewQuote[] = [
  ...reviewsFor(["family"], 8).filter((q) => GENERATION_NAMES.includes(q.name)),
  featuredQuote,
];

function buildSchema(): StructuredDataNode[] {
  const nodes: StructuredDataNode[] = [];
  const breadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbs) nodes.push(breadcrumbs);
  nodes.push({
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: caseStudy.title,
    description: caseStudy.summary,
    howPerformed: caseSteps.map((s) => s.body).join(" "),
    preparation: caseStudy.timeline,
    outcome: caseStudy.outcomes.join("; "),
    image: casePhotos.map((p) => cld(p.path, 1200)),
    procedureType: "Dental",
    provider: buildPracticeReference(),
    url: absoluteUrl(`/patient-stories#${caseStudy.id}`),
  });
  return nodes;
}

const PatientStories = () => {
  return (
    <>
      <StructuredData data={buildSchema()} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Patient stories"
        title={
          <>
            Real patients, <em>real stories</em>
          </>
        }
        lead="A closer look at one patient’s smile makeover with Dr. Wong and the team, a handwritten thank-you, and families who have trusted this office for generations."
        analyticsContext="patient-stories-hero"
        scheduleHref="/schedule?intent=cosmetic&source=patient-stories#appointment"
        showReviews
        media={
          <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-cream-200 shadow-lift">
              <Image
                src={cld(casePhotos[0].path, 1000)}
                alt={casePhotos[0].alt}
                width={1000}
                height={1000}
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="aspect-[4/3.4] h-auto w-full object-cover"
              />
            </div>
            <figcaption className="absolute -bottom-5 left-4 rounded-[1.25rem] border border-cream-300/80 bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:left-6">
              <span className="block text-xs font-bold uppercase tracking-[0.14em] text-evergreen-600">Featured case</span>
              <span className="mt-0.5 block font-heading text-lg text-ink">Aligners, whitening, then bonding</span>
            </figcaption>
          </figure>
        }
      />

      {/* --------------------------------------------------------- The case */}
      <Section id={caseStudy.id} tone="white" labelledBy="case-title" className="scroll-mt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <SectionHeading
              id="case-title"
              eyebrow="Case 01"
              title={
                <>
                  Never too late for <em>a new smile</em>
                </>
              }
            />
            <p className="mt-3 text-sm font-semibold text-evergreen-700">{caseStudy.subtitle}</p>
            <div className="prose-rooted mt-5 space-y-4">
              <p>{caseStudy.patientSummary}</p>
              <p>{caseStudy.summary}</p>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Services involved">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="pill min-h-11 transition-colors hover:border-gold-400 hover:text-ink">
                    {s.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-cream-100 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-ink-muted">
                  <CircleDot className="h-4 w-4 text-gold-600" aria-hidden="true" />
                  What bothered her
                </h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-6 text-ink-soft">
                  {caseStudy.challenges.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.5rem] bg-evergreen-50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-evergreen-700">
                  <CircleCheck className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                  Outcome
                </h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-6 text-ink">
                  {caseStudy.outcomes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="h-card text-[1.5rem]">How the plan was sequenced</h3>
            <p className="mt-2 text-[15px] leading-7 text-ink-soft">
              Align first, brighten next, then refine with bonding, so each step protects tooth structure
              and sets up the next.
            </p>
            <Steps steps={caseSteps} className="mt-6" />
          </div>
        </div>

        <FactGrid facts={caseFacts} className="mt-12 lg:grid-cols-3" />

        <div className="mt-12">
          <h3 className="h-card text-[1.5rem]">Photos from the case</h3>
          <p className="mt-2 text-[15px] leading-7 text-ink-soft">
            Smile, front, and side views of her teeth: aligner tracking, shade, and bonding detail.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {casePhotos.map((photo) => (
              <li key={photo.path}>
                <a
                  href={cld(photo.path, 1600)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-[1.25rem] border border-cream-300/80 bg-cream-100 shadow-soft outline-none focus-visible:ring-4 focus-visible:ring-evergreen-300"
                  aria-label={`${photo.alt} (opens the full-size photo)`}
                >
                  <Image
                    src={cld(photo.path, 800)}
                    alt={photo.alt}
                    width={800}
                    height={photo.ratio === "square" ? 800 : 600}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            Individual results vary. Every plan starts with an exam and a conversation about your goals.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/schedule?intent=cosmetic&source=patient-story#appointment"
            className="btn btn-primary btn-lg"
            data-analytics-context="patient-stories-case-request"
          >
            <CalendarDays aria-hidden="true" />
            Request a consultation
          </Link>
          <Link href="/contact" className="btn btn-outline btn-lg" data-analytics-context="patient-stories-case-question">
            Ask a question
          </Link>
        </div>
      </Section>

      {/* ------------------------------------------------------- A letter */}
      <Section id="letters" tone="paper" labelledBy="letters-title">
        <SectionHeading
          id="letters-title"
          eyebrow="Letters"
          title={
            <>
              Sometimes patients <em>write it down</em>
            </>
          }
          lead="A thank-you note that arrived after a bonding visit with Dr. Wong and Kelty."
        />
        <HandwrittenNote headingLevel="h3" className="mt-10" />
      </Section>

      {/* -------------------------------------------------- Generations */}
      <Section id="generations" tone="cream" labelledBy="generations-title">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            id="generations-title"
            eyebrow="Longer stories"
            title={
              <>
                Patients for decades, <em>families for generations</em>
              </>
            }
            lead="Some of the longest stories at this office are told in a single line of a review."
          />
          <Link href="/testimonials" className="btn btn-outline self-start lg:self-auto">
            Read all reviews
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="-mx-4 mt-10 md:mx-0">
          <ul className="snap-rail px-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
            {generationQuotes.map((q) => (
              <li key={q.name} className="w-[82vw] max-w-[22rem] md:w-auto md:max-w-none">
                <ReviewCard review={q} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------------------------------------------- Share your story */}
      <Section id="share" tone="white" spacing="tight" labelledBy="share-title">
        <div className="card flex flex-col items-start gap-6 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
              <PenLine className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="share-title" className="h-card text-[1.6rem] sm:text-[1.9rem]">
                Have a story <em>to share?</em>
              </h2>
              <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-soft">
                Tell the front desk at your next visit, or leave a Google review. Your words help neighbors
                decide whether this office is right for them.
              </p>
            </div>
          </div>
          <a
            href={officeInfo.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold btn-lg w-full md:w-auto"
            data-analytics-context="patient-stories-share"
          >
            Leave a Google review
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </Section>

      <CtaBand
        analyticsContext="patient-stories-cta"
        title={
          <>
            Your story starts <em>with a visit</em>
          </>
        }
        lead="Whether you want subtle refinements or a full smile refresh, the plan starts with an exam and a clear conversation about your goals and timeline."
      />
    </>
  );
};

export default PatientStories;
