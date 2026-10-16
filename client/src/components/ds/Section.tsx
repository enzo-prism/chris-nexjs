import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "white" | "cream" | "paper" | "evergreen" | "night";

const toneClass: Record<SectionTone, string> = {
  white: "bg-white text-ink",
  cream: "bg-cream-100 text-ink",
  paper: "paper text-ink",
  evergreen: "surface-evergreen on-dark",
  night: "bg-evergreen-950 text-cream-100 on-dark",
};

type SectionProps = {
  readonly id?: string;
  readonly tone?: SectionTone;
  readonly labelledBy?: string;
  readonly label?: string;
  readonly className?: string;
  readonly innerClassName?: string;
  readonly width?: "default" | "narrow" | "wide" | "full";
  readonly spacing?: "default" | "tight" | "none";
  readonly as?: ElementType;
  readonly children: ReactNode;
};

const widthClass = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  wide: "max-w-[90rem]",
  full: "max-w-none",
} as const;

const spacingClass = {
  default: "py-16 sm:py-20 lg:py-28",
  tight: "py-10 sm:py-14",
  none: "",
} as const;

/** Page band with the design system's tones, rhythm, and gutters. */
export function Section({
  id,
  tone = "white",
  labelledBy,
  label,
  className,
  innerClassName,
  width = "default",
  spacing = "default",
  as: Tag = "section",
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      className={cn("relative isolate", toneClass[tone], spacingClass[spacing], className)}
    >
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          widthClass[width],
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}

export default Section;
