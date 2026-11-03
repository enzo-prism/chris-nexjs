import React, { type JSX } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export const INVISALIGN_VIDEO_SIZES = "(min-width:1024px) 600px, 100vw";
export const INVISALIGN_VIDEO_SIZES_SINGLE = "(min-width:1024px) 720px, 100vw";
export const INVISALIGN_GRAPHIC_SIZES = "(min-width:1024px) 292px, 50vw";

function isUnoptimizedSrc(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}

export function InvisalignMediaImage({
  src,
  alt,
  sizes,
  width,
  height,
  fit = "cover",
  className,
}: {
  readonly src: string;
  readonly alt: string;
  readonly sizes: string;
  readonly width?: number;
  readonly height?: number;
  readonly fit?: "cover" | "contain";
  readonly className?: string;
}): JSX.Element {
  const objectClass = fit === "contain" ? "object-contain" : "object-cover";

  if (isUnoptimizedSrc(src)) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full", objectClass, className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading="lazy"
      className={cn(objectClass, className)}
    />
  );
}

export default InvisalignMediaImage;
