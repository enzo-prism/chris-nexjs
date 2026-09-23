import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";

import ButtonLink from "@/components/common/ButtonLink";
import FAQSection from "@/components/common/FAQSection";
import OfficeHoursSummary from "@/components/common/OfficeHoursSummary";
import StructuredData from "@/components/seo/StructuredData";
import CarePathsSection from "@/components/sections/CarePathsSection";
import CostClaritySection from "@/components/sections/CostClaritySection";
import DoctorTeamSection from "@/components/sections/DoctorTeamSection";
import HeroSection from "@/components/sections/HeroSection";
import PatientProofSection from "@/components/sections/PatientProofSection";
import { officeInfo } from "@/lib/data";
import {
  buildFAQSchema,
  type FAQEntry,
} from "@/lib/structuredData";

const homeFaqs: FAQEntry[] = [
  {
    question: "Are you accepting new patients?",
    answer:
      "Yes—new patients are welcome. We’ll start with a thorough exam and a clear conversation about your goals, concerns, and the next best steps.",
  },
  {
    question: "Do you accept dental insurance?",
    answer:
      "We work with most major PPO dental insurance plans as an out-of-network provider. Share your plan information and our team will help verify benefits and walk through expected costs before you commit to treatment.",
  },
  {
    question: "What if I have a dental emergency?",
    answer:
      "If you have significant pain, swelling, or a broken tooth, call our office as soon as possible. We’ll help you understand what to do next and schedule urgent care when available.",
  },
  {
    question: "How do I schedule an appointment?",
    answer:
      "You can request an appointment online or call our office. We’ll confirm a time and help you prepare for your first visit.",
  },
];

const visitPlanningSteps = [
  {
    icon: CalendarDays,
    title: "Tell us what you need",
    description:
      "Pick a visit type, from a new-patient exam to urgent care. It takes about a minute.",
  },
  {
    icon: Phone,
    title: "Add your insurance, if any",
    description:
      "We check your PPO benefits so you know your portion before treatment.",
  },
  {
    icon: CheckCircle2,
    title: "We confirm a time",
    description:
      "The team calls or emails within one business day to confirm your visit.",
  },
] as const;

const Home = () => {
  const faqSchema = buildFAQSchema(homeFaqs, "/");

  return (
    <>
      <StructuredData data={faqSchema ? [faqSchema] : []} />
      <HeroSection />

      <nav
        aria-label="For current patients"
        className="border-b border-slate-200 bg-slate-50"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 text-sm sm:px-6 lg:px-8">
          <span className="font-semibold text-slate-700">Already a patient?</span>
          <Link
            href="/patient-resources"
            className="ui-link-premium inline-flex min-h-11 items-center gap-1.5"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Patient forms
          </Link>
          <Link
            href="/contact"
            className="ui-link-premium inline-flex min-h-11 items-center gap-1.5"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            Hours &amp; closures
          </Link>
          <a
            href={`tel:${officeInfo.phoneE164}`}
            data-analytics-context="current-patient-bar"
            className="ui-link-premium inline-flex min-h-11 items-center gap-1.5"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {officeInfo.phone}
          </a>
        </div>
      </nav>

      <CarePathsSection />
      <DoctorTeamSection />
      <CostClaritySection />
      <PatientProofSection />

      <section
        id="palo-alto-dentist"
        aria-labelledby="visit-office-title"
        className="bg-white py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Visiting the office
              </p>
              <h2
                id="visit-office-title"
                className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl"
              >
                In Palo Alto’s California Avenue district
              </h2>
              <p className="mt-6 text-pretty text-lg leading-8 text-slate-700">
                At our Cambridge Avenue office, the team provides modern,
                conservative dentistry for children, teens, and adults. Patients
                visit us from Palo Alto, Stanford, Menlo Park, Mountain View,
                and nearby Peninsula communities.
              </p>
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Nearby Communities
                </p>
                <nav
                  aria-label="Dental office service areas"
                  className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-sm"
                >
                  <span className="font-semibold text-slate-950">Palo Alto</span>
                  <Link href="/dentist-menlo-park" className="ui-link-premium">
                    Menlo Park
                  </Link>
                  <Link href="/dentist-stanford" className="ui-link-premium">
                    Stanford
                  </Link>
                  <Link href="/dentist-mountain-view" className="ui-link-premium">
                    Mountain View
                  </Link>
                  <Link href="/locations" className="ui-link-premium">
                    View all nearby communities
                  </Link>
                </nav>
              </div>
            </div>

            <aside className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F4F8FC] shadow-[0_28px_70px_-44px_rgba(15,23,42,0.52)]">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src="/images/office/quiet-garden-courtyard.webp"
                  alt="Garden courtyard visible from the Palo Alto dental treatment rooms"
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <p className="absolute bottom-4 left-5 right-5 text-sm font-medium text-white">
                  Garden-facing treatment rooms on Cambridge Avenue
                </p>
              </div>

              <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 xl:p-7">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    Office Location
                  </div>
                  <address className="mt-2 text-sm not-italic leading-6 text-slate-700">
                    {officeInfo.address.line1}
                    <br />
                    {officeInfo.address.line2}
                  </address>
                  <a
                    href={officeInfo.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-link-premium mt-3 inline-flex min-h-11 items-center"
                  >
                    Get directions
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                    Regular Hours
                  </div>
                  <OfficeHoursSummary
                    className="mt-2 text-sm text-slate-700"
                    noteClassName="text-slate-600"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <FAQSection
        title="Palo Alto Dentist FAQs"
        subtitle="Quick answers about visiting our office, insurance, and scheduling."
        items={homeFaqs}
        className="bg-white py-16 md:py-24"
      />

      <section
        id="appointment"
        aria-labelledby="appointment-title"
        className="bg-[#F4F8FC] px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0B1F3A] px-6 py-10 text-white shadow-[0_32px_80px_-46px_rgba(11,31,58,0.8)] sm:px-10 md:py-14 lg:px-14">
          <div
            className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
                  Your Next Visit
                </p>
                <h2
                  id="appointment-title"
                  className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                >
                  Ready when you are
                </h2>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-200 md:text-lg">
                  Request a visit online in about a minute, or call and talk to
                  the front desk. Either way, you&apos;ll know your next step
                  before you hang up or close the page.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px]">
                <ButtonLink
                  href="/schedule#appointment"
                  size="lg"
                  className="min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#0B1F3A] shadow-lg transition-[background-color,box-shadow,transform] hover:bg-sky-50"
                >
                  Request an appointment
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="ui-focus-premium inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-base font-semibold text-white transition-[background-color,border-color] hover:border-white/45 hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call {officeInfo.phone}
                </a>
              </div>
            </div>

            <div className="mt-10 grid gap-4 border-t border-white/15 pt-8 md:grid-cols-3">
              {visitPlanningSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sky-200">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
