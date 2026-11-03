import React, { type JSX } from "react";

import { cn } from "@/lib/utils";

/** Dev/test only. Never import this from production page modules. */
export function InvisalignMediaFixtureImage({
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
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={cn(
        "h-full w-full",
        fit === "contain" ? "object-contain" : "object-cover",
        className,
      )}
    />
  );
}

export default InvisalignMediaFixtureImage;
