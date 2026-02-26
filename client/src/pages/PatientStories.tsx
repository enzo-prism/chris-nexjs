"use client";

import { useEffect, useState } from "react";
import MetaTags from "@/components/common/MetaTags";
import StructuredData from "@/components/seo/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { officeInfo } from "@/lib/data";
import { pageDescriptions, pageTitles } from "@/lib/metaContent";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Link2,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { Link } from "wouter";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";

type CaseImage = {
  src: string;
  alt: string;
};

type CaseStudy = {
  id: string;
  title: string;
  subtitle: string;
  patientSummary: string;
  timeline: string;
  summary: string;
  challenges: string[];
  treatments: string[];
  outcomes: string[];
  services: string[];
  quote: string;
  quoteAttribution: string;
  images: CaseImage[];
  heroImage: string;
  metrics: { label: string; value: string; description?: string }[];
};

const serviceLinks: Record<string, string> = {
  "Invisalign®": "/invisalign",
  "Invisalign": "/invisalign",
  "Zoom! Whitening": "/zoom-whitening",
  "ZOOM! Whitening": "/zoom-whitening",
  "Cosmetic Bonding": "/services#cosmetic-dentistry",
  "Dental Veneers": "/dental-veneers",
  "Dental Implants": "/dental-implants",
  "Emergency Care": "/emergency-dental",
  "Preventive Dentistry": "/services#preventive-dentistry",
  "Restorative Dentistry": "/services#restorative-dentistry",
};

const CHECK_ICON_CLASS = "h-4 w-4 text-primary shrink-0 mt-0.5";

const optimizeImageSrc = (url: string, width = 900) => {
  if (!url.startsWith("http")) return url;
  if (!url.includes("res.cloudinary.com")) return url;
  const hasQuery = url.includes("?");
  const params = `w=${width}&auto=format`;
  return hasQuery ? `${url}&${params}` : `${url}?${params}`;
};

const caseStudies: CaseStudy[] = [
  {
    id: "invisalign-whitening-bonding-66yo",
    title: "Never too late for a new smile",
    subtitle: "👩‍🦳 66-year-old patient | Alignment, whitening, and bonding",
    patientSummary:
      "She wanted a confident smile for everyday moments and photos.",
    timeline: "Roughly 12 months with Invisalign®, 1 in-office Zoom! Whitening session, followed by precise bonding to close lower black triangles.",
    summary:
      "A thoughtful sequence of orthodontics, whitening, and minimally invasive bonding created a brighter, fuller smile without aggressive drilling or veneers.",
    challenges: [
      "Crowding and rotated teeth that had shifted over time",
      "Black triangle spaces on the lower front teeth",
      "Darkened shade from years of coffee and tea",
    ],
    treatments: [
      "Invisalign® clear aligners for about a year to gently align teeth",
      "One in-office Zoom! Whitening session after aligner therapy",
      "Targeted composite bonding on lower front teeth to close black triangles",
    ],
    outcomes: [
      "Aligned, more balanced smile arc",
      "Brighter shade after whitening with a natural finish",
      "Closed black triangles for a fuller, more youthful look",
    ],
    services: ["Invisalign®", "Zoom! Whitening", "Cosmetic Bonding"],
    quote: "",
    quoteAttribution: "",
    heroImage:
      "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382510/IMG_8356_bjxk7p.webp",
    metrics: [
      { label: "⏱️ Treatment span", value: "~12 months", description: "Clear aligners at a steady pace" },
      { label: "✨ Finishing touch", value: "1 visit", description: "Zoom! Whitening in-office" },
      { label: "🧩 Detailing", value: "Composite bonding", description: "Closed lower black triangles" },
    ],
    images: [
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8352_qyutwv.webp",
        alt: "Aligned smile after Invisalign treatment",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8340_xzb2ng.webp",
        alt: "Close-up of patient smile after whitening",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8344_jdmiv8.webp",
        alt: "Lower front teeth after bonding",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382510/IMG_8356_bjxk7p.webp",
        alt: "Full face smiling portrait after treatment",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382510/IMG_8358_ksxmqv.webp",
        alt: "Side profile of smile showing alignment",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8360_jdhsxg.webp",
        alt: "Smiling portrait with improved symmetry",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8348_rk2lap.webp",
        alt: "Lower teeth detail after black triangle closure",
      },
      {
        src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1765382511/IMG_8346_aqnhjl.webp",
        alt: "Upper teeth detail after whitening",
      },
    ],
  },
];

type CaseStoryProps = {
  study: CaseStudy;
  index: number;
  onShare: (id: string) => void;
  copiedId: string | null;
};

