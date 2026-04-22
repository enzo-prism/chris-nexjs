import OptimizedImage from "@/components/seo/OptimizedImage";
import { cn } from "@/lib/utils";

type SupportImageCardProps = {
  src: string;
  alt: string;
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
    </div>
  );
}
