"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import type { BlogPost as BlogPostRecord } from "@shared/schema";
import { stripMarkdownToPlainText } from "@shared/blog";
import { blogIndex, type BlogIndexEntry } from "@/data/blogIndex";
import BlogPostCard from "@/components/common/BlogPostCard";
import { BlogCover } from "@/components/blog/AbstractBlogArt";
import { normalizeCategory, topicFor } from "@/components/blog/blogTopics";
import StructuredData from "@/components/seo/StructuredData";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { CtaBand } from "@/components/ds/CtaBand";
import { cn } from "@/lib/utils";
import {
  buildBlogListSchemas,
  buildBreadcrumbSchema,
  type StructuredDataNode,
} from "@/lib/structuredData";

type BlogProps = {
  /** Full posts from the route (used only to search article text). */
  initialPosts?: BlogPostRecord[];
  /** Legacy wouter route props (unused). */
  params?: Record<string, string | undefined>;
};

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
];

// Category chips, in the order patients tend to need them.
const categoryOrder = [
  "emergency-dentistry",
  "restorative-dentistry",
  "invisalign",
  "teeth-whitening",
  "cosmetic-dentistry",
  "pediatric-dentistry",
  "family-dentistry",
  "preventive-dentistry",
];

/**
 * Mirrors ?q= and ?category= into state. Lives in its own Suspense boundary
 * so the rest of the page (every article link) still renders statically.
 */
function UrlFilters({ onChange }: { readonly onChange: (q: string, category: string) => void }) {
  const params = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const category = params.get("category") ? normalizeCategory(params.get("category")) : "all";
  useEffect(() => {
    onChange(q, category);
  }, [q, category, onChange]);
  return null;
}

