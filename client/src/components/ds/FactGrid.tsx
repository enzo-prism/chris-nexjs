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
          <div key={fact.label} className="card flex items-start gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{fact.label}</dt>
              <dd className="mt-1 font-semibold leading-snug text-ink">{fact.value}</dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}

export default FactGrid;
