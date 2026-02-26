"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import StructuredData from "@/components/seo/StructuredData";
import ButtonLink from "@/components/common/ButtonLink";
import { ArrowRight, BadgePercent, CheckCircle, Gift, Phone } from "lucide-react";
import Link from "next/link";
import { Service, Testimonial } from "@shared/schema";
import { officeInfo } from "@/lib/data";
import AppointmentForm from "@/components/forms/AppointmentForm";
import {
  buildFAQSchema,
  type FAQEntry,
} from "@/lib/structuredData";

const FeaturesSection = dynamic(
  () => import("@/components/sections/FeaturesSection"),
  { ssr: false, loading: () => null },
);
const AboutDoctorSection = dynamic(
  () => import("@/components/sections/AboutDoctorSection"),
  { ssr: false, loading: () => null },
);
const FAQSection = dynamic(
  () => import("@/components/common/FAQSection"),
  { ssr: false, loading: () => null },
);
const ServiceCard = dynamic(
  () => import("@/components/common/ServiceCard"),
  { ssr: false, loading: () => null },
);
const TestimonialCard = dynamic(
  () => import("@/components/common/TestimonialCard"),
  { ssr: false, loading: () => null },
);

type HomeProps = {
  initialServices?: Service[];
  initialTestimonials?: Testimonial[];
};

