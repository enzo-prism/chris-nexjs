import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Zero-JS disclosure for deep, crawlable detail (native <details>). Keeps
 * phone pages short without hiding copy from search engines.
 */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  headingLevel = "h3",
  className,
}: {
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
  readonly headingLevel?: "h3" | "h4";
  readonly className?: string;
}) {
  const Heading = headingLevel;
  return (
    <details
      className={cn("faq-item group rounded-[1.5rem] border border-cream-300/80 bg-white", className)}
      open={defaultOpen || undefined}
    >
      <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left sm:px-6">
        <Heading className="font-heading text-[1.1rem] font-medium leading-snug text-ink sm:text-[1.2rem]">{title}</Heading>
        <span
          aria-hidden="true"
          className="faq-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-lg leading-none text-evergreen-700 group-open:bg-evergreen-800 group-open:text-gold-300"
        >
          +
        </span>
      </summary>
      <div className="prose-rooted space-y-3 px-5 pb-6 text-[15px] sm:px-6 sm:text-base">{children}</div>
    </details>
  );
}

/** Bullet list styled for use inside a Disclosure or prose block. */
export function DotList({ items, className }: { readonly items: readonly ReactNode[]; readonly className?: string }) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default Disclosure;
