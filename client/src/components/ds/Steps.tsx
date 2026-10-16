import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Step = {
  readonly title: string;
  readonly body: ReactNode;
  /** e.g. "About 60 minutes" */
  readonly meta?: string;
};

/** Numbered visit steps joined by a growing root line. */
export function Steps({ steps, className }: { readonly steps: readonly Step[]; readonly className?: string }) {
  return (
    <ol className={cn("relative grid gap-4", className)}>
      <span
        aria-hidden="true"
        className="absolute bottom-6 left-[1.6rem] top-6 w-px bg-gradient-to-b from-gold-400 via-evergreen-300 to-transparent sm:left-[1.85rem]"
      />
      {steps.map((step, i) => (
        <li key={step.title} className="reveal relative flex gap-4 sm:gap-6">
          <span className="relative z-10 flex h-[3.2rem] w-[3.2rem] shrink-0 items-center justify-center rounded-full border border-gold-300 bg-cream-50 font-heading text-xl italic text-gold-700 shadow-soft sm:h-[3.7rem] sm:w-[3.7rem] sm:text-2xl">
            {i + 1}
          </span>
          <div className="card flex-1 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="h-card text-[1.25rem] sm:text-[1.4rem]">{step.title}</h3>
              {step.meta ? (
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-evergreen-600">{step.meta}</span>
              ) : null}
            </div>
            <div className="mt-2 text-[15px] leading-7 text-ink-soft">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default Steps;
