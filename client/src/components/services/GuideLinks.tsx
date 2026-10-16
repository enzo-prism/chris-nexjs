import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

export type Guide = {
  readonly href: string;
  readonly title: string;
};

/** Contextual links to the blog guides that go deeper on a section. */
export function GuideLinks({
  guides,
  title = "Read the full guide",
  className,
  columns = 2,
}: {
  readonly guides: readonly Guide[];
  readonly title?: string;
  readonly className?: string;
  readonly columns?: 1 | 2;
}) {
  if (!guides.length) return null;
  return (
    <nav aria-label={title} className={className}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{title}</p>
      <ul className={cn("mt-3 grid gap-2.5", columns === 2 && "sm:grid-cols-2")}>
        {guides.map((guide) => (
          <li key={guide.href}>
            <Link
              href={guide.href}
              className="group flex min-h-14 items-center gap-3 rounded-2xl border border-cream-300/80 bg-white/85 px-4 py-3 text-[15px] font-semibold leading-snug text-evergreen-800 transition-colors hover:border-evergreen-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen-500"
            >
              <BookOpen className="h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
              <span className="flex-1">{guide.title}</span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default GuideLinks;
