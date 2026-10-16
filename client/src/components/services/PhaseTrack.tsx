import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

export type Phase = {
  readonly label: string;
  readonly time: string;
  readonly icon: ServiceIconName;
  readonly detail?: string;
  /** Relative width on wide screens (rough share of the timeline). */
  readonly weight?: number;
  readonly tone?: "light" | "mid" | "deep" | "gold";
};

const barTone = {
  light: "bg-evergreen-200",
  mid: "bg-evergreen-400",
  deep: "bg-gradient-to-r from-evergreen-600 to-evergreen-800",
  gold: "bg-gradient-to-r from-gold-300 to-gold-500",
} as const;

const barToneVertical = {
  light: "bg-evergreen-200",
  mid: "bg-evergreen-400",
  deep: "bg-gradient-to-b from-evergreen-600 to-evergreen-800",
  gold: "bg-gradient-to-b from-gold-300 to-gold-500",
} as const;

/**
 * A treatment timeline drawn as proportional phases: a vertical track on
 * phones, one horizontal bar on wide screens. Pure CSS, icon-led.
 */
export function PhaseTrack({
  phases,
  label,
  className,
}: {
  readonly phases: readonly Phase[];
  readonly label: string;
  readonly className?: string;
}) {
  return (
    <ol aria-label={label} className={cn("grid gap-3 lg:flex lg:gap-2", className)}>
      {phases.map((phase) => {
        const tone = phase.tone ?? "mid";
        return (
          <li
            key={phase.label}
            className="reveal group flex gap-4 lg:min-w-0 lg:flex-col lg:gap-3"
            style={{ flexGrow: phase.weight ?? 1, flexBasis: 0 }}
          >
            <span
              aria-hidden="true"
              className={cn("w-2.5 shrink-0 self-stretch rounded-full lg:hidden", barToneVertical[tone])}
            />
            <span
              aria-hidden="true"
              className={cn("hidden h-3 w-full rounded-full lg:order-2 lg:block", barTone[tone])}
            />
            <div className="flex flex-1 items-start gap-3 py-1 lg:order-1 lg:flex-col lg:gap-2 lg:py-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cream-300/80 bg-white text-evergreen-700 shadow-soft">
                <ServiceIcon name={phase.icon} className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-[1.1rem] font-medium leading-snug text-ink">{phase.label}</span>
                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-evergreen-600">{phase.time}</span>
                {phase.detail ? (
                  <span className="mt-1 block text-sm leading-6 text-ink-muted lg:hidden">{phase.detail}</span>
                ) : null}
              </span>
            </div>
            {phase.detail ? (
              <p className="hidden text-sm leading-6 text-ink-muted lg:order-3 lg:block">{phase.detail}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default PhaseTrack;
