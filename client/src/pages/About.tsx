"use client";

import dynamic from "next/dynamic";
import { CheckCircle, Award, UserCheck, Shield, Play, Sparkles, X, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { drWongImages } from "@/lib/imageUrls";
import * as data from "@/lib/data";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import { useState } from "react";
import VideoModal from "@/components/common/VideoModal";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { motion, AnimatePresence } from "@/lib/motion-lite";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getTestimonialsByNames } from "@/lib/testimonials";
import {
  buildBreadcrumbSchema,
} from "@/lib/structuredData";

const OfficeGallerySection = dynamic(
  () => import("@/components/sections/OfficeGallerySection"),
  { ssr: false, loading: () => null },
);

const weddingCarouselImages = [
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193096/IMG_8193_wcxrms.webp", alt: "Dr. Wong and Dr. Michelle celebrating with the team" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193096/Michelle_Chris-preview28_zkbzo6.webp", alt: "Wedding ceremony moment with Dr. Wong and Dr. Michelle" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193096/IMG_8294_dbsehz.webp", alt: "Dr. Wong greeting guests at the reception" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193096/IMG_8197_rrgv98.webp", alt: "Dr. Wong and Dr. Michelle posing together" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193096/IMG_8224_s4xuoa.webp", alt: "Team members celebrating with the newlyweds" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193097/IMG_8199_jkkdtm.webp", alt: "Candid laugh with friends at the wedding" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193096/Michelle_Chris-preview62_actrrw.webp", alt: "Dr. Wong and Dr. Michelle enjoying the reception" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193098/IMG_8195_hddelf.webp", alt: "Wedding party cheering together" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193098/Michelle_Chris-preview85_whoc8v.webp", alt: "Dance floor celebration with friends and family" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193098/Michelle_Chris-preview54_dg6hwz.webp", alt: "Dr. Wong and Dr. Michelle sharing a moment at sunset" },
  { src: "https://res.cloudinary.com/dhqpqfw6w/image/upload/v1764193098/Michelle_Chris-preview73_orakjs.webp", alt: "Group photo with the dental practice team at the wedding" },
];

