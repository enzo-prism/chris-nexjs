import { useMemo } from "react";
import { RouteComponentProps, useLocation } from "wouter";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import MetaTags from "@/components/common/MetaTags";
import { pageDescriptions, pageTitles } from "@/lib/metaContent";
import { getSeoForPath } from "@/lib/seo";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import AuthorBox from "@/components/blog/AuthorBox";
import RelatedServices, {
  type RelatedServiceLink,
} from "@/components/common/RelatedServices";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";

type Params = Record<string, string | undefined> & {
  slug?: string;
};

type SupplementalContent = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

function getBlogSupplementalContent(category?: string | null): SupplementalContent {
  const normalized = category?.toLowerCase().trim() ?? "";

  if (normalized.includes("invisalign")) {
    return {
      heading: "Invisalign tips for Palo Alto patients",
      paragraphs: [
        "Clear aligners work best when worn consistently and kept clean. Most tracking issues come from short wear time or trays that are not fully seated.",
        "A consultation with a Palo Alto Invisalign provider helps set a realistic timeline, review attachments or refinements, and plan for retainers at the end.",
      ],
      bullets: [
        "Wear aligners 20 to 22 hours each day",
        "Brush and floss before putting trays back in",
        "Bring aligners to every checkup for fit checks",
      ],
    };
  }

  if (normalized.includes("whitening") || normalized.includes("cosmetic")) {
    return {
      heading: "Cosmetic care planning in Palo Alto",
      paragraphs: [
        "Whitening and cosmetic treatments work best when your teeth and gums are healthy. An exam helps us confirm that sensitivity or old restorations will not limit results.",
        "If you have veneers, bonding, or crowns, we can plan a shade strategy so your smile looks even and natural.",
      ],
      bullets: [
        "Discuss sensitivity history and shade goals",
        "Plan for maintenance touch ups",
        "Coordinate whitening with other cosmetic work",
      ],
    };
  }

  if (normalized.includes("emergency")) {
    return {
      heading: "When to seek emergency dental care",
      paragraphs: [
        "Dental pain, swelling, or trauma should be evaluated quickly. Early treatment can prevent infections from spreading and reduce the need for more invasive work.",
        "If you are not sure whether your issue is urgent, call our office. We can guide you on next steps and arrange care when possible.",
      ],
      bullets: [
        "Severe or persistent tooth pain",
        "Swelling, fever, or signs of infection",
        "Broken, knocked out, or loose teeth",
      ],
    };
  }

  if (normalized.includes("family") || normalized.includes("pediatric")) {
    return {
      heading: "Family dentistry takeaways",
      paragraphs: [
        "Consistent checkups help kids and adults avoid bigger problems later. For children, early visits build comfort and allow us to monitor growth.",
        "If your family has different schedules or needs, we can coordinate appointments and create a plan that keeps visits simple.",
      ],
      bullets: [
        "Start kids visits by age one or when the first tooth appears",
        "Ask about sealants, fluoride, and home care coaching",
        "Combine family appointments when possible",
      ],
    };
  }

  return {
    heading: "How to apply this guidance",
    paragraphs: [
      "Online advice is a starting point, not a diagnosis. An exam helps us confirm what is happening and which options will deliver the best long term outcome.",
      "If you are considering treatment in Palo Alto, we can review your goals, timing, and budget and outline next steps.",
    ],
    bullets: [
      "Share symptoms, goals, and any dental anxiety",
      "Bring a list of medications and past dental work",
      "Ask about timeline and maintenance care",
    ],
  };
}

