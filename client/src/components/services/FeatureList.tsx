import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type Feature = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: ReactNode;
};

const colsClass = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/** Icon cards for comfort, technology, and approach (true claims only). */
export function FeatureGrid({
  features,
  columns = 3,
  headingLevel = "h3",
  rail = false,
  className,
}: {
  readonly features: readonly Feature[];
  readonly columns?: 2 | 3 | 4;
  readonly headingLevel?: "h3" | "h4";
  /** Phones: a swipeable row of cards instead of a tall stack. */
  readonly rail?: boolean;
  readonly className?: string;
}) {
  const Heading = headingLevel;
  return (
    <ul
      className={cn(
        rail ? "snap-rail -mx-4 px-4 sm:mx-0 sm:grid sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0" : "reveal-stagger grid gap-4",
        colsClass[columns],
        className,
      )}
    >
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <li
            key={feature.title}
            className={cn(
              "card flex gap-4 p-5 sm:flex-col sm:p-6",
              rail && "w-[16.5rem] flex-col gap-3 sm:w-auto",
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <Heading className="font-heading text-[1.15rem] font-medium leading-snug text-ink sm:text-[1.25rem]">
                {feature.title}
              </Heading>
              <p className="mt-1.5 text-[15px] leading-6 text-ink-soft sm:leading-7">{feature.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default FeatureGrid;
