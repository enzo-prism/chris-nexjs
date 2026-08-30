"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryMediaItem } from "@/data/galleryMedia";

type GalleryTileProps = {
  item: GalleryMediaItem;
  className?: string;
  priority?: boolean;
  onOpen: () => void;
};

function getSizes(item: GalleryMediaItem): string {
  if (item.layout === "videoWide") {
    return [
      "(max-width: 639px) calc(100vw - 2rem)",
      "(max-width: 1023px) calc(100vw - 3rem)",
      "(max-width: 1279px) 60vw",
      "38rem",
    ].join(", ");
  }
  return [
    "(max-width: 639px) calc(100vw - 2rem)",
    "(max-width: 1023px) calc(50vw - 2rem)",
    "(max-width: 1279px) 33vw",
    "20rem",
  ].join(", ");
}

function getAspectClass(item: GalleryMediaItem): string {
  if (item.layout === "videoWide") return "aspect-video";
  if (item.layout === "photoTall") return "aspect-[4/5]";
  return "aspect-[4/3]";
}

export default function GalleryTile({
  item,
  className,
  priority = false,
  onOpen,
}: GalleryTileProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInlinePlaying, setIsInlinePlaying] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);
  const [videoErrored, setVideoErrored] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (
      !videoElement ||
      item.kind !== "video" ||
      !videoRequested ||
      videoErrored
    ) {
      return;
    }

    let cancelled = false;
    videoElement.muted = true;
    videoElement.loop = true;
    void videoElement.play().catch(() => {
      if (!cancelled) setIsInlinePlaying(false);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !videoElement.paused) {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(videoElement);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [item.kind, videoErrored, videoRequested]);

  const toggleInlinePlayback = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!videoRequested) {
      setVideoRequested(true);
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!videoElement.paused) {
      videoElement.pause();
      return;
    }

    videoElement.muted = true;
    videoElement.loop = true;

    try {
      await videoElement.play();
    } catch (_error) {
      setIsInlinePlaying(false);
    }
  };

  return (
    <div
      className={cn(
        "ui-card-interactive group relative overflow-hidden rounded-[24px] border border-slate-900/5 bg-slate-100",
        getAspectClass(item),
        className,
      )}
    >
      {item.kind === "image" ? (
        <div className="relative h-full w-full overflow-hidden bg-slate-50">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes={getSizes(item)}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            priority={priority}
          />
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden bg-slate-900">
          {videoRequested && !videoErrored ? (
            <video
              ref={videoRef}
              src={item.src}
              poster={item.poster}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              playsInline
              muted
              loop
              preload="none"
              controls={false}
              aria-label={`${item.title} video preview`}
              onPlay={() => setIsInlinePlaying(true)}
              onPause={() => setIsInlinePlaying(false)}
              onEnded={() => setIsInlinePlaying(false)}
              onError={() => setVideoErrored(true)}
            />
          ) : item.poster ? (
            <Image
              src={item.poster}
              alt={item.alt}
              fill
              sizes={getSizes(item)}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              priority={priority}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${item.title} in gallery viewer`}
        className="ui-focus-premium absolute inset-0 z-10 rounded-[24px]"
      />

      {item.kind === "video" && !videoErrored && (
        <button
          type="button"
          onClick={toggleInlinePlayback}
          className={cn(
            "ui-focus-premium absolute inset-0 z-20 m-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-lg backdrop-blur-md transition-[background-color,border-color,opacity,transform] duration-300 motion-reduce:transition-none",
            "scale-100 opacity-100 hover:bg-black/50 sm:scale-90 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100 sm:focus-visible:scale-100 sm:focus-visible:opacity-100",
          )}
          aria-label={isInlinePlaying ? `Pause ${item.title} preview` : `Play ${item.title} preview`}
        >
          {isInlinePlaying ? (
            <Pause className="h-6 w-6 fill-current" aria-hidden="true" />
          ) : (
            <Play className="h-6 w-6 fill-current" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
