"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
}: GalleryTileProps): JSX.Element {
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
            setIsInlinePlaying(false);
          }
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(videoElement);
    return () => observer.disconnect();
  }, [item.kind]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const toggleInlinePlayback = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isInlinePlaying) {
      videoElement.pause();
      setIsInlinePlaying(false);
      return;
    }

    videoElement.muted = true;
    videoElement.loop = true;

    try {
      await videoElement.play();
      setIsInlinePlaying(true);
    } catch (_error) {
      setIsInlinePlaying(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      aria-label={item.title}
      className={cn(
        "group relative overflow-hidden rounded-[24px] bg-slate-100 ring-1 ring-slate-900/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ease-out",
        "hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:ring-slate-900/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        className,
      )}
    >
      {item.kind === "image" ? (
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes={getSizes(item)}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
                className="object-cover"
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
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              playsInline
              muted
              loop
              preload="none"
              controls={false}
              onError={() => setVideoErrored(true)}
            />
          )}

          {!videoErrored && (
            <button
              type="button"
              onClick={toggleInlinePlayback}
              className={cn(
                "absolute inset-0 m-auto z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all duration-300",
                "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:bg-black/40",
              )}
              aria-label={isInlinePlaying ? "Pause preview clip" : "Play preview clip"}
            >
              {isInlinePlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Modern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300/90">
          {item.category}
        </p>
        <h3 className="text-lg font-semibold text-white">
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-200/90">
          {item.description}
        </p>
      </div>
    </div>
  );
}
