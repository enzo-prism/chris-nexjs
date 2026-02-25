import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BlogPostCard from "@/components/common/BlogPostCard";
import { normalizeBlogCategory, useBlogPosts } from "@/hooks/useBlogPosts";

interface RelatedServicePostsProps {
  serviceSlug: string;
  serviceName: string;
  ctaHref?: string;
  category?: string;
}

const RelatedServicePosts = ({
  serviceSlug,
  serviceName,
  ctaHref = "/blog",
  category,
}: RelatedServicePostsProps) => {
  const { posts, isLoading, isError, error } = useBlogPosts();
  const normalizedCategory = category
    ? normalizeBlogCategory(category)
    : null;
  const normalizedService = serviceSlug.trim().toLowerCase();
  const matchesCategory = (postCategory?: string | null) =>
    normalizedCategory &&
    normalizeBlogCategory(postCategory ?? undefined) === normalizedCategory;
  const matchesService = (relatedServices?: string[] | null) =>
    Boolean(
      normalizedService &&
        relatedServices?.some(
          (slug) => slug.trim().toLowerCase() === normalizedService,
        ),
    );
  const parsePostDate = (dateValue: string) => {
    const parsed = Date.parse(dateValue);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const filteredPosts = posts
    .filter((post) =>
      normalizedCategory
        ? matchesCategory(post.category)
        : matchesService(post.relatedServices),
    )
    .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
  const displayedPosts = filteredPosts.slice(0, 4);
  const hasPosts = displayedPosts.length > 0;
  const errorMessage =
    error instanceof Error
      ? error.message
      : "We couldn't load related articles. Please try again later.";

  const renderSkeleton = (
    <div className="grid md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="w-full h-40 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmpty = (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <p className="text-[#333333]">
        We don’t have related articles to show right now. In the meantime,
        explore the full blog for additional resources.
      </p>
    </div>
  );

  const renderError = (
    <div className="bg-white rounded-lg shadow-md p-8 text-center text-[#333333]">
      <div className="flex items-center justify-center mb-4 text-red-500">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>Unable to load related articles</span>
      </div>
      <p>{errorMessage}</p>
    </div>
  );

  const renderPosts = (
    <div className="grid md:grid-cols-3 gap-6">
      {displayedPosts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );

  return (
    <section className="py-16 bg-[#F5F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary font-semibold mb-2">
              From the Blog
            </p>
            <h2 className="text-3xl font-heading font-bold text-[#333333]">
              Latest insights on {serviceName}
            </h2>
            <p className="text-[#333333] mt-2">
              Expert advice, treatment guides, and real patient stories related to{" "}
              {serviceName.toLowerCase()}.
            </p>
          </div>
          <Link href={ctaHref}>
            <Button className="mt-6 sm:mt-0 bg-primary text-white hover:bg-primary/90 inline-flex items-center">
              {normalizedCategory
                ? `View all ${serviceName} articles`
                : "View All Articles"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isError
          ? renderError
          : isLoading
            ? renderSkeleton
            : hasPosts
              ? renderPosts
              : renderEmpty}
      </div>
    </section>
  );
};

export default RelatedServicePosts;
