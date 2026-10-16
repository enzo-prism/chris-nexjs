import { Bike, Car, MapPin } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { LocationRoute } from "@/data/locations";

// Abstract route art (not a map). North is up and each city starts on the
// side it really lies relative to the office (Menlo Park northwest, Stanford
// west, Mountain View southeast); distances are not to scale. One strand per
// way to get there; strands draw once on load (draw-path).
type Pt = { readonly x: number; readonly y: number };
type Side = "above" | "below" | "left" | "right" | "aboveLeft";
type Geometry = {
  readonly start: Pt;
  readonly end: Pt;
  readonly strands: readonly [string, string];
  readonly originLabel: Side;
  readonly officeLabel: Side;
  readonly scaleNote: "tl" | "bl" | "br";
};

const W = 360;
const H = 170;

const GEOMETRY: Record<LocationRoute["direction"], Geometry> = {
  nw: {
    start: { x: 64, y: 46 },
    end: { x: 306, y: 122 },
    strands: [
      "M64 46 C 128 46 146 98 196 94 S 266 122 306 122",
      "M64 46 C 140 28 220 56 256 88 S 294 118 306 122",
    ],
    originLabel: "above",
    officeLabel: "above",
    scaleNote: "bl",
  },
  w: {
    start: { x: 64, y: 98 },
    end: { x: 308, y: 86 },
    strands: [
      "M64 98 C 120 60 172 60 210 80 S 274 102 308 86",
      "M64 98 C 140 112 200 128 246 112 S 294 94 308 86",
    ],
    originLabel: "below",
    officeLabel: "above",
    scaleNote: "tl",
  },
  se: {
    start: { x: 314, y: 128 },
    end: { x: 62, y: 50 },
    strands: [
      "M314 128 C 250 128 230 78 176 84 S 104 50 62 50",
      "M314 128 C 240 150 172 128 126 98 S 78 58 62 50",
    ],
    originLabel: "aboveLeft",
    officeLabel: "above",
    scaleNote: "bl",
  },
};

const sideClass: Record<Side, string> = {
  above: "-translate-x-1/2 -translate-y-[calc(100%+0.9rem)] text-center",
  below: "-translate-x-1/2 translate-y-[0.9rem] text-center",
  left: "-translate-x-[calc(100%+0.9rem)] -translate-y-1/2 text-right",
  right: "translate-x-[0.9rem] -translate-y-1/2",
  aboveLeft: "-translate-x-[calc(100%-0.75rem)] -translate-y-[calc(100%+0.9rem)] text-right",
};

const scaleClass = {
  tl: "left-4 top-3 sm:left-5 sm:top-4",
  bl: "bottom-3 left-4 sm:bottom-4 sm:left-5",
  br: "bottom-3 right-4 sm:bottom-4 sm:right-5",
} as const;

const at = (pt: Pt) => ({ left: `${(pt.x / W) * 100}%`, top: `${(pt.y / H) * 100}%` });

const modeIcon = { car: Car, bike: Bike } as const;

