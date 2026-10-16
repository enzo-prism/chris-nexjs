import type { ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";

type ServicePhotoProps = {
  readonly src: string;
  readonly alt: string;
  /** CSS object-position for the crop. */
  readonly focus?: string;
  /** Hero photos are the LCP image: load eagerly, never animate in. */
  readonly priority?: boolean;
  readonly sizes?: string;
  readonly aspect?: string;
  /** Small chip pinned to the photo's top-left corner. */
  readonly label?: string;
  /** Floating card that overlaps the photo's lower edge. */
  readonly badge?: ReactNode;
  readonly className?: string;
};

/** Real practice photo in the Rooted media frame (rounded, soft lift). */
export function ServicePhoto({
  src,
  alt,
  focus = "50% 50%",
  priority = true,
  sizes = "(max-width: 1024px) 100vw, 44vw",
  aspect = "aspect-[4/3] sm:aspect-[16/11] lg:aspect-[5/6]",
  label,
  badge,
  className,
}: ServicePhotoProps) {
  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem] bg-cream-200 shadow-lift ring-1 ring-cream-300/60",
          aspect,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: focus }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-evergreen-950/40 to-transparent"
        />
      </div>
      {badge ? (
        <div className="relative z-10 mx-4 -mt-10 sm:mx-8 lg:absolute lg:-bottom-6 lg:-left-6 lg:mx-0 lg:mt-0 lg:max-w-[19rem]">
          {badge}
        </div>
      ) : null}
      {label ? (
        <figcaption className="absolute left-4 top-4 rounded-full bg-cream-50/90 px-3 py-1 text-xs font-bold text-evergreen-800 shadow-soft backdrop-blur">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** The floating "promise" card used on service-page hero photos. */
export function PhotoBadge({
  icon,
  title,
  children,
}: {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-[1.5rem] border border-cream-300/80 bg-white/95 p-4 shadow-lift backdrop-blur">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
        <ServiceIcon name={icon} className="h-6 w-6" animated={false} />
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-[1.05rem] font-medium leading-snug text-ink">{title}</span>
        {children ? <span className="mt-0.5 block text-sm leading-6 text-ink-muted">{children}</span> : null}
      </span>
    </div>
  );
}

export default ServicePhoto;
