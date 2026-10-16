import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, Phone } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";
import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";
import PageBreadcrumbs, { type BreadcrumbTrailItem } from "@/components/common/PageBreadcrumbs";
import { StarRow } from "./Reviews";
import { ServiceIcon, type ServiceIconName } from "./ServiceIcon";

type PageHeroProps = {
  readonly title: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly lead?: ReactNode;
  readonly crumbs?: BreadcrumbTrailItem[];
  /** Right-hand visual (photo, video, card). Optional. */
  readonly media?: ReactNode;
  readonly icon?: ServiceIconName;
  /** Replace the default request + call buttons. Pass null to hide. */
  readonly actions?: ReactNode | null;
  /** Extra trust chips under the buttons. */
  readonly chips?: readonly ReactNode[];
  /** Show the Google-review chip (default true). */
  readonly showReviews?: boolean;
  /** Phone call first (urgent pages). */
  readonly callFirst?: boolean;
  /** Classes for the media column wrapper (e.g. "hidden lg:block"). */
  readonly mediaClassName?: string;
  /** Pre-fill the request form's visit type. */
  readonly scheduleHref?: string;
  readonly analyticsContext?: string;
  readonly className?: string;
  readonly children?: ReactNode;
};

/** Standard inner-page hero: breadcrumbs, serif H1, lead, actions, proof. */
export function PageHero({
  title,
  eyebrow,
  lead,
  crumbs,
  media,
  icon,
  actions,
  chips = [],
  showReviews = true,
  callFirst = false,
  mediaClassName,
  scheduleHref = "/schedule#appointment",
  analyticsContext = "page-hero",
  className,
  children,
}: PageHeroProps) {
  const request = (
    <Link key="request" href={scheduleHref} className={cn("btn btn-lg", callFirst ? "btn-outline" : "btn-primary")} data-analytics-context={`${analyticsContext}-request`}>
      <CalendarDays aria-hidden="true" />
      Request a visit
    </Link>
  );
  const call = (
    <a
      key="call"
      href={`tel:${officeInfo.phoneE164}`}
      className={cn("btn btn-lg", callFirst ? "btn-primary" : "btn-outline")}
      data-analytics-context={`${analyticsContext}-call`}
      aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
    >
      <Phone aria-hidden="true" />
      {callFirst ? `Call ${officeInfo.phone}` : officeInfo.phone}
    </a>
  );
  const defaultActions = callFirst ? [call, request] : [request, call];

  return (
    <section className={cn("paper relative isolate overflow-hidden", className)}>
      <div
        className={cn(
          "mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20",
          media ? "items-center lg:grid-cols-[1.05fr_0.95fr] lg:gap-14" : null,
        )}
      >
        <div className="relative z-10 max-w-3xl">
          {crumbs ? <PageBreadcrumbs items={crumbs} inline className="mb-6 sm:mb-8" /> : null}
          <div className="rise-in flex items-center gap-3">
            {icon ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300 shadow-soft">
                <ServiceIcon name={icon} className="h-7 w-7" />
              </span>
            ) : null}
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          </div>
          <h1 className="h-display mt-5 text-balance text-[2.35rem] sm:text-[3.1rem] lg:text-[3.6rem]">
            {title}
          </h1>
          {lead ? <p className="lead mt-5 max-w-2xl">{lead}</p> : null}
          {actions !== null ? (
            <div className="rise-in rise-in-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {actions ?? defaultActions}
            </div>
          ) : null}
          {showReviews || chips.length ? (
            <div className="rise-in rise-in-4 mt-6 flex flex-wrap items-center gap-2">
              {showReviews ? (
                <Link href="/testimonials" className="pill transition-colors hover:border-gold-400">
                  <StarRow size="h-3.5 w-3.5" />
                  {GOOGLE_REVIEW_COUNT} five-star Google reviews
                </Link>
              ) : null}
              {chips.map((chip, i) => (
                <span key={i} className="pill">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          {children}
        </div>
        {media ? <div className={cn("relative", mediaClassName)}>{media}</div> : null}
      </div>
    </section>
  );
}

export default PageHero;
