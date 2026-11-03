"use client";

import React, { type JSX } from "react";

import type { RenderableVideo } from "@/pages/invisalignConsultMedia";
import { InvisalignMediaVideo } from "@/components/invisalign/InvisalignMediaVideo";

export function InvisalignMediaVideoCards({
  videos,
  sizes,
}: {
  readonly videos: readonly RenderableVideo[];
  readonly sizes: string;
}): JSX.Element {
  return (
    <>
      {videos.map((video) => (
        <InvisalignMediaVideo key={video.id} video={video} sizes={sizes} />
      ))}
    </>
  );
}

export default InvisalignMediaVideoCards;
