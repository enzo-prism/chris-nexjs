import React, { type JSX } from "react";

import {
  resolveGraphicAlt,
  type MediaGraphic,
  type MediaVideo,
} from "@/pages/invisalignConsultMedia";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import {
  INVISALIGN_GRAPHIC_SIZES,
  INVISALIGN_VIDEO_SIZES,
  INVISALIGN_VIDEO_SIZES_SINGLE,
  InvisalignMediaImage,
} from "@/components/invisalign/InvisalignMediaImage";
import { InvisalignMediaVideo } from "@/components/invisalign/InvisalignMediaVideo";
import { cn } from "@/lib/utils";

export function InvisalignMediaSection({
  videos,
  graphics,
}: {
  readonly videos: readonly MediaVideo[];
  readonly graphics: readonly MediaGraphic[];
}): JSX.Element | null {
  if (videos.length === 0 && graphics.length === 0) {
    return null;
  }

  const videoSizes =
    videos.length === 1 ? INVISALIGN_VIDEO_SIZES_SINGLE : INVISALIGN_VIDEO_SIZES;

  return (
    <Section id="invisalign-media" tone="white" labelledBy="invisalign-media-title">
      <SectionHeading
        id="invisalign-media-title"
        eyebrow="See it in action"
        title={
          <>
            Invisalign, <em>up close</em>
          </>
        }
        lead="Short videos and graphics from Align Technology, the maker of Invisalign, show how aligners are planned, worn and checked. Dr. Wong walks you through your own scan and plan at your consult."
      />

      {videos.length > 0 ? (
        <div
          data-invisalign-media-videos={String(videos.length)}
          className={cn(
            "mt-8 sm:mt-12",
            videos.length === 1 ? "max-w-3xl" : "grid gap-4 lg:grid-cols-2",
          )}
        >
          {videos.map((video) => (
            <InvisalignMediaVideo key={video.id} video={video} sizes={videoSizes} />
          ))}
        </div>
      ) : null}

      {graphics.length > 0 ? (
        <ul
          data-invisalign-media-graphics={String(graphics.length)}
          className={cn(
            videos.length > 0 ? "mt-4" : "mt-8 sm:mt-12",
            "grid grid-cols-2 gap-4",
            graphics.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
          )}
        >
          {graphics.map((graphic) => (
            <li key={graphic.id} className="card overflow-hidden">
              <figure>
                <div className="relative aspect-square bg-cream-200">
                  <InvisalignMediaImage
                    src={graphic.src}
                    alt={resolveGraphicAlt(graphic)}
                    sizes={INVISALIGN_GRAPHIC_SIZES}
                    width={graphic.width}
                    height={graphic.height}
                    fit={graphic.contain ? "contain" : "cover"}
                  />
                </div>
                {graphic.caption ? (
                  <figcaption className="px-4 py-4 text-[13px] leading-5 text-ink-soft sm:px-5 sm:text-[15px] sm:leading-6">
                    {graphic.caption}
                  </figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      ) : null}

      {/* TODO: confirm Align's required attribution before assets ship. */}
      <p className="mt-6 text-[13px] leading-5 text-ink-muted">
        Videos and graphics © Align Technology, Inc.
      </p>
    </Section>
  );
}

export default InvisalignMediaSection;
