"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
} from "lucide-react";
import type { GalleryMediaItem } from "@/data/galleryMedia";

type GalleryLightboxProps = {
  items: readonly GalleryMediaItem[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export default function GalleryLightbox({
  items,
  activeIndex,
  onClose,
  onChange,
}: GalleryLightboxProps): JSX.Element | null {
  const touchStartX = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const activeItem = useMemo(
    () => (activeIndex === null ? null : items[activeIndex] ?? null),
    [activeIndex, items],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        onChange((activeIndex + 1) % items.length);
        return;
      }
      if (event.key === "ArrowLeft") {
        onChange((activeIndex - 1 + items.length) % items.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, items.length, onChange, onClose]);

  useEffect(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [activeItem?.id]);

  const goPrev = () => {
    if (activeIndex === null) return;
    onChange((activeIndex - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (activeIndex === null) return;
    onChange((activeIndex + 1) % items.length);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start === null || end === null) return;

    const delta = start - end;
    if (Math.abs(delta) < 55) return;
    if (delta > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const toggleLightboxVideo = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isVideoPlaying) {
      videoElement.pause();
      setIsVideoPlaying(false);
      return;
    }

    try {
      videoElement.muted = true;
      videoElement.loop = true;
      await videoElement.play();
      setIsVideoPlaying(true);
    } catch (_error) {
      setIsVideoPlaying(false);
    }
  };

  if (!activeItem || activeIndex === null) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-slate-950/94 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/35 p-2 text-white/85 transition hover:bg-black/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-5 sm:top-5"
        aria-label="Close gallery viewer"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={goPrev}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/35 p-2 text-white/85 transition hover:bg-black/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:left-5 sm:p-3"
        aria-label="Previous media"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={goNext}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/35 p-2 text-white/85 transition hover:bg-black/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:right-5 sm:p-3"
        aria-label="Next media"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div
        className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-center px-4 pb-16 pt-12 sm:px-12 sm:pt-16"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-[74vh] w-full overflow-hidden rounded-2xl bg-black/30 ring-1 ring-white/10">
          {activeItem.kind === "image" ? (
            <Image
              src={activeItem.src}
              alt={activeItem.alt}
              fill
              sizes="(max-width: 1400px) 96vw, 1400px"
              className="object-contain"
              priority
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={activeItem.src}
                poster={activeItem.poster}
                className="h-full w-full object-contain"
                playsInline
                muted
                loop
                preload="metadata"
                controls={false}
                onClick={toggleLightboxVideo}
              />
              <button
                type="button"
                onClick={toggleLightboxVideo}
                className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/45 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
              >
                {isVideoPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-medium text-white/90">
        {activeIndex + 1} / {items.length}
      </div>
    </div>
  );
}
