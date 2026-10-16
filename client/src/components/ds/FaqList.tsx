import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = {
  readonly question: string;
  readonly answer: ReactNode;
};

/** Accessible, zero-JS FAQ (native <details>). Pair with FAQPage schema. */
export function FaqList({
  items,
  className,
  defaultOpen = 0,
}: {
  readonly items: readonly FaqItem[];
  readonly className?: string;
  /** Index opened on load (-1 for none). */
  readonly defaultOpen?: number;
}) {
  return (
    <div className={cn("divide-y divide-cream-300/80 rounded-[1.75rem] border border-cream-300/80 bg-white", className)}>
      {items.map((item, index) => (
        <details key={item.question} className="faq-item group" open={index === defaultOpen}>
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 px-5 py-4 text-left sm:px-7">
            <h3 className="font-heading text-lg font-medium leading-snug text-ink sm:text-xl">
              {item.question}
            </h3>
            <span
              className="faq-plus flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-xl leading-none text-evergreen-700 group-open:bg-evergreen-800 group-open:text-gold-300"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <div className="prose-rooted px-5 pb-6 sm:px-7">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

export default FaqList;
