import type { ReactNode } from "react";
import { CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

export type FitItem = string | { readonly label: string; readonly text: string };

function ItemText({ item }: { readonly item: FitItem }) {
  if (typeof item === "string") return <>{item}</>;
  return (
    <>
      <strong className="font-semibold text-ink">{item.label}.</strong> {item.text}
    </>
  );
}

const keyOf = (item: FitItem) => (typeof item === "string" ? item : item.label);

/** "Is this right for you?" — signs it fits, and what gets planned around. */
export function FitChecklist({
  good,
  goodTitle = "Often a good fit if you have",
  plan,
  planTitle = "We’ll plan around",
  note,
  className,
}: {
  readonly good: readonly FitItem[];
  readonly goodTitle?: string;
  readonly plan?: readonly FitItem[];
  readonly planTitle?: string;
  readonly note?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2 lg:gap-5", className)}>
      <div className="card p-5 sm:p-8">
        <h3 className="h-card text-[1.3rem] sm:text-[1.45rem]">{goodTitle}</h3>
        <ul className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
          {good.map((item) => (
            <li key={keyOf(item)} className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
              <span className="text-[15px] leading-6 text-ink-soft sm:text-base sm:leading-7">
                <ItemText item={item} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {plan?.length || note ? (
        <div className="rounded-[1.75rem] border border-cream-300/80 bg-cream-100 p-5 sm:p-8">
          {plan?.length ? (
            <>
              <h3 className="h-card text-[1.3rem] sm:text-[1.45rem]">{planTitle}</h3>
              <ul className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
                {plan.map((item) => (
                  <li key={keyOf(item)} className="flex gap-3">
                    <Info className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
                    <span className="text-[15px] leading-6 text-ink-soft sm:text-base sm:leading-7">
                      <ItemText item={item} />
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {note ? (
            <p className={cn("text-[15px] leading-6 text-ink-soft sm:leading-7", plan?.length && "mt-5 border-t border-cream-300 pt-4 sm:mt-6 sm:pt-5")}>
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default FitChecklist;
