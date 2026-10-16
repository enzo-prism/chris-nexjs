import type { ReactNode } from "react";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { cn } from "@/lib/utils";
import { blogIndex } from "@/data/blogIndex";
import { topicFor, type CoverTone } from "./blogTopics";

/**
 * Branded blog cover: the topic's tone, its line icon inside redwood growth
 * rings (the practice mark's motif), the category, and optionally the title.
 * Pure CSS/SVG: no images to download, no AI art, identical on server and
 * client.
 */

type ToneStyle = {
  readonly surface: string;
  readonly highlight: string;
  readonly title: string;
  readonly chip: string;
  readonly icon: string;
  readonly iconWell: string;
  readonly rings: string;
};

// Literal class strings so Tailwind keeps them.
const toneStyles: Record<CoverTone, ToneStyle> = {
  night: {
    surface: "bg-evergreen-900",
    highlight:
      "radial-gradient(30rem 18rem at 100% 0%, rgba(63,191,152,0.22), transparent 62%), radial-gradient(26rem 16rem at 0% 100%, rgba(224,182,94,0.14), transparent 60%)",
    title: "text-cream-50",
    chip: "bg-white/10 text-gold-200 ring-1 ring-white/15",
    icon: "text-gold-300",
    iconWell: "bg-evergreen-950/60 ring-1 ring-white/10",
    rings: "text-mint-300/30",
  },
  cream: {
    surface: "bg-cream-100",
    highlight:
      "radial-gradient(30rem 18rem at 100% 0%, rgba(176,209,193,0.45), transparent 62%), radial-gradient(26rem 16rem at 0% 100%, rgba(243,224,176,0.55), transparent 60%)",
    title: "text-ink",
    chip: "bg-white/80 text-evergreen-700 ring-1 ring-cream-300",
    icon: "text-evergreen-700",
    iconWell: "bg-white/85 ring-1 ring-cream-300",
    rings: "text-evergreen-700/20",
  },
  gold: {
    surface: "bg-gold-200",
    highlight:
      "radial-gradient(30rem 18rem at 100% 0%, rgba(253,251,247,0.75), transparent 62%), radial-gradient(26rem 16rem at 0% 100%, rgba(235,203,131,0.45), transparent 60%)",
    title: "text-ink",
    chip: "bg-white/75 text-gold-700 ring-1 ring-gold-300",
    icon: "text-gold-700",
    iconWell: "bg-cream-50/90 ring-1 ring-gold-300",
    rings: "text-gold-700/25",
  },
  sage: {
    surface: "bg-evergreen-100",
    highlight:
      "radial-gradient(30rem 18rem at 100% 0%, rgba(253,251,247,0.7), transparent 62%), radial-gradient(26rem 16rem at 0% 100%, rgba(127,179,156,0.35), transparent 60%)",
    title: "text-ink",
    chip: "bg-white/75 text-evergreen-700 ring-1 ring-evergreen-200",
    icon: "text-evergreen-800",
    iconWell: "bg-cream-50/90 ring-1 ring-evergreen-200",
    rings: "text-evergreen-800/20",
  },
  mist: {
    surface: "bg-evergreen-50",
    highlight:
      "radial-gradient(30rem 18rem at 100% 0%, rgba(176,209,193,0.55), transparent 62%), radial-gradient(26rem 16rem at 0% 100%, rgba(253,251,247,0.9), transparent 60%)",
    title: "text-ink",
    chip: "bg-white/80 text-evergreen-700 ring-1 ring-evergreen-100",
    icon: "text-evergreen-600",
    iconWell: "bg-white/90 ring-1 ring-evergreen-100",
    rings: "text-evergreen-600/20",
  },
  sand: {
    surface: "bg-cream-200",
    highlight:
      "radial-gradient(30rem 18rem at 100% 0%, rgba(243,224,176,0.7), transparent 62%), radial-gradient(26rem 16rem at 0% 100%, rgba(253,251,247,0.8), transparent 60%)",
    title: "text-ink",
    chip: "bg-white/75 text-gold-700 ring-1 ring-cream-400/60",
    icon: "text-evergreen-700",
    iconWell: "bg-cream-50/90 ring-1 ring-cream-300",
    rings: "text-gold-700/20",
  },
};

