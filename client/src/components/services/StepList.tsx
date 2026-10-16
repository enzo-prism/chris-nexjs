import type { Step } from "@/components/ds/Steps";
import { cn } from "@/lib/utils";

const colsClass = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Compact "your visit, step by step" list (same `Step` data as ds/Steps).
 * Phones: a numbered column joined by a root line, no card per step, so six
 * steps fit in about one screen. Tablet and up: a grid of step cards.
 */
export function StepList({
  steps,
  columns = 3,
  className,
}: {
  readonly steps: readonly Step[];
  readonly columns?: 2 | 3 | 4;
  readonly className?: string;
}) {
  return (
    <ol className={cn("relative grid gap-5 md:gap-4", colsClass[columns], className)}>
      <span
        aria-hidden="true"
        className="absolute bottom-8 left-5 top-5 w-px bg-gradient-to-b from-gold-400 via-evergreen-300 to-transparent md:hidden"
      />
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="reveal relative flex gap-4 md:flex-col md:gap-3 md:rounded-[1.75rem] md:border md:border-cream-300/80 md:bg-white md:p-6 md:shadow-soft"
        >
          <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-300 bg-cream-50 font-heading text-lg italic text-gold-700 shadow-soft md:h-11 md:w-11">
            {i + 1}
          </span>
          <div className="min-w-0 pt-1 md:pt-0">
            <h3 className="font-heading text-[1.15rem] font-medium leading-snug text-ink sm:text-[1.25rem]">{step.title}</h3>
            {step.meta ? (
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-evergreen-600 sm:text-xs">
                {step.meta}
              </p>
            ) : null}
            <div className="mt-1.5 text-[15px] leading-6 text-ink-soft">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default StepList;