const BlogPost = ({ params }: RouteComponentProps<Params>) => {
  const { slug } = params ?? { slug: "" };
  const { posts, isLoading } = useBlogPosts();
  const [, setLocation] = useLocation();

  const post = useMemo(() => {
    return posts.find((candidate) => candidate.slug === slug);
  }, [posts, slug]);

  const pageTitle = post ? `${post.title} | Christopher B. Wong, DDS` : pageTitles.blog;
  const pageDescription = post?.content
    ? `${post.content.slice(0, 160)}${post.content.length > 160 ? "…" : ""}`
    : pageDescriptions.blog;
  const blogOgImage = getSeoForPath("/blog").ogImage;
  const pageUrl = absoluteUrl(`/blog/${slug}`);
  const blogSchema = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: pageDescription,
        image: absoluteUrl(post.image),
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Person",
          name: "Dr. Christopher B. Wong, DDS",
        },
        publisher: {
          "@type": "Organization",
          name: "Christopher B. Wong, DDS",
          "@id": "https://www.chriswongdds.com/#organization",
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/favicon/apple-touch-icon.png"),
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
        url: pageUrl,
      }
    : null;

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    {
      name: post?.title ?? "Article",
      path: `/blog/${slug}`,
    },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const structuredDataNodes: StructuredDataNode[] = [];
  if (breadcrumbSchema) {
    structuredDataNodes.push(breadcrumbSchema);
  }
  if (blogSchema) {
    structuredDataNodes.push(blogSchema);
  }

  const relatedServices: RelatedServiceLink[] = (() => {
    const slugLower = post?.slug.toLowerCase() ?? "";
    const categoryLower = post?.category?.toLowerCase() ?? "";

    if (slugLower.includes("whitening") || categoryLower.includes("whitening")) {
      return [
        {
          href: "/teeth-whitening-palo-alto",
          anchorText: "Teeth whitening in Palo Alto",
          description: "Compare in‑office whitening and custom take‑home trays.",
        },
        {
          href: "/zoom-whitening",
          anchorText: "ZOOM! whitening",
          description: "Fast, in‑office whitening for a noticeable change.",
        },
        {
          href: "/dental-veneers",
          anchorText: "Cosmetic veneers in Palo Alto",
          description: "Cover deep stains and reshape teeth for a new smile.",
        },
        {
          href: "/services",
          anchorText: "Explore all services",
        },
      ];
    }

    if (slugLower.includes("invisalign") || categoryLower.includes("invisalign")) {
      return [
        {
          href: "/invisalign",
          anchorText: "Invisalign in Palo Alto",
          description: "Clear aligners to straighten teeth discreetly.",
        },
        {
          href: "/invisalign/resources",
          anchorText: "Invisalign resources",
          description: "Aftercare, wear time tips, and attachment guidance.",
        },
        {
          href: "/teeth-whitening-palo-alto",
          anchorText: "Teeth whitening in Palo Alto",
          description: "Finish your new smile with brighter teeth.",
        },
        {
          href: "/dental-veneers",
          anchorText: "Cosmetic veneers in Palo Alto",
          description: "Cover chips, gaps, and discoloration.",
        },
        {
          href: "/services",
          anchorText: "Other dental services in Palo Alto",
        },
      ];
    }

    if (slugLower.includes("emergency") || categoryLower.includes("emergency")) {
      return [
        {
          href: "/emergency-dental",
          anchorText: "Emergency dentist in Palo Alto",
          description: "Same‑day care for toothaches and injuries.",
        },
        {
          href: "/services#preventive-dentistry",
          anchorText: "Preventive dentistry",
          description: "Cleanings and exams to avoid future emergencies.",
        },
        {
          href: "/dental-implants",
          anchorText: "Dental implants",
          description: "Replace teeth that can’t be saved.",
        },
        {
          href: "/contact",
          anchorText: "Contact our office",
        },
      ];
    }

    if (
      slugLower.includes("veneers") ||
      categoryLower.includes("cosmetic")
    ) {
      return [
        {
          href: "/dental-veneers",
          anchorText: "Dental veneers in Palo Alto",
          description: "Porcelain or composite veneers for a new smile.",
        },
        {
          href: "/teeth-whitening-palo-alto",
          anchorText: "Teeth whitening in Palo Alto",
          description: "In‑office whitening and custom take‑home trays.",
        },
        {
          href: "/invisalign",
          anchorText: "Invisalign clear aligners",
          description: "Straighten teeth before cosmetic finishing.",
        },
        {
          href: "/services",
          anchorText: "Explore all services",
        },
      ];
    }

    if (
      slugLower.includes("menlo-park") ||
      slugLower.includes("family") ||
      slugLower.includes("kids") ||
      slugLower.includes("pediatric") ||
      categoryLower.includes("family") ||
      categoryLower.includes("pediatric")
    ) {
      return [
        {
          href: "/dentist-menlo-park",
          anchorText: "Menlo Park family dentist",
          description:
            "Family dental care for kids, teens, and adults—nearby in Palo Alto.",
        },
        {
          href: "/pediatric-dentist-palo-alto",
          anchorText: "Pediatric dentist for kids’ visits",
          description: "Gentle, prevention‑focused care for children and teens.",
        },
        {
          href: "/dental-cleaning-palo-alto",
          anchorText: "Dental cleanings and checkups",
          description: "Preventive visits that keep teeth and gums healthy.",
        },
        {
          href: "/services",
          anchorText: "Explore all dental services",
        },
      ];
    }

    return [
      { href: "/services", anchorText: "Dental services in Palo Alto" },
      { href: "/schedule", anchorText: "Schedule an appointment" },
      { href: "/contact", anchorText: "Contact our office" },
    ];
  })();
  const parsedContent = useMemo(() => {
    if (!post?.content) return [];
    const lines = post.content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const blocks: React.ReactNode[] = [];
    let bulletList: string[] | null = null;
    let orderedList: string[] | null = null;

    const flushLists = () => {
      if (bulletList) {
        blocks.push(
          <ul key={`ul-${blocks.length}`}>
            {bulletList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>,
        );
      }
      if (orderedList) {
        blocks.push(
          <ol key={`ol-${blocks.length}`}>
            {orderedList.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>,
        );
      }
      bulletList = null;
      orderedList = null;
    };

    const isHeading = (line: string) => {
      const wordCount = line.split(/\s+/).length;
      return /[:?]$/.test(line) || wordCount <= 7;
    };

    lines.forEach((line) => {
      if (/^-\s+/.test(line)) {
        orderedList = null;
        bulletList = bulletList ?? [];
        bulletList.push(line.replace(/^-\s+/, ""));
        return;
      }

      if (/^\d+\)\s+/.test(line)) {
        bulletList = null;
        orderedList = orderedList ?? [];
        orderedList.push(line.replace(/^\d+\)\s+/, ""));
        return;
      }

      flushLists();

      if (isHeading(line)) {
        blocks.push(
          <h2 key={`h2-${blocks.length}`}>
            {line.replace(/[:?]$/, "")}
          </h2>,
        );
      } else {
        blocks.push(
          <p key={`p-${blocks.length}`}>{line}</p>,
        );
      }
    });

    flushLists();
    return blocks;
  }, [post?.content]);

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-2/3" />
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <p className="text-gray-500">We couldn't find that article.</p>
          <Button onClick={() => setLocation("/blog")} className="bg-primary text-white">
            Back to Blog
          </Button>
        </div>
      </section>
    );
  }

  const supplementalContent = getBlogSupplementalContent(post.category);

  return (
    <>
      <MetaTags
        title={pageTitle}
        description={pageDescription}
        image={post.image || blogOgImage}
        type="article"
        url={pageUrl}
      />
      {structuredDataNodes.length > 0 && (
        <StructuredData data={structuredDataNodes} />
      )}
      <PageBreadcrumbs items={breadcrumbItems} />
      <section className="bg-[#F5F9FC] py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/blog")}
            className="mb-6 inline-flex items-center text-primary hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
          </Button>
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{post.date}</span>
            {post.readTime ? (
              <>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-2" />
                <span>{post.readTime} min read</span>
              </>
            ) : null}
            {post.category ? (
              <>
                <span className="mx-2">•</span>
                <Tag className="h-4 w-4 mr-2" />
                <span>{post.category}</span>
              </>
            ) : null}
          </div>
          <h1 className="text-4xl font-heading font-bold text-[#333333] mb-4 sm:mb-6">{post.title}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mb-8">
            Practical, patient-friendly guidance from Dr. Wong and team—built to help you act quickly and confidently.
          </p>
          {post.image ? (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-white/70">
                <OptimizedImage
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 sm:h-72 md:h-[420px] object-cover"
                />
            </div>
          ) : null}
          <article
	            className={cn(
	              "bg-white rounded-3xl shadow-xl border border-[#E5E7EB]/80",
	              "p-6 sm:p-8 break-words",
                "prose prose-lg prose-slate max-w-none",
                "prose-headings:font-heading prose-headings:text-[#1F2933]",
                "prose-p:text-slate-700 prose-li:text-slate-700 prose-li:marker:text-slate-400",
	            )}
	          >
            {parsedContent}
            {supplementalContent ? (
              <>
                <hr />
                <h2>{supplementalContent.heading}</h2>
                {supplementalContent.paragraphs.map((paragraph, index) => (
                  <p key={`supplemental-${index}`}>{paragraph}</p>
                ))}
                {supplementalContent.bullets ? (
                  <ul>
                    {supplementalContent.bullets.map((item, index) => (
                      <li key={`supplemental-bullet-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : null}
          </article>
        </div>
      </section>
      <AuthorBox />
      <RelatedServices
        items={relatedServices}
        title="Related services in Palo Alto"
        subtitle="Explore treatments that complement this topic."
        className="bg-[#F5F9FC]"
      />
    </>
  );
};

export default BlogPost;
