import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Fact = {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
};

/** Quick-facts strip (visit length, comfort, insurance...). */
export function FactGrid({ facts, className }: { readonly facts: readonly Fact[]; readonly className?: string }) {
  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          // A <dl> may only wrap dt/dd groups: the icon sits inside <dt>,
          // positioned against the card so the layout stays icon-left.
          <div key={fact.label} className="card relative min-h-[5.25rem] p-5 pl-[4.75rem]">
            <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {fact.label}
            </dt>
            <dd className="mt-1 font-semibold leading-snug text-ink">{fact.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export default FactGrid;
