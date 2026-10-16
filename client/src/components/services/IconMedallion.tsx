import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

/** Decorative ringed medallion: the service's line icon draws itself on scroll. */
export function IconMedallion({ name, className }: { readonly name: ServiceIconName; readonly className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36", className)}>
      <span className="ring-ripple absolute inset-0 rounded-full border border-gold-300/80" />
      <span className="ring-ripple absolute inset-0 rounded-full border border-evergreen-300/70 [animation-delay:2.4s]" />
      <span className="absolute inset-3 rounded-full bg-gradient-to-br from-evergreen-700 to-evergreen-950 shadow-lift" />
      <span className="reveal-draw relative text-gold-300">
        <ServiceIcon name={name} className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={2.2} animated={false} />
      </span>
    </div>
  );
}

/** Chip list of conditions a treatment can help with. */
export function TreatsChips({ items, className }: { readonly items: readonly string[]; readonly className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-3.5 py-1.5 text-[15px] font-medium leading-snug text-ink-soft"
        >
          <Check className="h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default IconMedallion;
