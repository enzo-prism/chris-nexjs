import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FeatureIcon — the site's premium "icon chip" treatment.
 *
 * Renders a Lucide icon inside a soft two-tone, ring-bordered container so the
 * accent icons on marketing surfaces read as deliberate and refined rather than
 * a flat tinted circle. Pair with the global 1.5px Lucide stroke (see
 * app/globals.css) for the intended look.
 *
 * Tone/size class strings are written as full literals (not interpolated) so
 * Tailwind's content scanner keeps them.
 */
export type FeatureIconTone =
  | "primary"
  | "emerald"
  | "rose"
  | "amber"
  | "slate";

export type FeatureIconSize = "sm" | "md" | "lg";
export type FeatureIconShape = "squircle" | "circle";

const toneStyles: Record<FeatureIconTone, string> = {
  primary: "from-primary/[0.14] to-primary/[0.03] text-primary ring-primary/15",
  emerald:
    "from-emerald-500/[0.14] to-emerald-500/[0.03] text-emerald-600 ring-emerald-500/15",
  rose: "from-rose-500/[0.14] to-rose-500/[0.03] text-rose-600 ring-rose-500/15",
  amber:
    "from-amber-500/[0.16] to-amber-500/[0.04] text-amber-600 ring-amber-500/20",
  slate:
    "from-slate-500/[0.10] to-slate-500/[0.03] text-slate-600 ring-slate-500/15",
};

const sizeStyles: Record<
  FeatureIconSize,
  { box: string; icon: string; radius: string }
> = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4", radius: "rounded-xl" },
  md: { box: "h-11 w-11", icon: "h-5 w-5", radius: "rounded-2xl" },
  lg: { box: "h-14 w-14", icon: "h-6 w-6", radius: "rounded-2xl" },
};

type FeatureIconProps = {
  readonly icon: LucideIcon;
  readonly tone?: FeatureIconTone;
  readonly size?: FeatureIconSize;
  readonly shape?: FeatureIconShape;
  readonly className?: string;
  readonly iconClassName?: string;
};

export function FeatureIcon({
  icon: Icon,
  tone = "primary",
  size = "md",
  shape = "squircle",
  className,
  iconClassName,
}: FeatureIconProps) {
  const { box, icon, radius } = sizeStyles[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br ring-1 ring-inset shadow-[0_1px_2px_-1px_rgba(15,23,42,0.12)]",
        box,
        shape === "circle" ? "rounded-full" : radius,
        toneStyles[tone],
        className,
      )}
    >
      <Icon className={cn(icon, iconClassName)} aria-hidden="true" />
    </span>
  );
}

export default FeatureIcon;
