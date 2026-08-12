"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import HeroSection from "@/components/sections/HeroSection";
import StructuredData from "@/components/seo/StructuredData";
import ButtonLink from "@/components/common/ButtonLink";
import AnimatedFlowDivider from "@/components/common/animated/AnimatedFlowDivider";
import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Quote,
} from "lucide-react";
import Link from "next/link";
import type { InsertTestimonial, Service } from "@shared/schema";
import { officeInfo } from "@/lib/data";
import { useHolidayHours } from "@/hooks/useHolidayHours";
import { isNoAdditionalCommentPlaceholder } from "@/lib/testimonialText";
import {
  buildFAQSchema,
  type FAQEntry,
} from "@/lib/structuredData";

const FeaturesSection = dynamic(
  () => import("@/components/sections/FeaturesSection"),
  { ssr: true, loading: () => null },
);
const AboutDoctorSection = dynamic(
  () => import("@/components/sections/AboutDoctorSection"),
  { ssr: true, loading: () => null },
);
const FAQSection = dynamic(
  () => import("@/components/common/FAQSection"),
  { ssr: true, loading: () => null },
);
const ServiceCard = dynamic(
  () => import("@/components/common/ServiceCard"),
  { ssr: true, loading: () => null },
);
type HomeProps = {
  readonly initialServices?: Service[];
};

const homeSpotlightTestimonials: readonly InsertTestimonial[] = [
  {
    name: "Marypat Power",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "Dr Kris and Dr Wong are both so personable, professional, and gentle. I highly recommend them!",
  },
  {
    name: "Steve Collins",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "High skill level, modern tools, helpful guidance and a friendly demeanor. An excellent experience for cleanings and fillings. Strong recommend.",
  },
  {
    name: "Anne Starr",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "Dr. Hamamoto did great passing her practice to Dr. Wong! He is great! Helen and Angelisa are the best dental hygienists!",
  },
  {
    name: "Sarah Chase",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "Excellent care, I never worry about if I'm getting the best care or suggestions. I am always confident that the right amount of solutions are recommended. All the newest proven tech and services.",
  },
  {
    name: "Michael Austin",
    rating: 5,
    location: "Google Review",
    image: "",
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me. Kind and caring, gentle and good, and reasonably priced!",
  },
];