// Slightly irregular radii read as growth rings rather than a target.
const RINGS = [22, 33, 46, 58, 73, 86, 102, 117, 134, 150, 168, 186];

function hash(value: string): number {
  let h = 0;
  for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

// Where the ring cluster sits; picked per slug so a grid of covers varies.
const placements = [
  "-right-[22%] -top-[38%]",
  "-right-[14%] -top-[18%]",
  "-right-[30%] top-[-8%]",
] as const;

type BlogCoverProps = {
  readonly slug: string;
  readonly category?: string | null;
  /** Rendered as the cover's text. Pass `titleAs` to make it a heading. */
  readonly title?: ReactNode;
  readonly titleAs?: "h2" | "h3" | "p";
  readonly size?: "card" | "feature" | "hero";
  readonly className?: string;
  /** Small caption under the category (e.g. "6 min read"). */
  readonly caption?: string;
};

export function BlogCover({
  slug,
  category,
  title,
  titleAs: TitleTag = "p",
  size = "card",
  className,
  caption,
}: BlogCoverProps) {
  const topic = topicFor(category);
  const tone = toneStyles[topic.tone];
  const h = hash(slug || topic.id);
  const placement = size === "hero" ? "-right-[18%] -bottom-[30%]" : placements[h % placements.length];
  const rotate = (h % 40) - 20;

  return (
    <div
      className={cn("relative isolate overflow-hidden", tone.surface, className)}
      style={{ backgroundImage: tone.highlight }}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute aspect-square",
          size === "card" ? "h-[150%]" : size === "feature" ? "h-[135%]" : "h-[120%]",
          placement,
        )}
      >
        <svg
          viewBox="-200 -200 400 400"
          className={cn("h-full w-full", tone.rings)}
          fill="none"
          stroke="currentColor"
          style={{ transform: `rotate(${rotate}deg)` }}
        >
          {RINGS.map((r, i) => (
            <ellipse
              key={r}
              cx={i % 3 === 0 ? 1.5 : 0}
              cy={i % 2 === 0 ? -1 : 1}
              rx={r}
              ry={r * (0.94 + (i % 3) * 0.025)}
              strokeWidth={i % 4 === 0 ? 2.2 : 1.2}
            />
          ))}
        </svg>
        <span
          className={cn(
            "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-soft",
            size === "card" ? "h-[17%] w-[17%]" : "h-[15%] w-[15%]",
            tone.iconWell,
          )}
        >
          <ServiceIcon name={topic.icon} animated={false} className={cn("h-[62%] w-[62%]", tone.icon)} strokeWidth={2.2} />
        </span>
      </div>

      <div
        className={cn(
          "relative flex h-full flex-col justify-between",
          size === "card" ? "gap-6 p-5" : size === "feature" ? "gap-10 p-6 sm:p-8" : "gap-8 p-6 sm:p-8",
        )}
      >
        <div className="flex flex-col items-start gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm",
              tone.chip,
            )}
          >
            {topic.label}
          </span>
          {caption ? <span className={cn("pl-1 text-xs font-semibold opacity-80", tone.title)}>{caption}</span> : null}
        </div>
        {title ? (
          <TitleTag
            className={cn(
              "max-w-[88%] text-balance font-heading font-medium",
              tone.title,
              size === "card" && "line-clamp-4 text-[1.3rem] leading-[1.22]",
              size === "feature" && "line-clamp-5 text-[1.65rem] leading-[1.18] sm:text-[2.1rem]",
              size === "hero" && "text-[1.6rem] leading-[1.2]",
            )}
            style={{ letterSpacing: "-0.012em" }}
          >
            {title}
          </TitleTag>
        ) : null}
      </div>
    </div>
  );
}

/** Back-compat wrapper: a title-less cover looked up by slug. */
export default function AbstractBlogArt({ slug, className }: { slug: string; className?: string }) {
  const entry = blogIndex.find((post) => post.slug === slug);
  return (
    <div aria-hidden="true" className={cn("h-full w-full", className)}>
      <BlogCover slug={slug} category={entry?.category} className="h-full w-full" />
    </div>
  );
}
