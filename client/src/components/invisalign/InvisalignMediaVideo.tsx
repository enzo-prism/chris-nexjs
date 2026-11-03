"use client";

import React, { useState, type JSX } from "react";

import { isEmbedSrc, type MediaVideo } from "@/pages/invisalignConsultMedia";
import {
  INVISALIGN_VIDEO_SIZES,
  InvisalignMediaImage,
} from "@/components/invisalign/InvisalignMediaImage";

function PlayTriangle(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      className="ml-0.5 h-[42%] w-[42%]"
      aria-hidden="true"
    >
      <path fill="currentColor" d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function InvisalignMediaVideo({
  video,
  sizes = INVISALIGN_VIDEO_SIZES,
}: {
  readonly video: MediaVideo;
  readonly sizes?: string;
}): JSX.Element {
  const [active, setActive] = useState(false);
  const playLabel = `Play video: ${video.title} (${video.durationLabel}, captions available)`;

  return (
    <article className="card flex flex-col gap-4 overflow-hidden p-5 sm:p-6">
      <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-evergreen-900">
        {active ? (
          isEmbedSrc(video.src) ? (
            <iframe
              src={video.src}
              title={video.title}
              className="h-full w-full"
              allow="fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video
              className="h-full w-full"
              controls
              playsInline
              preload="none"
              poster={video.poster}
            >
              <source src={video.src} type="video/mp4" />
              {video.captions ? (
                <track
                  kind="captions"
                  srcLang="en"
                  label="English"
                  src={video.captions}
                  default
                />
              ) : null}
            </video>
          )
        ) : (
          <>
            <InvisalignMediaImage
              src={video.poster}
              alt=""
              sizes={sizes}
              width={1600}
              height={900}
            />
            <button
              type="button"
              aria-label={playLabel}
              onClick={() => setActive(true)}
              className="absolute left-1/2 top-1/2 flex h-14 w-14 min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-evergreen-800 shadow-soft lg:h-[4.5rem] lg:w-[4.5rem]"
            >
              <PlayTriangle />
            </button>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-[1.15rem] font-medium leading-snug text-ink sm:text-[1.25rem]">
          {video.title}
        </h3>
        <p className="text-[15px] leading-6 text-ink-soft sm:leading-7">
          Captions available · {video.durationLabel}
        </p>
      </div>
    </article>
  );
}

export default InvisalignMediaVideo;
