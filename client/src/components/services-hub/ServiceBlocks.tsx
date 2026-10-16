import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

/* Compact building blocks for the preventive/family and restorative service
   pages (SEO report §5a template, tuned to stay short on phones). Everything
   is server-renderable: no hooks, no handlers, native <details> only.
   Pair with the shared helpers in components/services/. */

/* Phones: a swipeable row (keeps pages short). sm+: a grid. Utilities only,
   because the global .snap-rail rule is unlayered and would beat sm:grid. */
const railList =
  "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0";
const railItem = "w-[82%] max-w-[21rem] shrink-0 snap-start sm:w-auto sm:max-w-none";

function RailHint({ show, count }: { readonly show: boolean; readonly count: number }) {
  if (!show || count < 2) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted sm:hidden" aria-hidden="true">
      Swipe for all {count}
      <ArrowRight className="h-3.5 w-3.5" />
    </p>
  );
}

const gridCols = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

/* ------------------------------------------------------------ Quick facts */
export type QuickFact = {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
};

/** Four answer-first facts in one card: 2 columns on phones, 4 on desktop. */
export function QuickFacts({ facts, className }: { readonly facts: readonly QuickFact[]; readonly className?: string }) {
  return (
    <dl
      className={cn(
        "card grid grid-cols-2 gap-x-5 gap-y-5 p-5 sm:p-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-cream-300/70 lg:px-2",
        className,
      )}
    >
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          <div key={fact.label} className="flex min-w-0 flex-col gap-1.5 lg:px-6">
            <dt className="flex items-center gap-2 text-[11px] font-bold uppercase leading-4 tracking-[0.14em] text-ink-muted">
              <Icon className="h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
              {fact.label}
            </dt>
            <dd className="text-[15px] font-semibold leading-snug text-ink">{fact.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/* ------------------------------------- Is this right for you? + definition */
export function FitAndDefinition({
  fitId,
  fitEyebrow = "Is this right for you?",
  fitTitle,
  fitLead,
  signs,
  signsNote,
  whatId,
  whatEyebrow = "In plain language",
  whatTitle,
  children,
  className,
}: {
  readonly fitId: string;
  readonly fitEyebrow?: ReactNode;
  readonly fitTitle: ReactNode;
  readonly fitLead?: ReactNode;
  readonly signs: readonly ReactNode[];
  readonly signsNote?: ReactNode;
  readonly whatId: string;
  readonly whatEyebrow?: ReactNode;
  readonly whatTitle: ReactNode;
  /** The answer-first definition (80–150 words). */
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn("grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14", className)}>
      <div>
        <SectionHeading id={fitId} eyebrow={fitEyebrow} title={fitTitle} lead={fitLead} />
        <ul className="reveal-stagger mt-6 grid gap-2 sm:mt-7 sm:gap-2.5">
          {signs.map((sign, i) => (
            <li
              key={i}
              className="flex items-start gap-3.5 rounded-2xl border border-cream-300/70 bg-cream-50 px-4 py-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-evergreen-800 text-gold-300">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="text-[15px] leading-6 text-ink sm:text-base">{sign}</span>
            </li>
          ))}
        </ul>
        {signsNote ? <p className="mt-4 text-[15px] leading-7 text-ink-muted">{signsNote}</p> : null}
      </div>
      <article
        aria-labelledby={whatId}
        className="reveal relative self-start overflow-hidden rounded-[1.75rem] bg-evergreen-900 p-6 text-cream-100 shadow-lift sm:p-9 lg:mt-2"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[url('/brand/roots-glow.svg')] bg-[length:1100px_280px] bg-[position:center_-70px] bg-no-repeat opacity-30"
        />
        <div className="on-dark relative">
          <p className="eyebrow eyebrow-light">{whatEyebrow}</p>
          <h2 id={whatId} className="h-section mt-4 text-[1.8rem] sm:text-[2.15rem]">
            {whatTitle}
          </h2>
          <div className="mt-4 space-y-3.5 text-base leading-7 text-evergreen-100 sm:mt-5 sm:space-y-4 sm:text-[1.0625rem] sm:leading-8 [&_a]:font-semibold [&_a]:text-gold-300 [&_a]:underline [&_a]:decoration-gold-300/50 [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-cream-50">
            {children}
          </div>
        </div>
      </article>
    </div>
  );
}

/* ------------------------------------------- Spoke cards (link to pages) */
export type Spoke = {
  readonly title: string;
  readonly body: ReactNode;
  readonly icon?: ServiceIconName;
  /** Small label, e.g. "Often one visit". */
  readonly tag?: string;
  readonly points?: readonly string[];
  readonly href?: string;
  readonly linkLabel?: string;
};

/** Treatment/topic cards; on phones they become a swipe row when `rail`. */
export function SpokeCards({
  items,
  columns = 3,
  rail = false,
  className,
}: {
  readonly items: readonly Spoke[];
  readonly columns?: 2 | 3 | 4;
  readonly rail?: boolean;
  readonly className?: string;
}) {
  return (
    <>
      <ul className={cn(rail ? railList : "reveal-stagger grid gap-4", "sm:gap-4", gridCols[columns], className)}>
        {items.map((item) => (
          <li key={item.title} className={cn("card card-lift group flex flex-col p-5 sm:p-6", rail && railItem)}>
            <div className="flex items-center gap-4">
              {item.icon ? (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors duration-300 group-hover:bg-evergreen-800 group-hover:text-gold-300">
                  <ServiceIcon name={item.icon} className="h-7 w-7" />
                </span>
              ) : null}
              <div className="min-w-0">
                {item.tag ? (
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-700">{item.tag}</p>
                ) : null}
                <h3 className={cn("h-card text-[1.25rem] sm:text-[1.35rem]", item.tag ? "mt-0.5" : null)}>
                  {item.title}
                </h3>
              </div>
            </div>
            <div className="mt-3 text-[15px] leading-7 text-ink-soft">{item.body}</div>
            {item.points?.length ? (
              <ul className="mt-3 space-y-1.5">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[15px] leading-6 text-ink-soft">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="link-rooted mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-3 text-[15px]"
              >
                {item.linkLabel ?? `More about ${item.title.toLowerCase()}`}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
      <RailHint show={rail} count={items.length} />
    </>
  );
}

/* ------------------------------------------- Comfort & technology points */
export type IconPoint = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: ReactNode;
};

/** Small icon cards for comfort and technology (true claims only). */
export function IconPoints({
  items,
  columns = 2,
  rail = false,
  headingLevel = "h3",
  className,
}: {
  readonly items: readonly IconPoint[];
  readonly columns?: 2 | 3 | 4;
  readonly rail?: boolean;
  readonly headingLevel?: "h3" | "h4";
  readonly className?: string;
}) {
  const Heading = headingLevel;
  return (
    <>
      <ul className={cn(rail ? railList : "reveal-stagger grid gap-3", "sm:gap-3", gridCols[columns], className)}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className={cn("card flex items-start gap-4 p-5", rail && railItem)}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <Heading className="font-semibold leading-snug text-ink">{item.title}</Heading>
                <p className="mt-1 text-[15px] leading-6 text-ink-soft">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <RailHint show={rail} count={items.length} />
    </>
  );
}

/* ----------------------------------------------------------- Aside note */
/** Cream side note (tips, "coming as a family?", "when to call"). */
export function AsideNote({
  title,
  children,
  icon,
  href,
  linkLabel,
  className,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly icon?: ServiceIconName;
  readonly href?: string;
  readonly linkLabel?: string;
  readonly className?: string;
}) {
  return (
    <div className={cn("rounded-[1.75rem] border border-cream-300/80 bg-cream-100 p-6", className)}>
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-evergreen-700 shadow-soft">
            <ServiceIcon name={icon} className="h-6 w-6" animated={false} />
          </span>
        ) : null}
        <h3 className="h-card text-[1.2rem]">{title}</h3>
      </div>
      <div className="mt-2.5 space-y-2 text-[15px] leading-7 text-ink-soft">{children}</div>
      {href ? (
        <Link href={href} className="link-rooted mt-2 inline-flex min-h-11 items-center gap-1.5 text-[15px]">
          {linkLabel ?? "Learn more"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
