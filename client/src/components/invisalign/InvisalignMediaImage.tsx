import React, { type JSX } from "react";
import Image from "next/image";

import {
  assertProductionSrc,
  type ProductionMediaSrc,
} from "@/pages/invisalignConsultMedia";
import { cn } from "@/lib/utils";

export const INVISALIGN_VIDEO_SIZES = "(min-width:1024px) 600px, 100vw";
export const INVISALIGN_VIDEO_SIZES_SINGLE = "(min-width:1024px) 720px, 100vw";
export const INVISALIGN_GRAPHIC_SIZES = "(min-width:1024px) 292px, 50vw";

export function InvisalignMediaImage({
  src,
  alt,
  sizes,
  fit = "cover",
  className,
}: {
  readonly src: ProductionMediaSrc;
  readonly alt: string;
  readonly sizes: string;
  readonly width?: number;
  readonly height?: number;
  readonly fit?: "cover" | "contain";
  readonly className?: string;
}): JSX.Element {
  assertProductionSrc(src, "Invisalign media image");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading="lazy"
      className={cn(
        fit === "contain" ? "object-contain" : "object-cover",
        className,
      )}
    />
  );
}

export default InvisalignMediaImage;
