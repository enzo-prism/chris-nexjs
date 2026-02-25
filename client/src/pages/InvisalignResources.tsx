"use client";

import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import MetaTags from "@/components/common/MetaTags";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import BlogPostCard from "@/components/common/BlogPostCard";
import { Button } from "@/components/ui/button";
import { normalizeBlogCategory, useBlogPosts } from "@/hooks/useBlogPosts";
import { pageDescriptions, pageTitles } from "@/lib/metaContent";
import { buildBreadcrumbSchema } from "@/lib/structuredData";

const InvisalignResources = () => {
  const { posts, isLoading, isError, error } = useBlogPosts();

  const filteredPosts = useMemo(() => {
    const normalizedCategory = normalizeBlogCategory("Invisalign");
    const normalizedSlug = "invisalign";
    const parseDate = (dateValue: string) => {
      const parsed = Date.parse(dateValue);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return posts
      .filter((post) => {
        const categoryMatch =
          normalizeBlogCategory(post.category) === normalizedCategory;
        const slugMatch = post.slug.toLowerCase().includes(normalizedSlug);
        const serviceMatch = post.relatedServices?.some(
          (service) => service.trim().toLowerCase() === normalizedSlug,
        );
        return categoryMatch || slugMatch || serviceMatch;
      })
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [posts]);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Invisalign", path: "/invisalign" },
    { name: "Resources", path: "/invisalign/resources" },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  const errorMessage =
    error instanceof Error
      ? error.message
      : "We couldn't load Invisalign resources right now. Please try again.";

  const renderSkeleton = (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
        >
          <div className="w-full h-40 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmpty = (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <p className="text-[#333333]">
        We're adding Invisalign resources now. In the meantime, visit the
        Invisalign page to learn how clear aligners work and how to get started.
      </p>
      <div className="mt-6">
        <Link href="/invisalign">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Invisalign in Palo Alto
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderError = (
    <div className="bg-white rounded-lg shadow-md p-8 text-center text-[#333333]">
      <p>{errorMessage}</p>
    </div>
  );

  return (
    <>
      <MetaTags
        title={pageTitles.invisalignResources}
        description={pageDescriptions.invisalignResources}
      />
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      <PageBreadcrumbs items={breadcrumbItems} />

      <section className="bg-gradient-to-b from-[#F5F9FC] to-white py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Invisalign Palo Alto
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#333333] mb-6">
            Invisalign resources for Palo Alto patients
          </h1>
          <p className="text-lg text-[#333333] max-w-3xl mx-auto mb-8">
            Explore clear aligner guides, timelines, attachments, and aftercare
            tips from your Invisalign dentist in Palo Alto. Use these resources
            to prepare for a consultation or stay on track during treatment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/invisalign">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Invisalign in Palo Alto
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/schedule#appointment">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Book a consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold font-heading text-[#333333]">
              Invisalign guides and FAQs
            </h2>
          </div>

          {isError
            ? renderError
            : isLoading
              ? renderSkeleton
              : filteredPosts.length
                ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )
                : renderEmpty}
        </div>
      </section>

      <section className="py-16 bg-[#F5F9FC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-heading text-[#333333] mb-4">
            Ready to explore Invisalign in Palo Alto?
          </h2>
          <p className="text-[#333333] mb-8">
            Schedule a personalized Invisalign consultation to review your
            goals, timeline, and treatment options with Dr. Wong.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Request a consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Contact the office
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default InvisalignResources;
