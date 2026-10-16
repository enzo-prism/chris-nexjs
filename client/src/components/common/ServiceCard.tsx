import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Phone } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import type { HubService } from "@/components/services-hub/hubServices";

interface ServiceCardProps {
  readonly service: HubService;
  readonly className?: string;
}

const requestHref = (service: HubService): string =>
  `/schedule?intent=${service.intent}&source=service-card#appointment`;

/**
 * Services-hub card: line icon, plain-language summary, a "best for" line,
 * then one link to the service page and one pre-filled appointment request
 * ("Request an appointment for <Service>"; tests/mobile/cta-flows.spec.ts).
 * Links only (no raw buttons); internal paths use next/link.
 */
const ServiceCard = ({ service, className }: ServiceCardProps) => {
  const urgent = Boolean(service.urgent);
  const wide = Boolean(service.wide);
  return (
    <article
      id={service.anchor}
      className={cn(
        "group relative flex h-full scroll-mt-28 flex-col rounded-[1.75rem] border p-5 sm:p-6",
        wide && "lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto] lg:items-center lg:gap-x-10 lg:p-7",
        urgent ? "surface-evergreen on-dark border-evergreen-800 shadow-lift" : "card card-lift",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
            urgent
              ? "bg-white/10 text-gold-300"
              : "bg-evergreen-50 text-evergreen-700 group-hover:bg-evergreen-800 group-hover:text-gold-300",
          )}
        >
          <ServiceIcon name={service.icon} className="h-7 w-7" />
        </span>
        <h3 className={cn("h-card min-w-0 text-[1.3rem] sm:text-[1.4rem]", urgent && "text-cream-50")}>
          {service.label}
        </h3>
      </div>

      <div className={cn(wide && "lg:mt-0")}>
        <p className={cn("mt-3 text-[15px] leading-7 sm:mt-4", wide && "lg:mt-0", urgent ? "text-evergreen-100" : "text-ink-soft")}>
          {service.summary}
        </p>
        <p
          className={cn(
            "mt-3 flex gap-2.5 rounded-2xl px-4 py-2.5 text-sm leading-6 sm:mt-4 sm:py-3",
            wide && "lg:mt-3",
            urgent ? "bg-white/[0.07] text-cream-100" : "bg-cream-100 text-ink-soft",
          )}
        >
          <Check
            className={cn("mt-1 h-4 w-4 shrink-0", urgent ? "text-gold-300" : "text-evergreen-600")}
            aria-hidden="true"
          />
          <span>
            <span className={cn("font-semibold", urgent ? "text-cream-50" : "text-ink")}>Best for: </span>
            {service.bestFor}
          </span>
        </p>
      </div>

      <div className={cn("mt-auto pt-3 sm:pt-4", wide && "lg:hidden")} />
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-2",
          wide && "lg:flex-col lg:items-stretch lg:justify-center lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0",
          urgent ? "border-white/10" : "border-cream-300/70",
        )}
      >
        <Link
          href={service.href}
          aria-label={`Learn more about ${service.name}`}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold underline decoration-[1.5px] underline-offset-[0.25em] transition-colors",
            urgent
              ? "text-cream-50 decoration-gold-300/70 hover:decoration-gold-300"
              : "text-evergreen-800 decoration-gold-500/60 hover:text-evergreen-950 hover:decoration-gold-500",
          )}
        >
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        {urgent ? (
          <a
            href={`tel:${officeInfo.phoneE164}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-gold-300 transition-colors hover:text-gold-200"
            aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            data-analytics-context="services-card-call"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {officeInfo.phone}
          </a>
        ) : null}
        <Link
          href={requestHref(service)}
          aria-label={`Request an appointment for ${service.name}`}
          data-analytics-context="services-card-request"
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold transition-colors",
            urgent ? "text-cream-100 hover:text-cream-50" : "text-evergreen-700 hover:text-evergreen-950",
          )}
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          Request an appointment
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