const Home = (props: any) => {
  const {
    initialServices = [],
    initialTestimonials = [],
  } = (props ?? {}) as HomeProps;
  const testimonialsToShow = initialTestimonials.slice(0, 4);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (testimonialsToShow.length === 0) return;
    const container = event.currentTarget;
    const cardWidth = container.firstElementChild?.clientWidth ?? 1;
    const scrollLeft = container.scrollLeft;
    const index = Math.round(scrollLeft / cardWidth);
	    setActiveTestimonial(Math.min(Math.max(index, 0), testimonialsToShow.length - 1));
	  };

    const homeFaqs: FAQEntry[] = [
      {
        question: "Where is your Palo Alto dental office located?",
        answer: `Our office is located at ${officeInfo.address.line1}, ${officeInfo.address.line2}. Use the directions link on this page or call our team if you’d like parking tips before your visit.`,
      },
      {
        question: "Are you accepting new patients?",
        answer:
          "Yes—new patients are welcome. We’ll start with a thorough exam and a clear conversation about your goals, concerns, and the next best steps.",
      },
      {
        question: "What services do you offer?",
        answer:
          "We offer preventive checkups and cleanings, cosmetic dentistry, Invisalign, restorative care, and emergency dental visits. Explore our services page for details and common next steps.",
      },
      {
        question: "Do you accept dental insurance?",
        answer:
          "We work with many PPO insurance plans. If you share your plan information, our team can help verify benefits and walk through expected costs before you commit to treatment.",
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

    const schemaNodes = [];
    const faqSchema = buildFAQSchema(homeFaqs, "/");
    if (faqSchema) {
      schemaNodes.push(faqSchema);
    }

	  return (
	    <>
      <StructuredData data={schemaNodes} />
      <HeroSection />

      {/* Local relevance section */}
      <section id="palo-alto-dentist" className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
                Dentist in Palo Alto, CA
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                If you’re looking for a dentist in Palo Alto, our team provides
                modern, conservative dentistry focused on long‑term comfort and
                oral health. We welcome patients from Palo Alto, Stanford,
                Menlo Park, and nearby Peninsula neighborhoods.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                From checkups and cleanings to Invisalign, cosmetic veneers, and
                restorative care, we’ll explain what we see and help you choose
                a plan that fits your goals and schedule.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Explore focused treatments including{" "}
                <Link href="/restorative-dentistry" className="text-primary font-semibold hover:underline">
                  restorative dentistry
                </Link>{" "}
                and{" "}
                <Link href="/pediatric-dentistry" className="text-primary font-semibold hover:underline">
                  pediatric dentistry
                </Link>{" "}
                for children, teens, and adults.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Our Palo Alto dental office is located at {officeInfo.address.line1},{" "}
                {officeInfo.address.city}, {officeInfo.address.region} {officeInfo.address.postalCode}.
              </p>
              <p className="text-sm text-slate-600">
                Nearby communities:{" "}
                <Link
                  href="/dentist-menlo-park"
                  className="text-primary font-semibold hover:underline"
                >
                  Menlo Park families
                </Link>
                ,{" "}
                <Link
                  href="/dentist-stanford"
                  className="text-primary font-semibold hover:underline"
                >
                  Stanford patients
                </Link>
                ,{" "}
                <Link
                  href="/dentist-mountain-view"
                  className="text-primary font-semibold hover:underline"
                >
                  Mountain View families
                </Link>
                ,{" "}
                <Link
                  href="/dentist-los-altos"
                  className="text-primary font-semibold hover:underline"
                >
                  Los Altos patients
                </Link>
                ,{" "}
                <Link
                  href="/dentist-los-altos-hills"
                  className="text-primary font-semibold hover:underline"
                >
                  Los Altos Hills patients
                </Link>
                ,{" "}
                <Link
                  href="/dentist-sunnyvale"
                  className="text-primary font-semibold hover:underline"
                >
                  Sunnyvale families
                </Link>
                ,{" "}
                <Link
                  href="/dentist-cupertino"
                  className="text-primary font-semibold hover:underline"
                >
                  Cupertino families
                </Link>
                ,{" "}
                <Link
                  href="/dentist-redwood-city"
                  className="text-primary font-semibold hover:underline"
                >
                  Redwood City patients
                </Link>
                ,{" "}
                <Link
                  href="/dentist-atherton"
                  className="text-primary font-semibold hover:underline"
                >
                  Atherton patients
                </Link>
                , and{" "}
                <Link
                  href="/dentist-redwood-shores"
                  className="text-primary font-semibold hover:underline"
                >
                  Redwood Shores patients
                </Link>
                .
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service areas
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Palo Alto</span>
                  <Link href="/dentist-menlo-park" className="text-primary font-semibold hover:underline">
                    Menlo Park
                  </Link>
                  <Link href="/dentist-stanford" className="text-primary font-semibold hover:underline">
                    Stanford
                  </Link>
                  <Link href="/dentist-mountain-view" className="text-primary font-semibold hover:underline">
                    Mountain View
                  </Link>
                  <Link href="/dentist-los-altos" className="text-primary font-semibold hover:underline">
                    Los Altos
                  </Link>
                  <Link href="/dentist-los-altos-hills" className="text-primary font-semibold hover:underline">
                    Los Altos Hills
                  </Link>
                  <Link href="/dentist-sunnyvale" className="text-primary font-semibold hover:underline">
                    Sunnyvale
                  </Link>
                  <Link href="/dentist-cupertino" className="text-primary font-semibold hover:underline">
                    Cupertino
                  </Link>
                  <Link href="/dentist-redwood-city" className="text-primary font-semibold hover:underline">
                    Redwood City
                  </Link>
                  <Link href="/dentist-atherton" className="text-primary font-semibold hover:underline">
                    Atherton
                  </Link>
                  <Link href="/dentist-redwood-shores" className="text-primary font-semibold hover:underline">
                    Redwood Shores
                  </Link>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <ButtonLink
                  href="/schedule#appointment"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Request an appointment
                </ButtonLink>
                <ButtonLink
                  href="/services"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Explore dental services
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-100 bg-[#F5F9FC] p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                    Office location
                  </h3>
                  <p className="mt-2 text-slate-800 leading-relaxed">
                    {officeInfo.address.line1}
                    <br />
                    {officeInfo.address.line2}
                  </p>
                  <a
                    href={officeInfo.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-primary font-semibold hover:underline"
                  >
                    Get directions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                    Call
                  </h3>
                  <a
                    href={`tel:${officeInfo.phoneE164}`}
                    className="mt-2 inline-flex items-center text-slate-800 font-semibold hover:text-primary transition-colors"
                  >
                    {officeInfo.phone}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
                    Hours
                  </h3>
                  <p className="mt-2 text-slate-700 leading-relaxed text-sm">
                    Mon–Thu: {officeInfo.hours.monday}
                    <br />
                    Fri: {officeInfo.hours.friday}
                    <br />
                    Sat–Sun: {officeInfo.hours.saturday}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Limited-time offers */}
      <section id="offers" className="py-14 md:py-20 bg-gradient-to-b from-white via-[#F5F9FC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <BadgePercent className="h-4 w-4" />
                Limited-time offers
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
                New patient specials
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Start your care with added value. These offers are available for a short time and
                designed to make your first visit feel even better.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ButtonLink
                  href="/schedule#appointment"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Claim an offer
                </ButtonLink>
                <ButtonLink
                  href="/contact"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Ask a question
                </ButtonLink>
              </div>
              <p className="text-xs text-slate-500">
                Offers are available for new patients and subject to availability.
              </p>
            </div>

            <div className="lg:col-span-8 grid gap-6 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" aria-hidden="true" />
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-[0.18em]">
                  <Gift className="h-4 w-4" />
                  New patient gift
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">
                  Free premium toothbrush
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Included with your first exam and cleaning. Ask our team to reserve yours when you schedule.
                </p>
                <Link href="/schedule#appointment" className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  Book your first visit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-blue-100/70 blur-2xl" aria-hidden="true" />
                <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-[0.18em]">
                  <BadgePercent className="h-4 w-4" />
                  Invisalign savings
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">
                  $1,000 off Invisalign treatment
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Save on a personalized Invisalign plan with clear aligners and digital planning.
                </p>
                <Link href="/invisalign" className="mt-4 inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-800">
                  Explore Invisalign
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials Spotlight */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white via-[#F5F9FC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">Loved by our patients</h2>
          </div>

          <div className="w-full">
            <div
              className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 sm:hidden"
              onScroll={handleScroll}
            >
              {testimonialsToShow.map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className="snap-center shrink-0 basis-full px-4"
                  style={{ minWidth: "0" }}
                >
                  <TestimonialCard testimonial={testimonial} index={index} />
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              {testimonialsToShow.map((_, index) => (
                <span
                  key={`dot-${index}`}
                  className={`h-2.5 w-2.5 rounded-full transition-[width,background-color] ${
                    activeTestimonial === index ? "bg-primary w-3" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            <div className="hidden grid-cols-2 gap-6 sm:grid xl:grid-cols-4">
              {testimonialsToShow.map((testimonial, index) => (
                <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} index={index} />
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <ButtonLink
              href="/testimonials"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white shadow-sm transition-[transform,box-shadow,background-color] hover:scale-105 hover:bg-primary/90 hover:shadow-md"
            >
              Read more patient stories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <FeaturesSection />

      {/* About Section */}
      <AboutDoctorSection />

      {/* Services Section */}
      <section
        id="services"
        className="bg-gradient-to-b from-white to-gray-50/30 py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-6 font-heading text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              Our Services
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 md:text-xl">
              Comprehensive dental care using the latest techniques and
              technology to improve your oral health and enhance your smile.{" "}
              <Link
                href="/invisalign"
                className="font-semibold text-primary hover:underline"
              >
                Invisalign in Palo Alto
              </Link>{" "}
              offers a discreet way to straighten teeth with a personalized
              plan.
            </p>
            <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-primary" />
          </div>

          {/* Services Grid - Responsive: 1 column on mobile, 3 columns on desktop */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
            {initialServices.slice(0, 3).map((service) => (
              <div key={service.id} className="h-full">
                <ServiceCard service={service} />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-16 text-center">
            <ButtonLink
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-white shadow-sm transition-[transform,box-shadow,background-color] hover:scale-105 hover:bg-primary/90 hover:shadow-md"
            >
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <FAQSection
        title="Palo Alto dentist FAQs"
        subtitle="Quick answers about visiting our office, insurance, and scheduling."
        items={homeFaqs}
        className="bg-white"
      />

      {/* Appointment Section */}
      <section id="appointment" className="bg-[#F5F9FC] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="md:flex">
              <div className="bg-primary p-8 text-white md:w-1/2 md:p-12">
                <h2 className="mb-4 font-heading text-3xl font-bold">
                  Schedule Your Appointment
                </h2>
                <p className="mb-6">
                  Choose between in-person visits or convenient virtual
                  consultations for your initial assessment.
                </p>
                <div className="mb-6">
                  <div className="mb-3 flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    <span>HIPAA-compliant secure scheduling</span>
                  </div>
                  <div className="mb-3 flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    <span>Same-day appointments available</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    <span>Easy rescheduling if needed</span>
                  </div>
                </div>
                <div className="mb-6 rounded-lg bg-blue-900 p-4 bg-opacity-50">
                  <h3 className="mb-2 font-bold">Office Hours</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Monday - Thursday</div>
                    <div>{officeInfo.hours.monday}</div>
                    <div>Friday</div>
                    <div>{officeInfo.hours.friday}</div>
                    <div>Saturday - Sunday</div>
                    <div>{officeInfo.hours.saturday}</div>
                  </div>
                </div>
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="flex items-center text-xl font-bold transition-colors hover:text-blue-200"
                >
                  <Phone className="mr-2 h-6 w-6" aria-hidden="true" />
                  {officeInfo.phone}
                </a>
              </div>

              <div className="p-8 md:w-1/2 md:p-12">
                <h3 className="mb-4 font-heading text-xl font-bold text-[#333333]">
                  Book Your Visit
                </h3>
                <p className="mb-6 text-[#333333]">
                  Fill out the form below to schedule your appointment. We'll
                  get back to you promptly to confirm your visit.
                </p>
                <AppointmentForm
                  className="min-h-[320px] w-full sm:min-h-[400px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
