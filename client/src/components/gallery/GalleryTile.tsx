"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
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
    return "(max-width: 767px) 100vw, (max-width: 1279px) 66vw, 58vw";
  }
  return "(max-width: 767px) 100vw, (max-width: 1279px) 34vw, 30vw";
}

export default function GalleryTile({
  item,
  className,
  priority = false,
  onOpen,
}: GalleryTileProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInlinePlaying, setIsInlinePlaying] = useState(false);
  const [videoErrored, setVideoErrored] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || item.kind !== "video") return;

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
    return () => observer.disconnect();
  }, [item.kind]);

  const toggleInlinePlayback = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

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
        className,
      )}
    >
      {item.kind === "image" ? (
        <div className="relative w-full overflow-hidden bg-slate-50">
          <img
            src={item.src}
            alt={item.alt}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            className="block h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden bg-slate-900">
          {videoErrored ? (
            item.poster ? (
              <Image
                src={item.poster}
                alt={item.alt}
                fill
                sizes={getSizes(item)}
                className="object-contain"
                priority={priority}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
            )
          ) : (
            <video
              ref={videoRef}
              src={item.src}
              poster={item.poster}
              className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              playsInline
              muted
              loop
              preload="none"
              controls={false}
              onPlay={() => setIsInlinePlaying(true)}
              onPause={() => setIsInlinePlaying(false)}
              onEnded={() => setIsInlinePlaying(false)}
              onError={() => setVideoErrored(true)}
            />
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
            "ui-focus-premium absolute inset-0 z-20 m-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition-all duration-300",
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
