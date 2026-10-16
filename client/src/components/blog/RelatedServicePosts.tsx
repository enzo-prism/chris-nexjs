import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogPostCard from "@/components/common/BlogPostCard";
import { blogIndex } from "@/data/blogIndex";
import { cn } from "@/lib/utils";
import { normalizeCategory, postsForService } from "./blogTopics";

interface RelatedServicePostsProps {
  serviceSlug: string;
  serviceName: string;
  ctaHref?: string;
  category?: string;
  className?: string;
}

// Hrefs that now redirect; point the CTA at the live equivalent instead.
const RETIRED_CTA: Readonly<Record<string, string>> = {
  "/invisalign/resources": "/blog?category=invisalign",
};

/**
 * "From the blog" band for service pages. Reads the static blog index, so the
 * three cards (real internal links) render identically on the server and the
 * client — no fetch, no skeleton, no hydration mismatch. Renders nothing when
 * no post relates to the service.
 */
const RelatedServicePosts = ({
  serviceSlug,
  serviceName,
  ctaHref,
  category,
  className,
}: RelatedServicePostsProps) => {
  const posts = postsForService(blogIndex, serviceSlug, category, 3);
  if (!posts.length) return null;

  const allHref =
    (ctaHref && (RETIRED_CTA[ctaHref] ?? ctaHref)) ||
    (category ? `/blog?category=${normalizeCategory(category)}` : "/blog");
  const titleId = `related-posts-${serviceSlug.replace(/[^a-z0-9-]/gi, "")}`;

  return (
    <section aria-labelledby={titleId} className={cn("bg-cream-100 py-12 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">From the blog</p>
            <h2 id={titleId} className="h-section mt-4 text-balance">
              {serviceName} <em>guides</em>
            </h2>
            <p className="lead mt-4 hidden sm:block">Plain-language answers from our office, written for patients.</p>
          </div>
          <Link
            href={allHref}
            className="btn btn-outline self-start sm:self-auto"
            data-analytics-context={`related-posts-${serviceSlug}`}
          >
            All articles
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        {/* Phones: a swipe row; md+: three columns. */}
        <ul className="reveal-stagger -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scroll-padding-inline:1rem] md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {posts.map((post) => (
            <li key={post.slug} className="w-[80%] max-w-[21rem] shrink-0 snap-start md:w-auto md:max-w-none">
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RelatedServicePosts;
