"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  fit?: "cover" | "contain";
  style?: CSSProperties;
  useIntrinsicAspect?: boolean;
  objectPosition?: string;
  fetchPriority?: "high" | "low" | "auto";
}

const FALLBACK_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+";

const DEFAULT_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 1200px";

const OptimizedImage = ({
  src,
  alt,
  srcSet,
  sizes,
  className = "",
  width,
  height,
  priority = false,
  placeholder = FALLBACK_PLACEHOLDER,
  fit = "cover",
  style,
  useIntrinsicAspect = false,
  objectPosition = "center",
  fetchPriority,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const resolvedWidth = width ?? 1200;
  const resolvedHeight = height ?? 900;

  const wrapperStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      ...(useIntrinsicAspect && aspectRatio ? { aspectRatio: `${aspectRatio}` } : {}),
      ...(useIntrinsicAspect && !aspectRatio ? { minHeight: 200 } : {}),
    }),
    [aspectRatio, style, useIntrinsicAspect],
  );

  const objectClass = fit === "contain" ? "object-contain" : "object-cover";
  const heightClass =
    useIntrinsicAspect ? "h-full" : fit === "contain" ? "h-auto" : "h-full";

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (useIntrinsicAspect) {
      const target = event.currentTarget;
      if (target.naturalWidth && target.naturalHeight) {
        setAspectRatio(target.naturalWidth / target.naturalHeight);
      }
    }
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  const canUseNextImage = !srcSet;
  const shouldUseBlur = placeholder.startsWith("data:image");

  return (
    <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          width={resolvedWidth}
          height={resolvedHeight}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          style={{ objectPosition }}
          aria-hidden="true"
        />
      )}

      {canUseNextImage ? (
        <Image
          src={src}
          alt={alt}
          width={resolvedWidth}
          height={resolvedHeight}
          sizes={sizes ?? DEFAULT_SIZES}
          priority={priority}
          fetchPriority={fetchPriority}
          loading={priority ? undefined : "lazy"}
          decoding={priority ? "sync" : "async"}
          placeholder={shouldUseBlur ? "blur" : "empty"}
          blurDataURL={shouldUseBlur ? placeholder : undefined}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full ${heightClass} ${objectClass} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          width={resolvedWidth}
          height={resolvedHeight}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={fetchPriority}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full ${heightClass} ${objectClass} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
