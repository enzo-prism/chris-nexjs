import { cn } from "@/lib/utils";

export type ServiceIconName =
  | "tooth"
  | "checkup"
  | "whitening"
  | "aligner"
  | "implant"
  | "crown"
  | "veneer"
  | "kids"
  | "emergency"
  | "brush"
  | "shield"
  | "gum"
  | "filling"
  | "forms"
  | "insurance"
  | "calendar";

// Shared molar silhouette (same outline as the logo mark).
const TOOTH =
  "M24 9.6c-3.6-2.5-7.8-3.4-11.3-1.8-4.4 2-5.6 6.9-4.8 11.8.8 4.9 3.1 8.4 4.1 12.9 1 4.5 1.4 9 4.1 9.4 2.6.4 3.2-4.4 4-7.9.8-3.5 2-5.4 3.9-5.4s3.1 1.9 3.9 5.4c.8 3.5 1.4 8.3 4 7.9 2.7-.4 3.1-4.9 4.1-9.4 1-4.5 3.3-8 4.1-12.9.8-4.9-.4-9.8-4.8-11.8-3.5-1.6-7.7-.7-11.3 1.8Z";

const shapes: Record<ServiceIconName, readonly string[]> = {
  tooth: [TOOTH],
  checkup: [TOOTH, "M17.5 19.5l4.5 4.5 8.5-9"],
  whitening: [
    TOOTH,
    "M38.5 3.5v7M35 7h7",
    "M14.5 17.5c1.4-2.4 3.4-3.6 6-3.6",
  ],
  aligner: [
    "M7 13c0 15.5 7.6 26 17 26s17-10.5 17-26",
    "M14 13c0 10.4 4.4 18.5 10 18.5S34 23.4 34 13",
    "M7.4 19.5h6.8M33.8 19.5h6.8M10 27.5l5.6-2.4M38 27.5l-5.6-2.4",
  ],
  implant: [
    "M15 11.5c0-3.4 2.8-4.8 5.4-3.6 2.3 1 4.9 1 7.2 0 2.6-1.2 5.4.2 5.4 3.6 0 3.2-1.2 5.4-2.4 6.5H17.4C16.2 16.9 15 14.7 15 11.5Z",
    "M18.5 21.5h11",
    "M20 25h8l-.8 13.5L24 43l-3.2-4.5Z",
    "M19.8 29.5h8.4M20.2 34h7.6",
  ],
  crown: [
    "M10 34c0-4.6 1.6-8 2.4-12.6.5-3 .3-6.1-.8-9.4l7 5.4L24 9l5.4 8.4 7-5.4c-1.1 3.3-1.3 6.4-.8 9.4.8 4.6 2.4 8 2.4 12.6",
    "M10 34c4.3 2 9 3 14 3s9.7-1 14-3",
    "M16 41c2.6.8 5.3 1.2 8 1.2s5.4-.4 8-1.2",
  ],
  veneer: [
    "M6 20c4.2 9.4 10.3 14 18 14s13.8-4.6 18-14",
    "M6 20c5.8 2.4 11.8 3.6 18 3.6S36.2 22.4 42 20",
    "M15.4 22.6v6.2M24 23.6v9.4M32.6 22.6v6.2",
    "M38 7.5v5M35.5 10h5",
  ],
  kids: [
    TOOTH,
    "M19 18.5v1.5M29 18.5v1.5",
    "M18.6 23.8c2.8 3.2 8 3.2 10.8 0",
  ],
  emergency: [TOOTH, "M26.5 12.5l-5.5 8.5h6l-4.5 9"],
  brush: [
    "M9 40.5 29.5 20",
    "M27.2 17.7l7.5-7.5a2.6 2.6 0 0 1 3.7 0l1.4 1.4a2.6 2.6 0 0 1 0 3.7l-7.5 7.5",
    "M31.5 12.5l-3.5-3.5M35.5 16.5 32 13M39.5 20.5 36 17",
    "M8 9.5c1.8 0 3 1.2 3 3 0-1.8 1.2-3 3-3-1.8 0-3-1.2-3-3 0 1.8-1.2 3-3 3Z",
  ],
  shield: [
    "M24 5.5l14.5 5.2v10.6c0 9.3-6.1 16.4-14.5 20.7-8.4-4.3-14.5-11.4-14.5-20.7V10.7Z",
    "M17 23.5l5 5 9.5-10",
  ],
  gum: [
    "M15.5 25c-.9-2.6-2.4-5.6-2.9-8.6-.6-3.7.4-7.4 3.7-8.8 2.6-1.1 5.3-.4 7.7 1.3 2.4-1.7 5.1-2.4 7.7-1.3 3.3 1.4 4.3 5.1 3.7 8.8-.5 3-2 6-2.9 8.6",
    "M6 27.5c3-2.4 6-2.4 9 0s6 2.4 9 0 6-2.4 9 0 6 2.4 9 0",
    "M17 33.5c.6 3.2 1.4 6.5 3 6.8 1.7.2 2.3-3.1 2.8-5.2M31 33.5c-.6 3.2-1.4 6.5-3 6.8-1.7.2-2.3-3.1-2.8-5.2",
  ],
  filling: [TOOTH, "M19.5 15.5c2.8-1.4 6.2-1.4 9 0 .3 2.4-.2 4.5-1.6 6h-5.8c-1.4-1.5-1.9-3.6-1.6-6Z"],
  forms: [
    "M13 6.5h16l8 8V41a1.5 1.5 0 0 1-1.5 1.5h-22A1.5 1.5 0 0 1 12 41V8a1.5 1.5 0 0 1 1-1.5Z",
    "M29 6.5v8h8",
    "M18 22h12M18 28.5h12M18 35h7",
  ],
  insurance: [
    "M6.5 13.5h35a1.5 1.5 0 0 1 1.5 1.5v18a1.5 1.5 0 0 1-1.5 1.5h-35A1.5 1.5 0 0 1 5 33V15a1.5 1.5 0 0 1 1.5-1.5Z",
    "M5 20.5h38",
    "M11 28h9M30 28h5",
  ],
  calendar: [
    "M9.5 10.5h29a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2h-29a2 2 0 0 1-2-2v-26a2 2 0 0 1 2-2Z",
    "M7.5 19h33M16 6.5v8M32 6.5v8",
    "M17.5 29l4 4 9-8.5",
  ],
};

type ServiceIconProps = {
  readonly name: ServiceIconName;
  readonly className?: string;
  /** Redraws the line art when an ancestor `.group` is hovered/focused. */
  readonly animated?: boolean;
  readonly strokeWidth?: number;
};

/** Line-art icon set drawn for the practice (lucide has no dental glyphs). */
export function ServiceIcon({
  name,
  className,
  animated = true,
  strokeWidth = 2.6,
}: ServiceIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-7 w-7", animated && "icon-draw", className)}
    >
      {shapes[name].map((d) => (
        <path key={d} d={d} pathLength={1} />
      ))}
    </svg>
  );
}

export default ServiceIcon;
