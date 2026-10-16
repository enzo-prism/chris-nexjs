import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

export type FirstAidItem = {
  /** Anchor id so a chip row can jump straight to the card. */
  readonly id: string;
  readonly title: string;
  readonly icon: ServiceIconName;
  /** One line of typical signs. */
  readonly signs?: string;
  /** What to do right now, in order. */
  readonly steps: readonly string[];
  /** Small urgency chip, e.g. "Time matters". */
  readonly urgency?: string;
  readonly guide?: { readonly href: string; readonly title: string };
};

/**
 * "What to do right now" cards for urgent pages: scannable first-aid steps per
 * situation. Plain, calm, and visible without any interaction.
 */
export function FirstAidGrid({ items, className }: { readonly items: readonly FirstAidItem[]; readonly className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          id={item.id}
          className="card flex scroll-mt-28 flex-col p-5 sm:p-6"
        >
          <div className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
              <ServiceIcon name={item.icon} className="h-6 w-6" animated={false} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="font-heading text-[1.2rem] font-medium leading-snug text-ink">{item.title}</h3>
                {item.urgency ? (
                  <span className="rounded-full bg-gold-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-gold-700">
                    {item.urgency}
                  </span>
                ) : null}
              </div>
              {item.signs ? <p className="mt-1 text-sm leading-6 text-ink-muted">{item.signs}</p> : null}
            </div>
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-evergreen-700">Do this now</p>
          <ol className="mt-2 space-y-2">
            {item.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-[15px] leading-6 text-ink">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-[11px] font-bold text-evergreen-700"
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {item.guide ? (
            <Link
              href={item.guide.href}
              className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 text-sm font-semibold text-evergreen-700 hover:text-evergreen-900"
            >
              {item.guide.title}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default FirstAidGrid;
