"use client";

import React, { useEffect, useRef, useState, type JSX } from "react";

import {
  embedSrcWithAutoplay,
  isFixtureVideo,
  videoHasAvailableCaptions,
  type MediaEmbedVideo,
  type MediaFileVideo,
  type RenderableVideo,
} from "@/pages/invisalignConsultMedia";
import {
  INVISALIGN_VIDEO_SIZES,
  InvisalignMediaImage,
} from "@/components/invisalign/InvisalignMediaImage";
import { InvisalignMediaFixtureImage } from "@/components/invisalign/InvisalignMediaFixtureImage";

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

function FilePlayer({
  video,
  playerRef,
}: {
  readonly video: MediaFileVideo | Extract<RenderableVideo, { kind: "file" }>;
  readonly playerRef: React.Ref<HTMLVideoElement>;
}): JSX.Element {
  return (
    <video
      ref={playerRef}
      className="h-full w-full"
      controls
      autoPlay
      playsInline
      preload="none"
      poster={video.poster}
      crossOrigin="anonymous"
      tabIndex={0}
    >
      <source src={video.src} type="video/mp4" />
      <track
        kind="captions"
        srcLang="en"
        label="English"
        src={video.captions}
        default
      />
    </video>
  );
}

function EmbedPlayer({
  video,
  playerRef,
}: {
  readonly video: MediaEmbedVideo;
  readonly playerRef: React.Ref<HTMLIFrameElement>;
}): JSX.Element {
  return (
    <iframe
      ref={playerRef}
      src={embedSrcWithAutoplay(video.src)}
      title={video.title}
      className="h-full w-full"
      allow="autoplay; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      tabIndex={0}
    />
  );
}

function ActivePlayer({
  video,
  videoRef,
  iframeRef,
}: {
  readonly video: RenderableVideo;
  readonly videoRef: React.Ref<HTMLVideoElement>;
  readonly iframeRef: React.Ref<HTMLIFrameElement>;
}): JSX.Element {
  switch (video.kind) {
    case "file":
      return <FilePlayer video={video} playerRef={videoRef} />;
    case "embed":
      return <EmbedPlayer video={video} playerRef={iframeRef} />;
    default: {
      const _exhaustive: never = video;
      throw new Error(`Unknown Invisalign media video kind`);
      return _exhaustive;
    }
  }
}

export function InvisalignMediaVideo({
  video,
  sizes = INVISALIGN_VIDEO_SIZES,
}: {
  readonly video: RenderableVideo;
  readonly sizes?: string;
}): JSX.Element {
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const captionsAvailable = videoHasAvailableCaptions(video);
  const playLabel = captionsAvailable
    ? `Play video: ${video.title} (${video.durationLabel}, captions available)`
    : `Play video: ${video.title} (${video.durationLabel})`;
  useEffect(() => {
    if (!active) return;
    if (video.kind === "embed") {
      iframeRef.current?.focus();
      return;
    }
    const player = videoRef.current;
    player?.focus();
    void player?.play();
  }, [active, video.kind]);

  return (
    <article className="card flex flex-col gap-4 overflow-hidden p-5 sm:p-6">
      <div className="relative aspect-video overflow-hidden rounded-[1.25rem] bg-evergreen-900">
        {active ? (
          <ActivePlayer video={video} videoRef={videoRef} iframeRef={iframeRef} />
        ) : (
          <>
            {isFixtureVideo(video) ? (
              <InvisalignMediaFixtureImage
                src={video.poster}
                alt=""
                sizes={sizes}
                width={1600}
                height={900}
              />
            ) : (
              <InvisalignMediaImage
                src={video.poster}
                alt=""
                sizes={sizes}
                width={1600}
                height={900}
              />
            )}
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
          {captionsAvailable
            ? `Captions available · ${video.durationLabel}`
            : video.durationLabel}
        </p>
      </div>
    </article>
  );
}

export default InvisalignMediaVideo;
