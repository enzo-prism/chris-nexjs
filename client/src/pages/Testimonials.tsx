"use client";

import { Quote, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import { useQuery } from "@tanstack/react-query";
import TestimonialCard from "@/components/common/TestimonialCard";
import type { Testimonial } from "@shared/schema";
import { useMemo } from "react";
import { buildInsertTestimonial, testimonialSeedData } from "@shared/testimonialsData";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import {
  buildBreadcrumbSchema,  buildReviewSchemas,
  type StructuredDataNode,
} from "@/lib/structuredData";

const Testimonials = () => {
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });
  const fallbackTestimonials = useMemo<Testimonial[]>(() => {
    return testimonialSeedData.map((seed, index) => ({
      id: index + 1,
      ...buildInsertTestimonial(seed, index),
    }));
  }, []);
  const apiCount = testimonials?.length ?? 0;
  const fallbackCount = fallbackTestimonials.length;
  const shouldUseApiData = apiCount >= fallbackCount && apiCount > 0;
  const reviews = shouldUseApiData ? testimonials! : fallbackTestimonials;
  const totalReviews = reviews.length;
  const fiveStarShare = reviews.length
    ? Math.round((reviews.filter((review) => review.rating === 5).length / reviews.length) * 100)
    : 0;
  const spotlightReview =
    reviews.find((review) => review.text.length > 180) ?? reviews[0];
  const showSkeleton = isLoadingTestimonials && apiCount === 0;

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Testimonials", path: "/testimonials" },
  ];
  const testimonialsBreadcrumb = buildBreadcrumbSchema(breadcrumbItems);
  const structuredDataNodes: StructuredDataNode[] = [];
  const reviewSchemas = buildReviewSchemas(reviews);
  structuredDataNodes.push(...reviewSchemas);

  if (testimonialsBreadcrumb) {
    structuredDataNodes.push(testimonialsBreadcrumb);
  }
  

  return (
    <>
      <MetaTags
        title={pageTitles.testimonials}
        description={pageDescriptions.testimonials}
      />
      {structuredDataNodes.length > 0 && (
        <StructuredData data={structuredDataNodes} />
      )}
      <PageBreadcrumbs items={breadcrumbItems} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F5F9FC] via-white to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="h-4 w-4" />
            Loved by patients
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#1F2933] leading-tight">
            A community of smiles that keeps coming back
          </h1>
          <p className="text-lg md:text-xl text-[#4B5563] leading-relaxed max-w-3xl mx-auto">
            From emergency visits to decades-long relationships, patients across the Peninsula share how Dr. Wong, Dr. Hamamoto, and the entire team combine gentle care with modern dentistry.
          </p>
        </div>
      </section>

      {/* Spotlight Review */}
      {spotlightReview && (
        <section className="py-16 bg-primary text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <Quote className="h-16 w-16 mx-auto opacity-20" />
            <p className="text-2xl md:text-3xl font-light leading-relaxed">
              "{spotlightReview.text}"
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div
                className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center font-semibold text-primary bg-white uppercase"
                aria-label={`Avatar for ${spotlightReview.name}`}
              >
                {spotlightReview.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white">{spotlightReview.name}</h4>
                  <div className="flex text-white/90">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5"
                        fill={i < spotlightReview.rating ? "currentColor" : "none"}
                        strokeWidth={1.2}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Patient Testimonials Main Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Testimonials Grid */}
          {showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 animate-pulse space-y-4">
                  <div className="h-3 w-24 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {reviews.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.id}-${index}`}
                testimonial={testimonial}
                index={index}
                disableAnimation
              />
            ))}
          </div>
        )}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mt-16">
            {[
              {
                value: `${totalReviews}+`,
                label: "glowing patient reviews",
                description: "Shared across Google, Yelp, and in-practice surveys.",
              },
              {
                value: `${fiveStarShare}%`,
                label: "five-star satisfaction",
                description: "Patients who would recommend us to friends and family.",
              },
              {
                value: "40+",
                label: "years serving the Peninsula",
                description: "Multi-generational care for Palo Alto and the surrounding communities.",
              },
              {
                value: "Same-day",
                label: "emergency support",
                description: "When something unexpected happens, we make room for you.",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#F5F9FC] border border-[#E5E7EB] rounded-2xl px-6 py-8 text-left shadow-sm"
              >
                <p className="text-3xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-[#1F2933] font-semibold mb-2">{stat.label}</p>
                <p className="text-sm text-[#4B5563]">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Your Experience */}
      <section className="py-16 bg-gradient-to-b from-white to-[#F5F9FC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#333333] mb-4">
            Share Your Experience
          </h2>
          <p className="text-[#333333] mb-8 max-w-2xl mx-auto">
            Your feedback helps us improve our services and helps other patients make informed decisions.
            We appreciate you taking the time to share your experience at our practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300">
                Contact Us
              </Button>
            </Link>
            <Link href="/schedule">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 font-medium px-6 py-2 rounded-md transition-colors duration-300">
                Schedule Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
