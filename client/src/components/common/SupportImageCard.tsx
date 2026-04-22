import OptimizedImage from "@/components/seo/OptimizedImage";
import { cn } from "@/lib/utils";

type SupportImageCardProps = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  objectPosition?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

export default function SupportImageCard({
  src,
  alt,
  eyebrow,
  title,
  description,
  className,
  objectPosition = "50% 50%",
  priority = false,
  width = 1536,
  height = 1024,
  sizes = "(max-width: 1024px) 100vw, 38vw",
}: SupportImageCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm",
        className,
      )}
    >
      <div className="relative">
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          quality={72}
          className="aspect-[3/2] w-full"
          objectPosition={objectPosition}
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
          {eyebrow}
        </div>
      </div>
      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}
