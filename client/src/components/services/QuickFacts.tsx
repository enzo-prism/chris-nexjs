import type { Fact } from "@/components/ds/FactGrid";
import { cn } from "@/lib/utils";

/**
 * Compact quick-facts panel (same `Fact` data as the ds FactGrid): a 2×2
 * hairline grid on phones, one row of four on wide screens. Keeps the facts
 * scannable without four stacked cards on a small screen.
 */
export function QuickFacts({ facts, className }: { readonly facts: readonly Fact[]; readonly className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-cream-300/80 bg-cream-300/70 shadow-soft",
        facts.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {facts.map((fact, i) => {
        const Icon = fact.icon;
        const spanLast = facts.length % 2 === 1 && i === facts.length - 1;
        return (
          // A <dl> may only wrap dt/dd groups, so the icon lives inside <dt>.
          <div
            key={fact.label}
            className={cn("min-w-0 bg-white p-4 sm:p-5", spanLast && "col-span-2 lg:col-span-1")}
          >
            <dt className="flex flex-col gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted sm:text-xs">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-evergreen-50 text-evergreen-700 sm:h-11 sm:w-11 sm:rounded-2xl">
                <Icon className="h-[1.1rem] w-[1.1rem] sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
              {fact.label}
            </dt>
            <dd className="mt-1 text-[15px] font-semibold leading-snug text-ink sm:text-base">{fact.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export default QuickFacts;
