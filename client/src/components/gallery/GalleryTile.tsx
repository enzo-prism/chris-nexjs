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

// Tiles fill the bento cell the gallery grid gives them (see Gallery.tsx).
function getSizes(item: GalleryMediaItem): string {
  if (item.layout === "videoWide") {
    return ["(max-width: 1023px) calc(100vw - 2rem)", "(max-width: 1279px) 50vw", "38rem"].join(", ");
  }
  return ["(max-width: 1023px) 50vw", "(max-width: 1279px) 25vw", "20rem"].join(", ");
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
    if (!videoElement || item.kind !== "video" || !videoRequested || videoErrored) {
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

  const zoom =
    "transition-transform duration-700 ease-out-soft group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

  return (
    <div
      className={cn(
        "group relative h-full w-full overflow-hidden rounded-[1.5rem] border border-cream-300/70 bg-cream-200 shadow-soft",
        className,
      )}
    >
      {item.kind === "image" ? (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes={getSizes(item)}
          className={cn("object-cover", zoom)}
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 bg-evergreen-950">
          {videoRequested && !videoErrored ? (
            <video
              ref={videoRef}
              src={item.src}
              poster={item.poster}
              className="h-full w-full object-cover"
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
              className={cn("object-cover", zoom)}
              priority={priority}
            />
          ) : null}
        </div>
      )}

      {/* Readability scrim + title (decorative; the opener carries the name). */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-evergreen-950/70 to-transparent transition-opacity duration-500",
          isInlinePlaying && "opacity-0",
        )}
      />
      <p
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute bottom-3 left-3 font-heading text-[0.95rem] font-medium leading-tight text-cream-50 transition-opacity duration-500 sm:bottom-4 sm:left-4 sm:text-lg",
          item.kind === "video" ? "right-16" : "right-3",
          isInlinePlaying && "opacity-0",
        )}
      >
        {item.title}
      </p>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${item.title} in gallery viewer`}
        className="absolute inset-0 z-10 rounded-[1.5rem] outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-gold-300"
      />

      {item.kind === "video" && !videoErrored && (
        <button
          type="button"
          onClick={toggleInlinePlayback}
          className={cn(
            "absolute bottom-3 right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full shadow-lg outline-none transition-[background-color,transform] duration-300 focus-visible:ring-4 focus-visible:ring-cream-50/80 motion-reduce:transition-none sm:bottom-4 sm:right-4",
            isInlinePlaying
              ? "border border-white/30 bg-evergreen-950/60 text-cream-50 backdrop-blur-md hover:bg-evergreen-950/80"
              : "bg-gold-400 text-evergreen-950 hover:scale-105",
          )}
          aria-label={isInlinePlaying ? `Pause ${item.title} preview` : `Play ${item.title} preview`}
        >
          {isInlinePlaying ? (
            <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