const CaseStory = ({ study, index, onShare, copiedId }: CaseStoryProps) => {
  const [galleryApi, setGalleryApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!galleryApi) return;
    const handleSelect = () => setCurrentSlide(galleryApi.selectedScrollSnap());
    handleSelect();
    galleryApi.on("select", handleSelect);
    return () => {
      galleryApi.off("select", handleSelect);
    };
  }, [galleryApi]);

  return (
    <article
      id={study.id}
      className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden"
    >
      <div className="grid lg:grid-cols-[1.05fr_1fr] gap-0">
        {/* Visual column first on mobile */}
        <div className="order-1 lg:order-2 bg-slate-50 p-5 sm:p-6 md:p-8 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <AspectRatio ratio={4 / 3}>
              <img
                src={optimizeImageSrc(study.heroImage, 1200)}
                alt={`${study.title} hero`}
                width={1200}
                height={900}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </AspectRatio>
            <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-primary/90 text-white shadow">
                  ✨ Featured case
                </Badge>
                <span className="text-[11px] font-semibold text-white/90 bg-slate-900/60 px-2 py-1 rounded-full">
                  Case {String(index + 1).padStart(2, "0")} • {study.subtitle}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onShare(study.id)}
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-primary/20 transition-[background-color,box-shadow,transform] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95"
                aria-label={`Copy link to ${study.title}`}
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                {copiedId === study.id ? "Copied" : "Share"}
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Progress photos from the case — aligner tracking, shade improvement, and bonding detailing.
          </p>

          {/* Mobile gallery */}
          <div className="block lg:hidden">
            <Carousel
              setApi={setGalleryApi}
              opts={{ align: "start", loop: false, dragFree: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {study.images.map((image, idx) => (
                  <CarouselItem key={`${image.src}-${idx}`} className="pl-3 basis-4/5 sm:basis-1/2">
                    <div className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
                      <AspectRatio ratio={4 / 3}>
                        <img
                          src={optimizeImageSrc(image.src, 720)}
                          alt={image.alt}
                          width={720}
                          height={540}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 640px) 80vw, 320px"
                        />
                      </AspectRatio>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs text-slate-500">Swipe through results</span>
                <div className="flex items-center gap-2">
                  <CarouselPrevious className="!static !translate-x-0 !translate-y-0 h-9 w-9 border-slate-200 bg-white/90 text-slate-700 hover:bg-white" />
                  <CarouselNext className="!static !translate-x-0 !translate-y-0 h-9 w-9 border-slate-200 bg-white/90 text-slate-700 hover:bg-white" />
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">{currentSlide + 1} / {study.images.length}</div>
            </Carousel>
          </div>

          {/* Desktop gallery */}
          <div className="hidden lg:grid grid-cols-2 gap-3">
            {study.images.map((image, idx) => (
              <div
                key={`${image.src}-${idx}`}
                className={cn(
                  "overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm",
                  "transition transform hover:-translate-y-1 hover:shadow-md"
                )}
              >
                <AspectRatio ratio={4 / 3}>
                  <img
                    src={optimizeImageSrc(image.src, 900)}
                    alt={image.alt}
                    width={900}
                    height={675}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 1200px) 50vw, 400px"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>

        {/* Textual column */}
        <div className="order-2 lg:order-1 p-5 sm:p-6 md:p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/70">
              Case {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 leading-snug">
              {study.title}
            </h2>
            <p className="text-sm text-slate-600">{study.subtitle}</p>
            <p className="text-base text-slate-700 leading-relaxed">{study.patientSummary}</p>
         <p className="text-base text-slate-700 leading-relaxed">{study.summary}</p>
          {study.services.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {study.services.map((service) => {
                const href = serviceLinks[service] || "/services";
                return (
                  <Link key={service} href={href}>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition"
                    >
                      {service}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
            <span aria-hidden="true">🗓️</span>
            <div>
              <p className="text-slate-800 font-semibold">Plan</p>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed">{study.timeline}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {study.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
              >
                <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{metric.label}</p>
                <p className="text-lg font-semibold text-slate-900">{metric.value}</p>
                {metric.description && (
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{metric.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: collapse details for fast scanning */}
          <div className="md:hidden space-y-3">
            <Accordion type="multiple" defaultValue={["challenges", "treatments", "outcome"]} className="space-y-2">
              <AccordionItem value="challenges" className="border border-slate-200 rounded-2xl px-3 bg-white">
                <AccordionTrigger className="py-3 text-base font-semibold text-slate-800">
                  What bothered the patient
                </AccordionTrigger>
                <AccordionContent className="px-1">
                  <ul className="space-y-2 text-slate-700">
                    {study.challenges.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="treatments" className="border border-slate-200 rounded-2xl px-3 bg-white">
                <AccordionTrigger className="py-3 text-base font-semibold text-slate-800">
                  How we treated it
                </AccordionTrigger>
                <AccordionContent className="px-1">
                  <ul className="space-y-2 text-slate-700">
                    {study.treatments.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className={CHECK_ICON_CLASS} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="outcome" className="border border-slate-200 rounded-2xl px-3 bg-white">
                <AccordionTrigger className="py-3 text-base font-semibold text-slate-800">
                  Outcome
                </AccordionTrigger>
                <AccordionContent className="px-1">
                  <ul className="space-y-2 text-slate-700">
                    {study.outcomes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className={CHECK_ICON_CLASS} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="services" className="border border-slate-200 rounded-2xl px-3 bg-white">
                <AccordionTrigger className="py-3 text-base font-semibold text-slate-800">
                  Services involved
                </AccordionTrigger>
                <AccordionContent className="px-1">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {study.services.map((service) => (
	                      <Badge
	                        key={service}
	                        variant="outline"
	                        className="border-primary/30 text-primary sm:whitespace-nowrap"
	                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Desktop detail grid */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                  What bothered the patient
                </p>
                <ul className="space-y-2 text-slate-700">
                  {study.challenges.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                  How we treated it
                </p>
                <ul className="space-y-2 text-slate-700">
                  {study.treatments.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className={CHECK_ICON_CLASS} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                Outcome
              </p>
              <ul className="space-y-2 text-slate-700">
              {study.outcomes.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className={CHECK_ICON_CLASS} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Services involved</p>
              <div className="flex flex-wrap gap-2">
                {study.services.map((service) => (
                  <Badge key={service} variant="outline" className="border-primary/30 text-primary">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90 w-full sm:w-auto">
                Start your plan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
              >
                Talk with our team
              </Button>
            </Link>
          </div>

          <div className="text-sm text-primary/70">
            <a href="#top" className="underline underline-offset-4">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

const PatientStories = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [copiedCaseId, setCopiedCaseId] = useState<string | null>(null);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Patient Stories", path: "/patient-stories" },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  const structuredData: StructuredDataNode[] = caseStudies.map((study) => ({
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: study.title,
    description: study.summary,
    howPerformed: study.treatments.join("; "),
    preparation: study.timeline,
    outcome: study.outcomes.join("; "),
    image: study.images.map((img) => img.src),
    procedureType: "Dental",
    provider: {
      "@type": "Dentist",
      name: officeInfo.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: officeInfo.address.line1,
        addressLocality: officeInfo.address.city,
        addressRegion: officeInfo.address.region,
        postalCode: officeInfo.address.postalCode,
        addressCountry: officeInfo.address.country,
      },
    },
    url: absoluteUrl(`/patient-stories#${study.id}`),
  }));

  if (breadcrumbSchema) {
    structuredData.unshift(breadcrumbSchema);
  }

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCTA(window.scrollY > 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopyLink = (id: string) => {
    if (typeof window === "undefined" || !navigator?.clipboard) return;
    const link = `${window.location.origin}/patient-stories#${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopiedCaseId(id);
        setTimeout(() => setCopiedCaseId(null), 1500);
      })
      .catch(() => {
        // ignore copy errors silently
      });
  };

  return (
    <>
      <MetaTags
        title={pageTitles.patientStories}
        description={pageDescriptions.patientStories}
      />
      <StructuredData data={structuredData} />
      <PageBreadcrumbs items={breadcrumbItems} />

      <section id="top" className="bg-gradient-to-b from-[#F5F9FC] via-white to-[#F5F9FC] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-3">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
              Patient Stories & Transformations
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933]">
              Real patients. Real results.
            </h1>
            <p className="text-lg text-[#334155] leading-relaxed">
              Every smile starts with a conversation. See how Dr. Wong and the team combine conservative care,
              technology, and attention to detail to help patients feel confident at any age.
            </p>
            <div className="text-sm text-slate-600">
              Mobile-friendly consults • HIPAA-safe forms • No-pressure recommendations
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Schedule a consultation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Ask a question
              </Button>
            </Link>
          </div>
          <div className="text-sm text-primary font-medium">
            <a href="#invisalign-whitening-bonding-66yo" className="underline underline-offset-4">
              Jump to first case ↓
            </a>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Timer className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-800">Thoughtful sequencing</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Align first, brighten next, then refine with bonding. We stage care to protect tooth structure and maximize results.
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-800">Conservative dentistry</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              We prioritize minimally invasive options—aligners and bonding before irreversible drilling or crowns.
            </CardContent>
          </Card>
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold text-slate-800">Confidence that lasts</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Shade, alignment, and tooth shape are balanced to look natural today and age gracefully over time.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {caseStudies.map((study, index) => (
            <CaseStory
              key={study.id}
              study={study}
              index={index}
              onShare={handleCopyLink}
              copiedId={copiedCaseId}
            />
          ))}
        </div>
      </section>

      <section className="bg-primary text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-3xl font-heading font-bold">Your story can be next.</h3>
          <p className="text-white/90 max-w-3xl mx-auto">
            Whether you want subtle refinements or a full smile refresh, we’ll map a plan that fits your goals and timeline.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/schedule#appointment">
              <Button className="bg-white text-primary hover:bg-white/90">
                Start your plan
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="bg-white text-black hover:bg-white/90 hover:text-black">
                View services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {showStickyCTA && (
        <div className="fixed bottom-4 left-0 right-0 px-4 md:hidden z-40">
          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-4 flex items-center gap-3">
            <div className="text-sm text-slate-800">
              Ready to talk? <span className="text-slate-500">We’ll respond quickly.</span>
            </div>
            <div className="ml-auto flex gap-2">
              <Link href="/contact">
                <Button variant="outline" className="border-primary text-primary h-9">
                  Questions
                </Button>
              </Link>
              <Link href="/schedule#appointment">
                <Button className="bg-primary text-white h-9 px-4">Book</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Separator />
    </>
  );
};

export default PatientStories;
