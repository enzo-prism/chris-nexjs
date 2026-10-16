"use client";

import { Car, Clock, Footprints, Mail, MapPin, Navigation, Phone } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { useHolidayNotice } from "@/components/patients/useHolidayNotice";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { StarRow } from "@/components/ds/Reviews";
import { reviewsFor } from "@/data/serviceReviews";
import OpenNowStatus from "@/components/common/OpenNowStatus";
import { HoursTable } from "@/components/patients/HoursTable";
import { MapFacade } from "@/components/patients/MapFacade";

type OfficeVisitSectionProps = {
  readonly id?: string;
  readonly className?: string;
  readonly eyebrow?: string;
  readonly title?: React.ReactNode;
  readonly subtitle?: string;
  readonly showEmail?: boolean;
  /** Show the phone/email card (off on /contact, where the tiles cover it). */
  readonly showPhone?: boolean;
  readonly analyticsContext?: string;
};

/** Hours, a click-to-load map, directions, and arrival notes. */
export default function OfficeVisitSection({
  id = "visit",
  className,
  eyebrow = "Hours & directions",
  title = (
    <>
      Finding <em>the office</em>
    </>
  ),
  subtitle = "A garden office on Cambridge Avenue, a short walk from California Avenue in Palo Alto.",
  showEmail = false,
  showPhone = false,
  analyticsContext = "visit",
}: OfficeVisitSectionProps): React.JSX.Element {
  const holiday = useHolidayNotice();
  const parkingQuote = reviewsFor(["visit"], 1)[0];

  return (
    <Section id={id} tone="white" labelledBy={`${id}-title`} className={className}>
      <SectionHeading id={`${id}-title`} eyebrow={eyebrow} title={title} lead={subtitle} />

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
        {/* Map + directions */}
        <article className="card self-start overflow-hidden p-2.5 sm:p-3" aria-labelledby={`${id}-map-title`}>
          <MapFacade analyticsContext={analyticsContext} />
          <div className="grid gap-5 px-3 pb-4 pt-5 sm:grid-cols-[1fr_auto] sm:items-end sm:px-4">
            <div>
              <h3 id={`${id}-map-title`} className="h-card text-[1.3rem]">
                Address
              </h3>
              <address className="mt-1.5 text-[15px] not-italic leading-7 text-ink-soft">
                {officeInfo.name}
                <br />
                {officeInfo.address.line1}
                <br />
                {officeInfo.address.line2}
              </address>
            </div>
            <a
              href={officeInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              data-analytics-context={`${analyticsContext}-directions`}
            >
              <Navigation aria-hidden="true" />
              Get directions
              <span className="sr-only"> in Google Maps (opens in a new tab)</span>
            </a>
          </div>

          <ul className="grid gap-3 border-t border-cream-300/70 px-3 pb-3 pt-5 text-[15px] leading-6 text-ink-soft sm:grid-cols-2 sm:px-4">
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-evergreen-50 text-evergreen-700">
                <Car className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span>
                <strong className="block font-semibold text-ink">Parking</strong>
                Nearby street and lot parking. Ask the front desk for the best option when you schedule.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-evergreen-50 text-evergreen-700">
                <Footprints className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span>
                <strong className="block font-semibold text-ink">Arriving</strong>
                Come a few minutes early so check-in and paperwork feel unhurried.
              </span>
            </li>
          </ul>
        </article>

        {/* Hours + phone */}
        <div className="grid content-start gap-5">
          <article className="card p-5 sm:p-6" aria-labelledby={`${id}-hours-title`}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h3 id={`${id}-hours-title`} className="h-card flex items-center gap-2 text-[1.3rem]">
                <Clock className="h-5 w-5 text-evergreen-600" aria-hidden="true" />
                Office hours
              </h3>
              <OpenNowStatus className="text-ink-soft" />
            </div>
            <HoursTable className="mt-4" />
            {holiday ? (
              <p className="mt-4 rounded-2xl bg-gold-200/50 px-4 py-3 text-sm leading-6 text-ink">
                <span className="font-semibold">Schedule update:</span> {holiday.shortNotice}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              Messages sent after hours are answered the next business day. For pain or swelling, call us.
            </p>
          </article>

          {showPhone || showEmail ? (
            <article className="card grid gap-3 p-5 sm:p-6">
              {showPhone ? (
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="group flex min-h-12 items-center gap-3 rounded-2xl text-ink transition-colors hover:text-evergreen-800"
                  data-analytics-context={`${analyticsContext}-call`}
                  aria-label={`Phone the front desk at ${officeInfo.phone}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Front desk</span>
                    <span className="text-lg font-semibold tabular-nums">{officeInfo.phone}</span>
                  </span>
                </a>
              ) : null}
              {showEmail ? (
                <a
                  href={`mailto:${officeInfo.email}`}
                  className="group flex min-h-12 items-center gap-3 rounded-2xl text-ink transition-colors hover:text-evergreen-800"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Email</span>
                    <span className="block break-all font-semibold">{officeInfo.email}</span>
                  </span>
                </a>
              ) : null}
            </article>
          ) : null}

          {parkingQuote ? (
            <figure className="rounded-[1.5rem] bg-cream-100 p-5 sm:p-6">
              <StarRow size="h-3.5 w-3.5" />
              <blockquote className="mt-2 font-heading text-lg leading-8 text-ink">
                <p>“{parkingQuote.text}”</p>
              </blockquote>
              <figcaption className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {parkingQuote.name} · Google review
              </figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

export type { OfficeVisitSectionProps };
