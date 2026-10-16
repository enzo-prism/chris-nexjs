import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

export type ServiceOption = {
  readonly name: string;
  readonly icon?: ServiceIconName;
  readonly tagline?: string;
  /** Small chip in the card corner, e.g. "Most popular". */
  readonly badge?: string;
  readonly features?: readonly string[];
  readonly rows?: readonly { readonly label: string; readonly value: ReactNode }[];
  readonly footer?: ReactNode;
};

const colsClass = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
} as const;

/** Side-by-side treatment options (in-office vs take-home, porcelain vs composite…). */
export function OptionCards({
  options,
  columns = 3,
  rail = false,
  className,
}: {
  readonly options: readonly ServiceOption[];
  readonly columns?: 2 | 3 | 4;
  /** Below `md`: a swipeable row of cards instead of a tall stack. */
  readonly rail?: boolean;
  readonly className?: string;
}) {
  return (
    <ul
      className={cn(
        rail
          ? "snap-rail -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 md:pb-0"
          : "reveal-stagger grid gap-4 sm:gap-5",
        colsClass[columns],
        className,
      )}
    >
      {options.map((option) => (
        <li
          key={option.name}
          className={cn(
            "card card-lift group relative flex flex-col p-5 sm:p-7",
            rail && "w-[84%] max-w-[22rem] md:w-auto md:max-w-none",
          )}
        >
          {option.badge ? (
            <span className="absolute right-5 top-5 rounded-full bg-gold-200 px-3 py-1 text-xs font-bold text-gold-700">
              {option.badge}
            </span>
          ) : null}
          <div className={cn("flex items-center gap-4", option.badge && "pr-24")}>
            {option.icon ? (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors duration-300 group-hover:bg-evergreen-800 group-hover:text-gold-300">
                <ServiceIcon name={option.icon} className="h-7 w-7" />
              </span>
            ) : null}
            <h3 className="h-card text-[1.3rem] sm:text-[1.4rem]">{option.name}</h3>
          </div>
          {option.tagline ? <p className="mt-3 text-[15px] leading-6 text-ink-soft sm:leading-7">{option.tagline}</p> : null}
          {option.features?.length ? (
            <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
              {option.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-[15px] leading-6 text-ink-soft">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
          {option.rows?.length ? (
            <dl className="mt-5 divide-y divide-cream-300/70 border-t border-cream-300/70">
              {option.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[6.75rem_1fr] gap-3 py-3 sm:grid-cols-[7.5rem_1fr]">
                  <dt className="pt-0.5 text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">{row.label}</dt>
                  <dd className="text-[15px] leading-6 text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {option.footer ? <div className="mt-auto pt-5">{option.footer}</div> : null}
        </li>
      ))}
    </ul>
  );
}

export default OptionCards;
