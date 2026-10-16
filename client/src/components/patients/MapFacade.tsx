"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

// Google's keyless embed, built from the same practice facts as the map link
// (never a hardcoded address; check-business-info bans those literals).
const embedQuery = encodeURIComponent(
  `${officeInfo.name}, ${officeInfo.address.line1}, ${officeInfo.address.line2}`,
);
const embedSrc = `https://www.google.com/maps?q=${embedQuery}&z=16&output=embed`;

type MapFacadeProps = {
  readonly className?: string;
  readonly analyticsContext?: string;
};

/**
 * Click-to-load map. Until someone asks for the map, this is a real photo of
 * the building sign plus the address — no third-party iframe, cookies, or
 * script weight on page load. One tap swaps in the interactive Google map.
 */
export function MapFacade({ className, analyticsContext = "map" }: MapFacadeProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative isolate aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-evergreen-900 sm:aspect-[16/10]",
        className,
      )}
    >
      {loaded ? (
        <iframe
          src={embedSrc}
          title={`Map of ${officeInfo.name} at ${officeInfo.address.line1}, ${officeInfo.address.city}`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <>
          <Image
            src="/images/tour/office-exterior-poster.webp"
            alt="The practice's sign beside a shaped juniper at the building entrance"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[50%_40%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-evergreen-950/85 via-evergreen-950/30 to-evergreen-950/0"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-cream-50">
              <MapPin className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
              Interactive map loads when you ask
            </p>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="btn btn-gold btn-sm"
              data-analytics-context={`${analyticsContext}-load`}
            >
              <Navigation aria-hidden="true" />
              Show the map
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MapFacade;