const Home = ({ initialServices = [] }: HomeProps) => {
  const testimonialsToShow = homeSpotlightTestimonials;
  const holiday = useHolidayHours();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialCount = testimonialsToShow.length;
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const getWrappedIndex = (index: number) => {
    if (testimonialCount === 0) return 0;
    return (index + testimonialCount) % testimonialCount;
  };

  const goToPreviousTestimonial = () => {
    if (testimonialCount === 0) return;
    setActiveTestimonial((current) => getWrappedIndex(current - 1));
  };

  const goToNextTestimonial = () => {
    if (testimonialCount === 0) return;
    setActiveTestimonial((current) => getWrappedIndex(current + 1));
  };

  const handleTestimonialPointerDown = (event: any) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleTestimonialPointerUp = (event: any) => {
    if (!swipeStartRef.current) return;

    const deltaX = event.clientX - swipeStartRef.current.x;
    const deltaY = event.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    const swipeThreshold = 45;
    if (Math.abs(deltaX) < swipeThreshold) return;

    if (deltaX < 0) {
      goToNextTestimonial();
      return;
    }

    goToPreviousTestimonial();
  };

  const resetSwipeStart = () => {
    swipeStartRef.current = null;
  };

  const handleTestimonialKeyDown = (event: any) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousTestimonial();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextTestimonial();
    }
  };

  useEffect(() => {
    if (!testimonialCount) return;
    if (activeTestimonial > testimonialCount - 1) {
      setActiveTestimonial(0);
    }
  }, [activeTestimonial, testimonialCount]);

  const trackWidthPercent = testimonialCount * 100;
  const slideWidthPercent = testimonialCount > 0 ? 100 / testimonialCount : 100;
  const trackTranslatePercent =
    testimonialCount > 0 ? (activeTestimonial * 100) / testimonialCount : 0;

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

  const schemaNodes = [];
  const faqSchema = buildFAQSchema(homeFaqs, "/");
  if (faqSchema) {
    schemaNodes.push(faqSchema);
  }

  return (
    <>
      <StructuredData data={schemaNodes} />
      <HeroSection />

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedFlowDivider
            idPrefix="home-hero-testimonials-divider"
            className="mx-auto h-16 max-w-4xl text-sky-500/55"
          />
        </div>
      </div>

      {/* Patient Testimonials Spotlight */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F8FC] via-white to-[#F8FBFF] py-16 md:py-24">
        <div
          className="pointer-events-none absolute left-[18%] top-16 h-72 w-72 rounded-full bg-[#DBEAFE]/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[12%] top-24 h-64 w-64 rounded-full bg-[#FDE68A]/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative text-center mb-12 md:mb-16">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#334155]">
              <Quote className="h-3.5 w-3.5 text-primary" />
              Testimonials
            </div>
            <h2 className="mt-4 text-3xl md:text-5xl font-bold font-heading text-[#1F2933]">
              What Our Patients Say
            </h2>
            <p className="mt-4 text-base md:text-xl text-slate-600 max-w-2xl mx-auto">
              Real stories from families who trust us with their smiles.
            </p>
          </div>

          {/* Desktop carousel (lg+) — rich photo + side quote + preview cards */}
          {testimonialCount > 0 && (
            <div
              className="relative mx-auto hidden max-w-6xl lg:block"
              onKeyDown={handleTestimonialKeyDown}
              tabIndex={0}
              role="region"
              aria-label="Patient testimonials carousel"
            >
              <button
                type="button"
                aria-label="Previous testimonial"
                className="absolute left-0 top-1/2 z-30 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:border-slate-300 hover:text-slate-900 lg:inline-flex"
                onClick={goToPreviousTestimonial}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                className="absolute right-0 top-1/2 z-30 hidden h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-md transition-colors hover:bg-primary/90 lg:inline-flex"
                onClick={goToNextTestimonial}
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div
                className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_60px_-38px_rgba(15,23,42,0.48)] touch-pan-y"
                onPointerDown={handleTestimonialPointerDown}
                onPointerUp={handleTestimonialPointerUp}
                onPointerCancel={resetSwipeStart}
                onPointerLeave={resetSwipeStart}
              >
                <div
                  className="flex transition-transform duration-500 ease-out will-change-transform"
                  style={{
                    width: `${trackWidthPercent}%`,
                    transform: `translateX(-${trackTranslatePercent}%)`,
                  }}
                >
                  {testimonialsToShow.map((testimonial, index) => (
                    <article
                      key={`slide-${testimonial.name}-${index}`}
                      className="shrink-0 px-5 pb-10 pt-6 sm:px-8 md:px-12 md:pb-12 md:pt-10"
                      style={{ width: `${slideWidthPercent}%` }}
                    >
                      <div
                        className={
                          testimonial.image
                            ? "grid items-center gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10"
                            : ""
                        }
                      >
                        {testimonial.image && (
                          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-lg sm:max-w-md lg:max-w-none">
                            <div className="relative aspect-[4/5] min-h-[320px] sm:min-h-[440px] lg:min-h-[520px]">
                              <Image
                                src={testimonial.image}
                                alt={`${testimonial.name} smiling with the dental team after an appointment`}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 480px, 440px"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <div
                            className={`flex items-center gap-3 ${
                              testimonial.image ? "justify-start" : "justify-center"
                            }`}
                          >
                            <div className="rounded-2xl border border-slate-200 bg-white p-2.5 text-primary">
                              <Quote className="h-5 w-5" />
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-600">
                              {Array.from({ length: 5 }).map((_, starIndex) => (
                                <span
                                  key={`active-star-${testimonial.name}-${starIndex}`}
                                  className="text-base leading-none"
                                >
                                  {starIndex < testimonial.rating ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                          </div>

                          {!isNoAdditionalCommentPlaceholder(testimonial.text) && (
                            <p
                              className={`mt-8 max-w-3xl text-2xl font-light italic leading-relaxed text-slate-700 md:text-[2rem] md:leading-[1.45] ${
                                testimonial.image ? "text-left" : "mx-auto text-center"
                              }`}
                            >
                              &ldquo;{testimonial.text}&rdquo;
                            </p>
                          )}

                          <div
                            className={`mt-8 h-px w-20 bg-slate-300 ${
                              testimonial.image ? "" : "mx-auto"
                            }`}
                          />
                          <div
                            className={`mt-6 ${
                              testimonial.image ? "text-left" : "text-center"
                            }`}
                          >
                            <p className="text-2xl font-semibold text-slate-900">
                              {testimonial.name}
                            </p>
                            <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">
                              {testimonial.location || "Google Review"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {[-1, 1].map((offset) => {
                  const cardIndex = getWrappedIndex(activeTestimonial + offset);
                  const card = testimonialsToShow[cardIndex];
                  return (
                    <button
                      type="button"
                      key={`preview-${card.name}-${offset}`}
                      className="rounded-2xl border border-slate-200/90 bg-white/80 px-5 py-4 text-left shadow-sm transition-colors hover:bg-white"
                      onClick={() => setActiveTestimonial(cardIndex)}
                    >
                      <p className="text-sm font-semibold text-slate-900">{card.name}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {isNoAdditionalCommentPlaceholder(card.text)
                          ? "Rated on Google"
                          : card.text}
                      </p>
                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* Mobile testimonial card (below lg) — one card sized to the active
              review (no equal-height empty space), swipeable, dots for nav. */}
          {testimonialCount > 0 &&
            (() => {
              const mobileIndex = Math.min(
                activeTestimonial,
                testimonialCount - 1,
              );
              const t = testimonialsToShow[mobileIndex];
              return (
                <div className="mx-auto max-w-xl lg:hidden">
                  <div
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.45)] touch-pan-y"
                    onPointerDown={handleTestimonialPointerDown}
                    onPointerUp={handleTestimonialPointerUp}
                    onPointerCancel={resetSwipeStart}
                    onPointerLeave={resetSwipeStart}
                    role="region"
                    aria-roledescription="carousel"
                    aria-label="Patient testimonials"
                    aria-live="polite"
                  >
                    <div
                      key={mobileIndex}
                      className="animate-in fade-in-0 duration-500"
                    >
                      {t.image && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                          <Image
                            src={t.image}
                            alt={`${t.name} smiling with the dental team after an appointment`}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 1024px) 100vw, 576px"
                          />
                        </div>
                      )}
                      <div className="flex flex-col items-center px-6 py-8 text-center">
                        <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-base leading-none text-amber-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <span key={`m-star-${t.name}-${starIndex}`}>
                              {starIndex < t.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        {!isNoAdditionalCommentPlaceholder(t.text) && (
                          <p className="mt-5 text-lg font-light italic leading-relaxed text-slate-700">
                            &ldquo;{t.text}&rdquo;
                          </p>
                        )}
                        <div className="mt-6 h-px w-14 bg-slate-300" />
                        <p className="mt-4 text-lg font-semibold text-slate-900">
                          {t.name}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                          {t.location || "Google Review"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          <div className="mt-8 flex items-center justify-center gap-1">
            {testimonialsToShow.map((testimonial, index) => (
              <button
                key={`carousel-dot-${testimonial.name}-${index}`}
                type="button"
                data-testid="testimonial-dot"
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={activeTestimonial === index ? "true" : undefined}
                onClick={() => setActiveTestimonial(index)}
                className="group flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeTestimonial === index
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-slate-300 group-hover:bg-slate-400"
                  }`}
                />
              </button>
            ))}
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

      {/* Local relevance section */}
      <section id="palo-alto-dentist" className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-[#1F2933]">
                Dentist in Palo Alto, CA
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                Our team provides modern, conservative dentistry focused on
                long‑term comfort and oral health. We welcome patients from
                Palo Alto, Stanford, Menlo Park, and nearby Peninsula
                neighborhoods.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                From checkups and cleanings to Invisalign, cosmetic veneers, and
                restorative care, we’ll explain what we see and help you choose
                a plan that fits your goals and schedule.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Explore focused treatments including{" "}
                <Link href="/restorative-dentistry" className="ui-link-premium">
                  restorative dentistry
                </Link>{" "}
                and{" "}
                <Link href="/pediatric-dentistry" className="ui-link-premium">
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
                  className="ui-link-premium"
                >
                  Menlo Park families
                </Link>
                ,{" "}
                <Link
                  href="/dentist-stanford"
                  className="ui-link-premium"
                >
                  Stanford patients
                </Link>
                ,{" "}
                <Link
                  href="/dentist-mountain-view"
                  className="ui-link-premium"
                >
                  Mountain View families
                </Link>
                , and other{" "}
                <Link href="/locations" className="ui-link-premium">
                  nearby Peninsula communities
                </Link>
                .
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service areas
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Palo Alto</span>
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
                    All nearby communities
                  </Link>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <ButtonLink
                  href="/schedule#appointment"
                  className="ui-btn-primary"
                >
                  Request an appointment
                </ButtonLink>
                <ButtonLink
                  href="/services"
                  variant="outline"
                  className="ui-btn-outline"
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
                    className="mt-2 inline-flex items-center ui-link-premium"
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
                  <div className="mt-2 text-slate-700 text-sm leading-relaxed">
                    <div>Mon, Tue, Thu: {officeInfo.hours.monday}</div>
                    <div>Wed: {officeInfo.hours.wednesday}</div>
                    <div>Fri: {officeInfo.hours.friday}</div>
                    <div>Sat-Sun: {officeInfo.hours.saturday}</div>
                  </div>
                  {holiday ? (
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                      <span className="font-semibold">Temporary update:</span>{" "}
                      {holiday.shortNotice}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
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
                className="ui-link-premium"
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
                  Request an Appointment
                </h2>
                <p className="mb-6">
                  Send a quick request and our team will follow up to confirm a
                  visit time that works for you.
                </p>
                <div className="mb-6">
                  <div className="mb-3 flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    <span>We respond within one business day</span>
                  </div>
                  <div className="mb-3 flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    <span>Urgent needs prioritized — call for same-day help</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-3 h-5 w-5" />
                    <span>Easy rescheduling if needed</span>
                  </div>
                </div>
                <div className="mb-6 rounded-lg bg-blue-900 p-4 bg-opacity-50">
                  <h3 className="mb-2 font-bold">Office Hours</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-white">
                    <div>Monday, Tuesday, Thursday</div>
                    <div>{officeInfo.hours.monday}</div>
                    <div>Wednesday</div>
                    <div>{officeInfo.hours.wednesday}</div>
                    <div>Friday</div>
                    <div>{officeInfo.hours.friday}</div>
                    <div>Saturday - Sunday</div>
                    <div>{officeInfo.hours.saturday}</div>
                  </div>
                  {holiday ? (
                    <p className="mt-3 text-xs leading-relaxed text-blue-100">
                      <span className="font-semibold">Temporary update:</span>{" "}
                      {holiday.shortNotice}
                    </p>
                  ) : null}
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
                  Tell Us What You Need
                </h3>
                <p className="mb-6 text-[#333333]">
                  Use our focused request form to tell us what you need and how
                  you would like us to contact you. Most patients finish in
                  under a minute.
                </p>
                <ButtonLink href="/schedule#appointment" className="ui-btn-primary w-full">
                  Request your appointment
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  This is an appointment request. Our team confirms the exact
                  date and time within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
