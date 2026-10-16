import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Clock, ListOrdered, Phone } from "lucide-react";
import { getBlogSeoMetadata } from "@shared/blogSeo";
import { resolveBlogImagePath } from "@shared/blogArt";
import type { BlogPost as BlogPostRecord } from "@shared/schema";
import { blogIndex, type BlogIndexEntry } from "@/data/blogIndex";
import { officeInfo } from "@/lib/data";
import { getSeoForPath } from "@/lib/seo";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices from "@/components/common/RelatedServices";
import BlogPostCard from "@/components/common/BlogPostCard";
import AuthorBox from "@/components/blog/AuthorBox";
import { BlogCover } from "@/components/blog/AbstractBlogArt";
import { renderInlineMarkdown, stripInlineMarkdown } from "@/components/blog/InlineMarkdown";
import { normalizeCategory, serviceLinksForPost, topicFor } from "@/components/blog/blogTopics";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { CtaBand } from "@/components/ds/CtaBand";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  toIsoDateString,
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

  if (normalized.includes("restorative")) {
    return {
      heading: "Restorative planning in Palo Alto",
      paragraphs: [
        "The right restoration is the one that protects the tooth without removing more structure than necessary. That is why treatment decisions are based on how much healthy tooth remains, how the tooth handles bite pressure, and how predictable the repair will be over time.",
        "If you have a cracked tooth, a large older filling, or pain when chewing, an exam can clarify whether a filling, crown, or another restorative option is the safest long-term move.",
      ],
      bullets: [
        "Treat cracks and failing fillings before they become emergencies",
        "Ask how much natural tooth structure remains",
        "Match the restoration to both function and long-term durability",
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

/* ------------------------------------------------------------- parsing */

type Block =
  | { readonly kind: "h2"; readonly text: string; readonly id: string }
  | { readonly kind: "h3"; readonly text: string; readonly num?: number }
  | { readonly kind: "p"; readonly text: string; readonly leadIn?: boolean }
  | { readonly kind: "ul"; readonly items: readonly string[] }
  | { readonly kind: "ol"; readonly items: readonly string[]; readonly start: number };

const BULLET = /^-\s+/;
const NUMBERED = /^(\d+)[.)]\s+/;

function getMarkdownHeading(line: string): { level: 2 | 3; text: string } | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;
  // "### Choose bonding if you want:" reads better as a heading without the colon.
  return { level: match[1].length >= 3 ? 3 : 2, text: match[2].trim().replace(/:$/, "") };
}

/**
 * Older posts use bare lines for headings ("What to Do Before You Arrive",
 * "When should kids start seeing a dentist?"). Only used for posts with no
 * markdown headings, so question-shaped paragraphs in newer posts stay
 * paragraphs. Lines ending in ":" are list lead-ins, never headings.
 */
function isLegacyHeading(line: string): boolean {
  if (/[.!:]$/.test(line) || line.includes(",")) return false;
  if (/www\.|https?:|@|\d{3}/.test(line)) return false;
  return line.split(/\s+/).length <= 12;
}

function slugify(text: string): string {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parseContent(content: string): Block[] {
  const raw = content.split("\n").map((line) => line.trim());
  const hasMarkdownHeadings = raw.some((line) => /^#{1,6}\s/.test(line));
  const blocks: Block[] = [];
  const usedIds = new Set<string>();
  let list: { kind: "ul"; items: string[] } | { kind: "ol"; items: string[]; start: number } | null = null;

  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };
  const pushHeading = (level: 2 | 3, text: string, num?: number) => {
    if (level === 3) {
      blocks.push({ kind: "h3", text, num });
      return;
    }
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; usedIds.has(id); n += 1) id = `${base}-${n}`;
    usedIds.add(id);
    blocks.push({ kind: "h2", text, id });
  };

  for (let i = 0; i < raw.length; i += 1) {
    const line = raw[i];
    if (!line) continue;
    if (BULLET.test(line)) {
      if (list?.kind !== "ul") {
        flush();
        list = { kind: "ul", items: [] };
      }
      list.items.push(line.replace(BULLET, ""));
      continue;
    }
    const numbered = line.match(NUMBERED);
    if (numbered) {
      const next = raw[i + 1] ?? "";
      // "1) Toothache or severe pain" directly followed by its paragraph is a
      // numbered subheading, not a one-item list.
      if (next && !BULLET.test(next) && !NUMBERED.test(next) && !getMarkdownHeading(next)) {
        flush();
        pushHeading(3, line.replace(NUMBERED, ""), Number(numbered[1]));
        continue;
      }
      if (list?.kind !== "ol") {
        flush();
        list = { kind: "ol", items: [], start: Number(numbered[1]) || 1 };
      }
      list.items.push(line.replace(NUMBERED, ""));
      continue;
    }
    flush();
    const heading = getMarkdownHeading(line);
    if (heading) pushHeading(heading.level, heading.text);
    else if (!hasMarkdownHeadings && blocks.length > 0 && isLegacyHeading(line)) pushHeading(2, line);
    else blocks.push({ kind: "p", text: line, leadIn: /:$/.test(line) });
  }
  flush();
  return blocks;
}

const LINK = "link-rooted";

function renderBlock(block: Block, index: number, isLede: boolean): ReactNode {
  switch (block.kind) {
    case "h2":
      return (
        <h2
          key={block.id}
          id={block.id}
          className="mt-12 scroll-mt-32 text-balance font-heading text-[1.6rem] font-medium leading-[1.18] text-ink first:mt-0 sm:text-[1.95rem]"
          style={{ letterSpacing: "-0.015em" }}
        >
          {renderInlineMarkdown(block.text, LINK)}
        </h2>
      );
    case "h3":
      return (
        <h3
          key={`h3-${index}`}
          className="mt-8 flex items-start gap-3 text-balance font-heading text-[1.3rem] font-medium leading-snug text-ink sm:text-[1.45rem]"
        >
          {block.num ? (
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-300 bg-cream-50 text-base italic text-gold-700"
            >
              {block.num}
            </span>
          ) : null}
          <span>{renderInlineMarkdown(block.text, LINK)}</span>
        </h3>
      );
    case "ul":
      return (
        <ul key={`ul-${index}`} className="mt-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="relative pl-7 text-[1.0625rem] leading-8 text-ink-soft sm:text-[1.125rem]">
              <span aria-hidden="true" className="absolute left-1 top-[0.8em] h-2 w-2 rounded-full bg-gold-400" />
              {renderInlineMarkdown(item, LINK)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={`ol-${index}`} start={block.start} className="mt-4 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3.5 text-[1.0625rem] leading-8 text-ink-soft sm:text-[1.125rem]">
              <span
                aria-hidden="true"
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-300 bg-cream-50 font-heading text-sm italic text-gold-700"
              >
                {block.start + i}
              </span>
              <span>{renderInlineMarkdown(item, LINK)}</span>
            </li>
          ))}
        </ol>
      );
    default:
      return (
        <p
          key={`p-${index}`}
          className={
            isLede
              ? "text-pretty font-heading text-[1.3rem] leading-[1.6] text-ink sm:text-[1.45rem]"
              : block.leadIn
                ? "mt-6 text-pretty text-[1.0625rem] font-semibold leading-8 text-ink sm:text-[1.125rem]"
                : "mt-5 text-pretty text-[1.0625rem] leading-8 text-ink-soft sm:text-[1.125rem] sm:leading-[1.85]"
          }
        >
          {renderInlineMarkdown(block.text, LINK)}
        </p>
      );
  }
}