const About = () => {
  // State for video modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [weddingModalIndex, setWeddingModalIndex] = useState<number | null>(null);
  const interviewVideoUrl = "https://youtu.be/HrksJeYb02Q";
  
  // Using the team members from shared data
  const { teamMembers: sharedTeamMembers } = data;
  const spotlightTestimonials = getTestimonialsByNames([
    "Anat Sipres",
    "Loretta Guarino Reid",
    "Marypat Power",
  ]);
  
  // Create a full team with Dr. Wong at the top, using shorter bio for team display
  const teamMembers = [
    {
      name: "Dr. Christopher B. Wong",
      role: "Lead Dentist",
      image: drWongImages.drWongPortrait1,
      bio: "Dr Christopher Wong was born and raised in Sacramento and earned his bachelor's degree in Biology from UC Davis. He graduated from the University of the Pacific School of Dentistry in San Francisco in 2018. He specializes in conservative dentistry, Invisalign, and implant restoration while practicing ethical and non-invasive care."
    },
    ...sharedTeamMembers
  ];
  const profileHighlights = [
    {
      label: "Location",
      value: "Palo Alto, CA",
    },
    {
      label: "Focus",
      value: "Conservative dentistry, Invisalign, implant restoration",
    },
    {
      label: "Patients",
      value: "Adults, teens, and families across the Peninsula",
    },
  ];

  const aboutSchema = [];

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Dr. Christopher Wong", path: "/about" },
  ];
  const aboutBreadcrumbs = buildBreadcrumbSchema(breadcrumbItems);

  if (aboutBreadcrumbs) {
    aboutSchema.push(aboutBreadcrumbs);
  }
  
  const openWeddingModal = (index: number) => setWeddingModalIndex(index);
  const closeWeddingModal = () => setWeddingModalIndex(null);
  const goToWeddingImage = (direction: "next" | "prev") => {
    if (weddingModalIndex === null) return;
    const total = weddingCarouselImages.length;
    const nextIndex =
      direction === "next"
        ? (weddingModalIndex + 1) % total
        : (weddingModalIndex - 1 + total) % total;
    setWeddingModalIndex(nextIndex);
  };

  return (
    <>
      <StructuredData data={aboutSchema} />
      <PageBreadcrumbs items={breadcrumbItems} />
      {/* Hero Section - Mobile First */}
      <section className="bg-[#F5F9FC] py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-4 sm:mb-6 leading-tight">
              About Dr. Christopher B. Wong
            </h1>
            <p className="text-lg sm:text-xl text-[#333333] max-w-3xl mx-auto leading-relaxed">
              Get to know Dr. Wong and the dedicated dental team committed to providing exceptional care
              in Palo Alto. Looking for a Wong dentist in Palo Alto? We are here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Wedding Celebration Carousel */}
      <section className="bg-white py-10 sm:py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-r from-[#f7edf3] via-[#f8f6fb] to-[#eaf5ff] shadow-[0_28px_70px_-36px_rgba(15,23,42,0.35)] p-5 sm:p-7 lg:p-9">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-6 sm:gap-8 items-center">
              <div className="space-y-4 sm:space-y-5 w-full max-w-xl min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Team celebration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#1F2933] leading-tight text-balance">
                  Congratulations Dr. Christopher Wong & Dr. Michelle 💍
                </h2>
                <p className="text-sm sm:text-base text-[#374151] leading-relaxed">
                  Dr. Christopher Wong married{" "}
                  <a
                    href="https://www.instagram.com/dr.michellefong/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-semibold underline decoration-primary/50 underline-offset-4 hover:decoration-primary"
                  >
                    Dr. Michelle Fong
                  </a>{" "}
                  (also a dentist), and our dental family joined them at the wedding. Browse a few favorite moments below.
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Tip: Swipe on mobile or use the arrows to move through photos.
                </p>
              </div>

              <div className="w-full min-w-0">
                <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-3 sm:p-4 shadow-xl backdrop-blur-sm">
                  <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2 sm:-ml-3">
                      {weddingCarouselImages.map((image, index) => (
                        <CarouselItem
                          key={image.src}
                          className="pl-2 sm:pl-3 basis-[88%] sm:basis-[68%] lg:basis-[56%]"
                        >
                          <button
                            type="button"
                            onClick={() => openWeddingModal(index)}
                            className="h-full w-full text-left group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                          >
                            <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-3 shadow-md">
                              <OptimizedImage
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full rounded-xl"
                                fit="cover"
                                useIntrinsicAspect
                                objectPosition="50% 45%"
                                style={{ maxHeight: 520 }}
                                priority={index < 2}
                              />
                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end">
                                <div className="w-full px-4 pb-3 text-white/90 text-xs sm:text-sm">
                                  Tap to view larger
                                </div>
                              </div>
                            </div>
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 sm:left-3 h-9 w-9 sm:h-10 sm:w-10 border-slate-200 bg-white/95 text-slate-700 shadow-lg hover:bg-white" />
                    <CarouselNext className="right-2 sm:right-3 h-9 w-9 sm:h-10 sm:w-10 border-slate-200 bg-white/95 text-slate-700 shadow-lg hover:bg-white" />
                  </Carousel>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {weddingModalIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeWeddingModal();
            }}
          >
              <button
                type="button"
                onClick={closeWeddingModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full text-white/80 hover:text-white hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95 transition-colors p-2 z-30"
                aria-label="Close wedding gallery"
              >
              <X className="h-6 w-6" />
            </button>

            <div className="absolute inset-y-0 left-2 sm:left-6 flex items-center z-20 pointer-events-none">
              <button
                type="button"
                onClick={() => goToWeddingImage("prev")}
                className="bg-white/10 hover:bg-white/20 text-white/90 rounded-full p-3 shadow-md transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95 pointer-events-auto"
                aria-label="Previous wedding photo"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 sm:right-6 flex items-center z-20 pointer-events-none">
              <button
                type="button"
                onClick={() => goToWeddingImage("next")}
                className="bg-white/10 hover:bg-white/20 text-white/90 rounded-full p-3 shadow-md transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95 pointer-events-auto"
                aria-label="Next wedding photo"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              className="relative max-w-5xl w-full z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="overflow-hidden rounded-2xl bg-black/60 border border-white/10 shadow-2xl flex justify-center">
                <OptimizedImage
                  src={weddingCarouselImages[weddingModalIndex].src}
                  alt={weddingCarouselImages[weddingModalIndex].alt}
                  className="w-full h-full"
                  fit="cover"
                  useIntrinsicAspect
                  objectPosition="50% 45%"
                  style={{ maxHeight: "80vh", maxWidth: "92vw" }}
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor Profile - Mobile First */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-3 leading-tight">
              Dr. Christopher B. Wong
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto"></div>
          </div>
          
          <motion.div 
            className="bg-white rounded-3xl shadow-lg overflow-hidden border border-[#E0E6EF]/70"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-5">
              <motion.div 
                className="relative bg-gradient-to-br from-[#F5F9FC] via-[#EEF4FB] to-[#D7E8FF] p-6 sm:p-10 flex items-center justify-center md:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative w-full max-w-sm sm:max-w-md">
                  <div className="absolute -inset-4 hidden md:block rounded-[32px] bg-white/40 blur-md"></div>
                  <div className="relative rounded-[28px] bg-white/70 backdrop-blur-sm shadow-xl border border-white/60 p-4 sm:p-6 flex items-center justify-center">
                    <OptimizedImage
                      src="https://cdn.prod.website-files.com/6647633c9b317c62a46de335/67e986d38336152373ca94ad_Frame%201-min.png"
                      alt="Dr. Christopher B. Wong portrait"
                      className="w-full h-full object-contain max-h-[520px]"
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="md:col-span-3 p-6 sm:p-8 md:p-10 space-y-8"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1 text-xs sm:text-sm font-semibold tracking-wide">
                    <span>Meet Dr. Christopher B. Wong</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Dr. Wong · Palo Alto dentist
                  </p>
                  <p className="text-[#333333] leading-relaxed text-sm sm:text-base">
                    {data.doctorInfo.bio}
                  </p>
                  <p className="text-[#333333] leading-relaxed text-sm sm:text-base">
                    Dr. Wong is the Wong dentist patients know for conservative care, clear communication,
                    and a comfortable experience in Palo Alto.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {profileHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[#E0E6EF] bg-white px-4 py-3 shadow-sm"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#666666] font-semibold">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm text-[#333333] leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {[
                    { icon: Award, text: "University of the Pacific Arthur A. Dugoni School of Dentistry Graduate" },
                    { icon: CheckCircle, text: "American Dental Association" },
                    { icon: CheckCircle, text: "California Dental Association" },
                    { icon: CheckCircle, text: "Santa Clara County Dental Society" }
                  ].map((credential, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start gap-3 rounded-2xl border border-[#E0E6EF] bg-[#F7FAFE] px-4 py-3 sm:px-5 sm:py-4"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                    >
                      <credential.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-[#333333] text-sm sm:text-base leading-relaxed">{credential.text}</span>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="text-left bg-[#F5F9FC] border border-[#E0E6EF] rounded-2xl px-5 py-4">
                    <p className="text-[#666666] text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold">Experience</p>
                    <p className="text-lg sm:text-xl font-heading text-[#333333]">{data.doctorInfo.experience}</p>
                  </div>
                  
                  <Button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base px-4 sm:px-6 py-3 hover:scale-105 transition-transform duration-200"
                  >
                    <Play className="h-4 w-4" />
                    Watch Interview with Dr. Christopher Wong
                  </Button>
                </motion.div>
                <p className="text-xs text-slate-500">
                  Reviewed by Dr. Christopher B. Wong · Last updated: December 2025
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Patient Stories */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Patient voices
            </span>
            <h2 className="mt-4 text-3xl font-bold font-heading leading-tight text-[#1F2933] sm:text-4xl">
              Experiences that guide our care
            </h2>
            <p className="mt-4 text-sm text-[#4B5563] sm:text-base">
              Hear from patients who trust Dr. Wong and our hygiene team for compassionate, thoughtful dentistry.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {spotlightTestimonials.map((testimonial) => (
              <TestimonialQuote key={testimonial.name} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach - Mobile First */}
      <section className="py-12 sm:py-16 bg-[#F5F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-3 sm:mb-4 leading-tight">Our Approach to Dental Care</h2>
            <p className="text-[#333333] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">We believe in providing comprehensive, personalized dental care that puts your comfort and well-being first.</p>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto mt-4"></div>
          </div>

          {/* Mobile-first: Stack cards vertically on mobile, then grid on larger screens */}
          <div className="space-y-6 sm:space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8">
            <motion.div 
              className="bg-white p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-[#333333] mb-2 sm:mb-3">Patient-Centered Care</h3>
              <p className="text-[#333333] text-sm sm:text-base leading-relaxed">We take the time to listen to your concerns and goals, creating personalized treatment plans that address your specific needs.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="rounded-full bg-[#00AA90] bg-opacity-10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-[#00AA90]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-[#333333] mb-2 sm:mb-3">Excellence in Quality</h3>
              <p className="text-[#333333] text-sm sm:text-base leading-relaxed">We use only the highest quality materials and latest techniques to ensure lasting results that look natural and feel comfortable.</p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 sm:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="rounded-full bg-[#E63946] bg-opacity-10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-[#E63946]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-[#333333] mb-2 sm:mb-3">Comprehensive Care</h3>
              <p className="text-[#333333] text-sm sm:text-base leading-relaxed">
                From preventive cleanings to complex restorations, we provide a full range of services to meet your oral health needs in one location, including{" "}
                <Link href="/invisalign" className="text-primary font-semibold hover:underline">
                  Invisalign clear aligners
                </Link>{" "}
                for adults and teens.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Our Team - Mobile First */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#333333] mb-3 sm:mb-4 leading-tight">Meet Our Team</h2>
            <p className="text-[#333333] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">Our skilled professionals work together to provide comprehensive, compassionate dental care to our community.</p>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto mt-4"></div>
          </div>

          {/* Mobile-first: Stack cards on mobile, then responsive grid */}
          <div className="space-y-6 sm:space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative aspect-square bg-gray-100">
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold font-heading text-[#333333] mb-1">{member.name}</h3>
                  <p className="text-[#00AA90] font-semibold mb-3 text-sm sm:text-base">{member.role}</p>
                  <p className="text-[#333333] text-sm sm:text-base leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Office Gallery */}
      <OfficeGallerySection />

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={interviewVideoUrl}
      />
    </>
  );
};

export default About;