const Blog = ({ initialPosts }: BlogProps) => {
  const router = useRouter();
  const pathname = usePathname() ?? "/blog";
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const syncFromUrl = useMemo(
    () => (q: string, nextCategory: string) => {
      setQuery(q);
      setDraft(q);
      setCategory(nextCategory);
    },
    [],
  );

  // Article text (when the route provides full posts) makes search useful
  // beyond titles: "abscess" finds the swelling article, and so on.
  const searchText = useMemo(() => {
    const map = new Map<string, string>();
    for (const post of initialPosts ?? []) {
      map.set(post.slug, stripMarkdownToPlainText(post.content).toLowerCase());
    }
    return map;
  }, [initialPosts]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of blogIndex) {
      const id = normalizeCategory(post.category);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([id, count]) => ({ id, count, topic: topicFor(id.replace(/-/g, " ")) }))
      .sort((a, b) => {
        const ai = categoryOrder.indexOf(a.id);
        const bi = categoryOrder.indexOf(b.id);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, []);

  const needle = query.toLowerCase();
  const filtered = useMemo(
    () =>
      blogIndex.filter((post) => {
        const inCategory = category === "all" || normalizeCategory(post.category) === category;
        if (!inCategory) return false;
        if (!needle) return true;
        return (
          post.title.toLowerCase().includes(needle) ||
          post.excerpt.toLowerCase().includes(needle) ||
          post.category.toLowerCase().includes(needle) ||
          (searchText.get(post.slug)?.includes(needle) ?? false)
        );
      }),
    [category, needle, searchText],
  );

  const isFiltered = category !== "all" || needle.length > 0;
  const [featured, ...rest] = blogIndex;
  const gridPosts: readonly BlogIndexEntry[] = isFiltered ? filtered : rest;

  const pushFilters = (q: string, nextCategory: string) => {
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = draft.trim();
    setQuery(q);
    pushFilters(q, category);
  };

  const chooseCategory = (id: string) => {
    const next = id === category ? "all" : id;
    setCategory(next);
    pushFilters(query, next);
  };

  const clearFilters = () => {
    setDraft("");
    setQuery("");
    setCategory("all");
    pushFilters("", "all");
  };

  const activeTopic = category !== "all" ? categories.find((c) => c.id === category)?.topic : undefined;
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);
  const structuredDataNodes: StructuredDataNode[] = [
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ...buildBlogListSchemas([...blogIndex]),
  ];

  return (
    <>
      <StructuredData data={structuredDataNodes} />
      <Suspense fallback={null}>
        <UrlFilters onChange={syncFromUrl} />
      </Suspense>

      <section className="paper relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8">
          <PageBreadcrumbs items={breadcrumbItems} inline className="mb-6 sm:mb-8" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-14">
            <div className="max-w-3xl">
              <p className="eyebrow">Patient guides</p>
              <h1 className="h-display mt-5 text-balance text-[2.35rem] sm:text-[3.1rem] lg:text-[3.6rem]">
                Dental health <em>blog</em>
              </h1>
              <p className="lead mt-5 max-w-2xl">
                Plain-language answers to the questions patients ask us most, from a cracked tooth on a Friday
                night to how long Invisalign really takes.
              </p>
            </div>
            <form role="search" action="/blog" method="get" onSubmit={onSubmit} className="w-full">
              <label htmlFor="blog-search" className="mb-2 block text-sm font-semibold text-ink">
                Search {blogIndex.length} articles
              </label>
              <div className="flex items-center gap-2 rounded-full border border-cream-300 bg-white p-1.5 shadow-soft focus-within:border-evergreen-400">
                <Search className="ml-3 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                <input
                  id="blog-search"
                  name="q"
                  type="search"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Try “crown”, “sensitivity”, “retainer”"
                  enterKeyHint="search"
                  autoComplete="off"
                  className="min-h-11 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted/80"
                />
                <button type="submit" className="btn btn-primary btn-sm shrink-0">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section aria-labelledby="blog-articles-title" className="bg-white pb-16 pt-10 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="blog-articles-title" className="sr-only">
            Articles
          </h2>
          <div className="-mx-4 sm:mx-0">
            <ul aria-label="Filter by topic" className="snap-rail flex gap-2 px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0">
              <li className="shrink-0">
                <button
                  type="button"
                  aria-pressed={category === "all"}
                  onClick={() => chooseCategory("all")}
                  className={cn(
                    "pill min-h-11 transition-colors",
                    category === "all"
                      ? "border-evergreen-800 bg-evergreen-800 text-cream-50"
                      : "hover:border-evergreen-300 hover:text-evergreen-800",
                  )}
                >
                  All topics
                  <span className="text-xs opacity-70">{blogIndex.length}</span>
                </button>
              </li>
              {categories.map(({ id, count, topic }) => (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={category === id}
                    onClick={() => chooseCategory(id)}
                    className={cn(
                      "pill min-h-11 transition-colors",
                      category === id
                        ? "border-evergreen-800 bg-evergreen-800 text-cream-50"
                        : "hover:border-evergreen-300 hover:text-evergreen-800",
                    )}
                  >
                    <ServiceIcon name={topic.icon} animated={false} className="h-4 w-4" strokeWidth={3} />
                    {topic.label}
                    <span className="text-xs opacity-70">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {isFiltered ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
              <p className="text-[15px] text-ink-soft">
                <span className="font-semibold text-ink">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "article" : "articles"}
                {activeTopic ? ` in ${activeTopic.label}` : null}
                {needle ? (
                  <>
                    {" "}
                    matching “<span className="font-semibold text-ink">{query}</span>”
                  </>
                ) : null}
              </p>
              <button type="button" onClick={clearFilters} className="btn btn-ghost btn-sm">
                <X aria-hidden="true" />
                Clear filters
              </button>
            </div>
          ) : featured ? (
            <article className="card card-lift group relative mt-8 grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
              <BlogCover
                slug={featured.slug}
                category={featured.category}
                size="feature"
                titleAs="h3"
                caption="Newest article"
                className="min-h-[17rem] sm:min-h-[20rem]"
                title={
                  <Link href={`/blog/${featured.slug}`} className="rounded-sm outline-none">
                    {featured.title}
                  </Link>
                }
              />
              <Link
                href={`/blog/${featured.slug}`}
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 z-10"
              />
              <div className="flex flex-col justify-center p-6 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  {featured.date}
                  {featured.readTime ? ` · ${featured.readTime} min read` : null}
                </p>
                <p className="mt-4 text-pretty font-heading text-[1.3rem] leading-[1.55] text-ink sm:text-[1.45rem]">
                  {featured.excerpt}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-evergreen-700">
                  Read the article
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </article>
          ) : null}

          {gridPosts.length ? (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <li key={post.slug}>
                  <BlogPostCard post={post} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                <Search className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="h-card">No articles match that search</p>
              <p className="max-w-md text-[15px] leading-6 text-ink-soft">
                Try a simpler word, pick a topic above, or ask us directly. The front desk is happy to help.
              </p>
              <button type="button" onClick={clearFilters} className="btn btn-outline">
                Show all articles
              </button>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        analyticsContext="blog-cta"
        lead="Articles are general guidance. If something feels off with your teeth, request a visit online or call, and you’ll know your next step before you hang up or close the page."
      />
    </>
  );
};

export default Blog;
