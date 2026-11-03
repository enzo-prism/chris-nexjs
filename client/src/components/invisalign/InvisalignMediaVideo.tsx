"use client";

import React, { useState, type JSX } from "react";

import type { MediaVideo } from "@/pages/invisalignConsultMedia";

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
}: {
  readonly video: MediaVideo;
}): JSX.Element {
  const [active, setActive] = useState(false);
  const playLabel = `Play ${video.title}`;

  return (
    <article className="card flex flex-col gap-4 overflow-hidden p-5 sm:p-6">
      <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-evergreen-950">
        {active ? (
          <video
            className="h-full w-full"
            controls
            playsInline
            preload="none"
            poster={video.poster}
          >
            <source src={video.src} type="video/mp4" />
            <track
              kind="captions"
              srcLang="en"
              label="English"
              src={video.captionsSrc}
              default
            />
          </video>
        ) : (
          <>
            <img
              src={video.poster}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label={playLabel}
              onClick={() => setActive(true)}
              className="absolute left-1/2 top-1/2 flex h-14 w-14 min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-evergreen-950 shadow-soft sm:h-[4.5rem] sm:w-[4.5rem]"
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
          CC Captions on · {video.runtime} · no autoplay
        </p>
      </div>
    </article>
  );
}

export default InvisalignMediaVideo;
