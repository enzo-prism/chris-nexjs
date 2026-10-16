import { cn } from "@/lib/utils";

type Place = {
  readonly name: string;
  /** Position in a 100×100 box. Directions are roughly true; distances are not. */
  readonly x: number;
  readonly y: number;
  /** Which side of the dot the label sits on. */
  readonly side: "t" | "b" | "l" | "r";
  /** Has its own page (bigger node, gold strand from the office). */
  readonly primary?: boolean;
  /** Which way the strand bows (keeps it clear of the office label). */
  readonly bow?: 1 | -1;
};

const OFFICE = { x: 50, y: 50 } as const;

// North is up. The Peninsula runs northwest (Redwood City) to southeast
// (Sunnyvale); the office sits between, in Palo Alto's California Ave district.
const places: readonly Place[] = [
  { name: "Redwood Shores", x: 40, y: 10, side: "r" },
  { name: "Redwood City", x: 16, y: 21, side: "t" },
  { name: "Atherton", x: 21, y: 37, side: "t" },
  { name: "Menlo Park", x: 38, y: 30, side: "r", primary: true },
  { name: "Stanford", x: 29, y: 51, side: "l", primary: true },
  { name: "Mountain View", x: 75, y: 66, side: "b", primary: true, bow: -1 },
  { name: "Los Altos", x: 58, y: 75, side: "l" },
  { name: "Los Altos Hills", x: 40, y: 85, side: "b" },
  { name: "Sunnyvale", x: 88, y: 79, side: "b" },
  { name: "Cupertino", x: 66, y: 91, side: "r" },
];

const labelPosition: Record<Place["side"], string> = {
  t: "-translate-x-1/2 -translate-y-[calc(100%+0.5rem)]",
  b: "-translate-x-1/2 translate-y-[0.5rem]",
  l: "-translate-x-[calc(100%+0.55rem)] -translate-y-1/2",
  r: "translate-x-[0.55rem] -translate-y-1/2",
};

// Primary nodes are larger, so their labels sit a little farther out.
const primaryLabelPosition: Record<Place["side"], string> = {
  t: "-translate-x-1/2 -translate-y-[calc(100%+0.85rem)]",
  b: "-translate-x-1/2 translate-y-[0.85rem]",
  l: "-translate-x-[calc(100%+0.95rem)] -translate-y-1/2",
  r: "translate-x-[0.95rem] -translate-y-1/2",
};

/** A curved strand from the office to a place (quadratic, bowed to one side). */
function strand(place: Place): string {
  const mx = (OFFICE.x + place.x) / 2;
  const my = (OFFICE.y + place.y) / 2;
  const dx = place.x - OFFICE.x;
  const dy = place.y - OFFICE.y;
  // control point offset perpendicular to the line
  const k = 0.22 * (place.bow ?? 1);
  const cx = mx - dy * k;
  const cy = my + dx * k;
  return `M${OFFICE.x} ${OFFICE.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${place.x} ${place.y}`;
}

/**
 * Decorative "growth rings" map of the communities patients come from,
 * centered on the office. Not to scale; the hub lists every place in text.
 */
export function PeninsulaMap({ className }: { readonly className?: string }) {
  return (
    <figure className={cn("card relative overflow-hidden p-3 sm:p-5", className)}>
      <div className="paper relative aspect-square w-full overflow-hidden rounded-[1.4rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
          <g fill="none" stroke="#B0D1C1" vectorEffect="non-scaling-stroke">
            {[12, 24, 36, 48].map((r, i) => (
              <circle
                key={r}
                cx={OFFICE.x}
                cy={OFFICE.y}
                r={r}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                opacity={0.95 - i * 0.2}
                strokeDasharray={i === 3 ? "2 3" : undefined}
              />
            ))}
          </g>
          {places
            .filter((place) => place.primary)
            .map((place, i) => (
              <path
                key={place.name}
                d={strand(place)}
                pathLength={1}
                fill="none"
                stroke="#C9973A"
                strokeWidth="0.6"
                strokeLinecap="round"
                className="draw-path"
                style={{ animationDelay: `${0.2 + i * 0.25}s` }}
              />
            ))}
          {places.map((place) =>
            place.primary ? (
              <g key={place.name}>
                <circle cx={place.x} cy={place.y} r="2.3" fill="#FDFBF7" stroke="#1F5A45" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              </g>
            ) : (
              <circle key={place.name} cx={place.x} cy={place.y} r="1.25" fill="#5C6A63" opacity="0.75" />
            ),
          )}
          <circle cx={OFFICE.x} cy={OFFICE.y} r="5" fill="#E0B65E" opacity="0.35" className="ring-ripple" />
          <circle cx={OFFICE.x} cy={OFFICE.y} r="3.4" fill="#0E3B2E" />
          <circle cx={OFFICE.x} cy={OFFICE.y} r="1.2" fill="#E0B65E" />
        </svg>

        <ul aria-hidden="true" className="absolute inset-0">
          {places.map((place) => (
            <li
              key={place.name}
              className={cn(
                "absolute whitespace-nowrap text-[11.5px] leading-none sm:text-[13px]",
                place.primary ? primaryLabelPosition[place.side] : labelPosition[place.side],
                place.primary ? "font-bold text-evergreen-800" : "font-medium text-ink-muted",
              )}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
            >
              {place.name}
            </li>
          ))}
          <li
            className={cn(
              "absolute whitespace-nowrap rounded-full bg-evergreen-800 px-2.5 py-1 text-[11.5px] font-bold leading-none text-cream-50 shadow-soft sm:text-[13px]",
              "-translate-x-1/2 translate-y-[0.9rem]",
            )}
            style={{ left: `${OFFICE.x}%`, top: `${OFFICE.y}%` }}
          >
            Our office
          </li>
        </ul>
        <span className="absolute bottom-2.5 right-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted/80">
          N ↑ · Not to scale
        </span>
      </div>
      <figcaption className="px-2 pb-1 pt-4 text-[15px] leading-6 text-ink-soft sm:px-1">
        Patients come from up and down the Peninsula to one office in Palo Alto’s California Avenue district.
      </figcaption>
    </figure>
  );
}

export default PeninsulaMap;