/** Google Maps directions from the city to the office (built from officeInfo). */
export function directionsUrl(origin: string, mode: "car" | "bike" = "car"): string {
  const destination = `${officeInfo.name}, ${officeInfo.address.line1}, ${officeInfo.address.line2}`;
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: mode === "bike" ? "bicycling" : "driving",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** "From {city}" route card: abstract route art plus the published travel facts. */
export function RouteCard({
  route,
  analyticsContext,
  className,
}: {
  readonly route: LocationRoute;
  readonly analyticsContext: string;
  readonly className?: string;
}) {
  const geo = GEOMETRY[route.direction];
  const START = geo.start;
  const END = geo.end;
  const strands = geo.strands.slice(0, Math.min(2, Math.max(1, route.ways.length)));
  const secondIsBike = route.modes[1] === "bike";

  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="paper relative border-b border-cream-300/70">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true" focusable="false">
          {/* growth rings around the office */}
          <g fill="none" stroke="#B0D1C1" strokeWidth="1">
            <circle cx={END.x} cy={END.y} r="24" opacity="0.9" />
            <circle cx={END.x} cy={END.y} r="42" opacity="0.6" />
            <circle cx={END.x} cy={END.y} r="62" opacity="0.35" />
            <circle cx={END.x} cy={END.y} r="84" opacity="0.2" />
          </g>
          {/* soft "road beds" under each strand */}
          {strands.map((d) => (
            <path key={`bed-${d}`} d={d} fill="none" stroke="#EADFC8" strokeWidth="11" strokeLinecap="round" />
          ))}
          {strands.map((d, i) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              fill="none"
              stroke={i === 0 ? "#C9973A" : "#2F7A5F"}
              strokeWidth={i === 0 ? 3.2 : 2.6}
              strokeLinecap="round"
              strokeDasharray={i === 1 && secondIsBike ? "0.012 0.018" : undefined}
              className={i === 1 && secondIsBike ? undefined : "draw-path"}
              style={i === 1 && !secondIsBike ? { animationDelay: "0.35s" } : undefined}
            />
          ))}
          {/* start */}
          <circle cx={START.x} cy={START.y} r="8" fill="#FDFBF7" stroke="#1F5A45" strokeWidth="3" />
          {/* office */}
          <circle cx={END.x} cy={END.y} r="14" fill="#E0B65E" opacity="0.35" className="ring-ripple" />
          <circle cx={END.x} cy={END.y} r="10" fill="#0E3B2E" />
          <circle cx={END.x} cy={END.y} r="3.6" fill="#E0B65E" />
        </svg>
        <p
          className={cn(
            "pointer-events-none absolute whitespace-nowrap rounded-full border border-cream-300 bg-cream-50/95 px-2.5 py-1 text-xs font-semibold leading-none text-ink shadow-soft",
            sideClass[geo.originLabel],
          )}
          style={at(START)}
        >
          {route.origin}
        </p>
        <p
          className={cn(
            "pointer-events-none absolute whitespace-nowrap rounded-full bg-evergreen-800 px-2.5 py-1 text-xs font-bold leading-none text-cream-50 shadow-soft",
            sideClass[geo.officeLabel],
          )}
          style={at(END)}
        >
          Our office
        </p>
        <p
          className={cn(
            "pointer-events-none absolute text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted/80",
            scaleClass[geo.scaleNote],
          )}
        >
          N ↑ · Not to scale
        </p>
      </div>

      <div className="p-6 sm:p-7">
        <ol className="relative grid gap-5">
          <span aria-hidden="true" className="absolute bottom-4 left-[0.6875rem] top-4 w-px bg-gradient-to-b from-evergreen-300 via-gold-400 to-evergreen-700" />
          <li className="relative flex items-start gap-4">
            <span aria-hidden="true" className="relative z-10 mt-0.5 h-[1.375rem] w-[1.375rem] shrink-0 rounded-full border-[3px] border-evergreen-700 bg-cream-50" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Start</p>
              <p className="mt-0.5 font-semibold text-ink">{route.origin}</p>
            </div>
          </li>
          <li className="relative flex items-start gap-4">
            <span aria-hidden="true" className="relative z-10 mt-1 flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{route.summary}</p>
              <ul className="mt-2 flex flex-wrap items-center gap-2">
                {route.ways.map((way, i) => {
                  const Icon = modeIcon[route.modes[i] ?? route.modes[0] ?? "car"];
                  return (
                    <li key={way} className="flex items-center gap-2">
                      {i > 0 ? <span className="text-sm text-ink-muted">or</span> : null}
                      <span className="pill border-cream-300 bg-cream-50">
                        <span
                          aria-hidden="true"
                          className={cn("h-1 w-4 rounded-full", i === 0 ? "bg-gold-500" : "bg-evergreen-600")}
                        />
                        <Icon className="h-4 w-4 text-evergreen-700" aria-hidden="true" />
                        {way}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
          <li className="relative flex items-start gap-4">
            <span aria-hidden="true" className="relative z-10 mt-0.5 flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-full bg-evergreen-800">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Arrive</p>
              <p className="mt-0.5 font-semibold text-ink">{officeInfo.address.line1}</p>
              <p className="text-[15px] text-ink-soft">California Avenue district, {officeInfo.address.city}</p>
            </div>
          </li>
        </ol>
        <a
          href={directionsUrl(route.mapsOrigin)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline mt-6 w-full sm:w-auto"
          data-analytics-context={`${analyticsContext}-route-directions`}
        >
          <MapPin aria-hidden="true" />
          Directions from {route.origin}
          <span className="sr-only"> (opens Google Maps in a new tab)</span>
        </a>
      </div>
    </div>
  );
}

export default RouteCard;
