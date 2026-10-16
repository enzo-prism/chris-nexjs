import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { stripMarkdownToPlainText } from "@shared/blog";
import { BlogCover } from "@/components/blog/AbstractBlogArt";
import { cn } from "@/lib/utils";

/** Anything with these fields renders: a seed BlogPost or a blogIndex entry. */
export type BlogCardPost = {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly category?: string | null;
  readonly readTime?: number | null;
  readonly excerpt?: string;
  readonly content?: string;
};

interface BlogPostCardProps {
  readonly post: BlogCardPost;
  readonly className?: string;
  readonly headingLevel?: "h2" | "h3";
}

function excerptFor(post: BlogCardPost): string {
  if (post.excerpt) return post.excerpt;
  const plain = stripMarkdownToPlainText(post.content ?? "");
  if (plain.length <= 150) return plain;
  const cut = plain.slice(0, 149);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.]+$/, "")}…`;
}

/** Article card: branded cover with the title, a short excerpt, date and length. */
const BlogPostCard = ({ post, className, headingLevel = "h3" }: BlogPostCardProps) => {
  const meta = [post.date, post.readTime ? `${post.readTime} min read` : null].filter(Boolean).join(" · ");

  return (
    <article
      id={post.slug}
      className={cn(
        "card card-lift group relative flex h-full scroll-mt-32 flex-col overflow-hidden",
        className,
      )}
    >
      <BlogCover
        slug={post.slug}
        category={post.category}
        titleAs={headingLevel}
        size="card"
        className="min-h-[11.5rem] sm:min-h-[14.5rem]"
        title={
          <Link href={`/blog/${post.slug}`} className="rounded-sm outline-none">
            {post.title}
          </Link>
        }
      />
      {/* Whole-card click target; the title link above is the accessible one. */}
      <Link
        href={`/blog/${post.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-10"
      />
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 text-[15px] leading-6 text-ink-soft">{excerptFor(post)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{meta}</p>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-evergreen-700 transition-colors duration-300 group-hover:bg-evergreen-800 group-hover:text-gold-300"
          >
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;
