import Image from "next/image";
import { Accessibility, Car, Clock, MapPin, Phone } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

const hoursRows = [
  ["Mon", "monday"],
  ["Tue", "tuesday"],
  ["Wed", "wednesday"],
  ["Thu", "thursday"],
  ["Fri", "friday"],
  ["Sat–Sun", "saturday"],
] as const;

/**
 * Office NAP, hours, parking, and a wayfinding photo of the entrance.
 * Every fact renders from officeInfo or from copy the practice already
 * published (parking specifics are shared by the front desk on request).
 */
export function VisitCard({
  analyticsContext,
  className,
  showPhoto = true,
  showNotes = true,
}: {
  readonly analyticsContext: string;
  readonly className?: string;
  readonly showPhoto?: boolean;
  /** Parking + accessibility notes (off where the page already lists them). */
  readonly showNotes?: boolean;
}) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      {showPhoto ? (
        <figure className="relative aspect-[16/9]">
          <Image
            src="/images/redesign/office-entrance-dr-wong.webp"
            alt="Office entrance with the Christopher Wong D.D.S. sign, a sculpted pine, and Dr. Wong in a white coat"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[55%_40%]"
          />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-cream-50/90 px-3 py-1 text-xs font-semibold text-ink">
            Look for this sign at the entrance
          </figcaption>
        </figure>
      ) : null}
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            <MapPin className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
            The office
          </h3>
          <address className="mt-2 text-[15px] not-italic leading-7 text-ink-soft">
            {officeInfo.name}
            <br />
            {officeInfo.address.line1}
            <br />
            {officeInfo.address.line2}
          </address>
          <div className="mt-2 flex flex-col items-start">
            <a
              href={officeInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-rooted inline-flex min-h-11 items-center gap-1.5"
              data-analytics-context={`${analyticsContext}-directions`}
            >
              <Car className="h-4 w-4" aria-hidden="true" />
              Get directions
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="link-rooted inline-flex min-h-11 items-center gap-1.5"
              data-analytics-context={`${analyticsContext}-call`}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {officeInfo.phone}
            </a>
          </div>
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            <Clock className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
            Regular hours
          </h3>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] text-ink-soft">
            {hoursRows.map(([label, key]) => (
              <div key={key} className="contents">
                <dt className="font-medium text-ink">{label}</dt>
                <dd>{officeInfo.hours[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
        {showNotes ? (
          <div className="sm:col-span-2 rounded-2xl bg-cream-100 p-4 text-[15px] leading-6 text-ink-soft">
            <p className="flex items-start gap-2.5">
              <Car className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-ink">Parking:</strong> nearby street and lot parking. Ask the
                front desk for the best option when you schedule.
              </span>
            </p>
            <p className="mt-2 flex items-start gap-2.5">
              <Accessibility className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
              <span>Accessible parking spaces and wheelchair-accessible entry.</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default VisitCard;