/* ------------------------------------------------------- related posts */

function relatedPostsFor(post: Pick<BlogPostRecord, "slug" | "category">): BlogIndexEntry[] {
  const terms = (value: string) =>
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length > 3 && term !== "palo" && term !== "alto");
  const topicTerms = new Set(terms(`${post.slug} ${post.category ?? ""}`));
  return blogIndex
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate, index) => {
      const shared = terms(`${candidate.slug} ${candidate.category}`).filter((t) => topicTerms.has(t)).length;
      const categoryMatch = candidate.category === post.category ? 20 : 0;
      return { candidate, index, score: categoryMatch + shared };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

/* ---------------------------------------------------------------- page */

type BlogPostPageProps = {
  params?: Params;
  initialPosts?: BlogPostRecord[];
};

const BlogPost = ({ params, initialPosts = [] }: BlogPostPageProps) => {
  const slug = params?.slug ?? "";
  const post = initialPosts.find((candidate) => candidate.slug === slug);

  if (!post) {
    return (
      <section className="paper px-4 py-24 text-center">
        <p className="eyebrow justify-center">Dental health blog</p>
        <p className="h-section mx-auto mt-4 max-w-xl">We couldn’t find that article.</p>
        <Link href="/blog" className="btn btn-primary mt-8">
          Browse all articles
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    );
  }

  const blogSeo = getBlogSeoMetadata(post);
  const pageDescription = blogSeo?.description ?? getSeoForPath("/blog").description;
  const blogOgImage = getSeoForPath("/blog").ogImage;
  const pageUrl = absoluteUrl(`/blog/${slug}`);
  const resolvedBlogImage = resolveBlogImagePath(post);
  const postIsoDate = toIsoDateString(post.date);
  const blogSchema: StructuredDataNode = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: pageDescription,
    image: absoluteUrl(resolvedBlogImage ?? blogOgImage ?? "/images/dr_wong_polaroids.png"),
    datePublished: postIsoDate ?? post.date,
    dateModified: postIsoDate ?? post.date,
    author: {
      "@type": "Organization",
      name: "Christopher B. Wong, DDS",
      url: absoluteUrl("/about"),
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
  };

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${slug}` },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const structuredDataNodes: StructuredDataNode[] = [];
  if (breadcrumbSchema) structuredDataNodes.push(breadcrumbSchema);
  structuredDataNodes.push(blogSchema);

  const topic = topicFor(post.category);
  const blocks = parseContent(post.content);
  const toc = blocks.filter((block): block is Extract<Block, { kind: "h2" }> => block.kind === "h2");
  const firstParagraph = blocks.findIndex((block) => block.kind === "p");
  const supplemental = getBlogSupplementalContent(post.category);
  const relatedServices = serviceLinksForPost(post, 3);
  const relatedPosts = relatedPostsFor(post);

  const tocList = (
    <ol className="space-y-1">
      {toc.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="flex min-h-11 items-center rounded-xl px-3 py-2 text-[15px] leading-snug text-ink-soft transition-colors hover:bg-evergreen-50 hover:text-evergreen-800"
          >
            {stripInlineMarkdown(item.text)}
          </a>
        </li>
      ))}
    </ol>
  );

  const askCard = (
    <div className="surface-evergreen on-dark rounded-[1.75rem] p-6 shadow-soft">
      <p className="eyebrow eyebrow-light">Your own tooth</p>
      <p className="mt-3 font-heading text-[1.45rem] leading-tight text-cream-50">
        Want Dr. Wong to take a look?
      </p>
      <p className="mt-2 text-[15px] leading-6 text-evergreen-100/90">
        Articles are general. An exam tells you what’s actually going on and what your options are.
      </p>
      <div className="mt-5 grid gap-2.5">
        <Link
          href="/schedule#appointment"
          className="btn btn-gold"
          data-analytics-context="blog-post-aside-request"
        >
          <CalendarDays aria-hidden="true" />
          Request a visit
        </Link>
        <a
          href={`tel:${officeInfo.phoneE164}`}
          className="btn btn-outline-light"
          data-analytics-context="blog-post-aside-call"
          aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
        >
          <Phone aria-hidden="true" />
          {officeInfo.phone}
        </a>
      </div>
    </div>
  );

  return (
    <>
      <StructuredData data={structuredDataNodes} />

      <article aria-labelledby="article-title">
        <header className="paper relative isolate overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-14 lg:px-8 lg:pb-16">
            <div className="min-w-0 max-w-4xl">
              <PageBreadcrumbs items={breadcrumbItems} inline className="mb-6 sm:mb-8 [&_li:last-child]:hidden [&_li:nth-last-child(2)_svg]:hidden" />
              <Link
                href={`/blog?category=${normalizeCategory(post.category)}`}
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-evergreen-600 hover:text-evergreen-800"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-evergreen-800 text-gold-300">
                  <ServiceIcon name={topic.icon} animated={false} className="h-5 w-5" />
                </span>
                {topic.label}
              </Link>
              <h1
                id="article-title"
                className="h-display mt-4 text-balance text-[2rem] sm:text-[2.7rem] lg:text-[3.15rem]"
              >
                {post.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-muted">
                <span className="flex items-center gap-2.5">
                  <Image
                    src="/images/about/dr-wong-portrait.webp"
                    alt=""
                    width={64}
                    height={64}
                    sizes="32px"
                    className="h-8 w-8 rounded-full object-cover object-[50%_22%] ring-2 ring-cream-50"
                  />
                  <span>
                    From the office of{" "}
                    <Link href="/about" className="link-rooted">
                      Dr. Christopher B. Wong
                    </Link>
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                  <time dateTime={postIsoDate ?? undefined}>{post.date}</time>
                </span>
                {post.readTime ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                    {post.readTime} min read
                  </span>
                ) : null}
              </div>
            </div>
            <div className="hidden lg:block" aria-hidden="true">
              <BlogCover
                slug={post.slug}
                category={post.category}
                size="hero"
                caption="Patient guide"
                className="aspect-[4/3.4] rounded-[2rem] shadow-soft"
              />
            </div>
          </div>
        </header>

        <div className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,68ch)_18rem] lg:justify-between lg:gap-16">
            <div className="min-w-0">
              {toc.length > 2 ? (
                <details className="faq-item group mb-10 rounded-[1.5rem] border border-cream-300/80 bg-cream-50 lg:hidden">
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 py-3 font-semibold text-ink">
                    <span className="flex items-center gap-2.5">
                      <ListOrdered className="h-5 w-5 text-evergreen-600" aria-hidden="true" />
                      In this article
                    </span>
                    <span
                      aria-hidden="true"
                      className="faq-plus flex h-8 w-8 items-center justify-center rounded-full bg-evergreen-50 text-lg text-evergreen-700 group-open:bg-evergreen-800 group-open:text-gold-300"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-2 pb-3">{tocList}</div>
                </details>
              ) : null}

              <div className="max-w-[68ch]">
                {blocks.map((block, index) => renderBlock(block, index, index === firstParagraph))}

                <section
                  aria-labelledby="article-takeaways"
                  className="mt-14 rounded-[1.75rem] border border-cream-300/80 bg-cream-100 p-6 sm:p-8"
                >
                  <p className="eyebrow">From our office</p>
                  <h2
                    id="article-takeaways"
                    className="mt-3 text-balance font-heading text-[1.5rem] font-medium leading-tight text-ink sm:text-[1.8rem]"
                  >
                    {supplemental.heading}
                  </h2>
                  {supplemental.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-4 text-[1.0625rem] leading-8 text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                  {supplemental.bullets ? (
                    <ul className="mt-5 grid gap-2.5">
                      {supplemental.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[1.0625rem] leading-7 text-ink">
                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-evergreen-800 text-gold-300">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>

                <AuthorBox className="mt-10" />

                <div className="mt-10 lg:hidden">{askCard}</div>
              </div>
            </div>

            <aside aria-label="Article tools" className="hidden lg:block">
              <div className="sticky top-[calc(var(--header-height,110px)+1.5rem)] space-y-6">
                {toc.length > 2 ? (
                  <nav aria-label="In this article" className="rounded-[1.5rem] border border-cream-300/80 bg-cream-50 p-3">
                    <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                      In this article
                    </p>
                    {tocList}
                  </nav>
                ) : null}
                {askCard}
              </div>
            </aside>
          </div>
        </div>
      </article>

      <RelatedServices
        items={relatedServices}
        title="Care related to this article"
        subtitle="Each page explains the visit, what it costs, and what Dr. Wong looks for."
        className="bg-cream-50"
      />

      {relatedPosts.length > 0 ? (
        <section aria-labelledby="related-articles-title" className="bg-cream-100 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Keep reading</p>
                <h2 id="related-articles-title" className="h-section mt-4">
                  Related <em>articles</em>
                </h2>
              </div>
              <Link href="/blog" className="btn btn-outline self-start sm:self-auto">
                All articles
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <ul className="reveal-stagger mt-10 grid gap-5 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <li key={related.slug}>
                  <BlogPostCard post={related} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand analyticsContext="blog-post-cta" />
    </>
  );
};

export default BlogPost;
