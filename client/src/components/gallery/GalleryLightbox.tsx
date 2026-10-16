"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
}: GalleryLightboxProps): React.JSX.Element | null {
  const touchStartX = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const activeItem = useMemo(
    () => (activeIndex === null ? null : items[activeIndex] ?? null),
    [activeIndex, items],
  );

  useEffect(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [activeItem?.id]);

  const goPrev = () => {
    if (activeIndex === null || items.length === 0) return;
    onChange((activeIndex - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (activeIndex === null || items.length === 0) return;
    onChange((activeIndex + 1) % items.length);
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
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

    if (!videoElement.paused) {
      videoElement.pause();
      return;
    }

    try {
      videoElement.muted = true;
      videoElement.loop = true;
      await videoElement.play();
    } catch (_error) {
      setIsVideoPlaying(false);
    }
  };

  return (
    <DialogPrimitive.Root
      open={activeItem !== null && activeIndex !== null}
      onOpenChange={(open) => {
        if (!open) {
          const returnFocusElement = returnFocusRef.current;
          onClose();
          window.requestAnimationFrame(() => returnFocusElement?.focus());
        }
      }}
    >
      {activeItem && activeIndex !== null && (
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[159] bg-evergreen-950/95 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-[160] outline-none"
            onKeyDown={onDialogKeyDown}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onClose();
                window.requestAnimationFrame(() => returnFocusRef.current?.focus());
              }
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              returnFocusRef.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
              closeButtonRef.current?.focus();
            }}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DialogPrimitive.Title className="sr-only">
              {activeItem.title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {activeItem.description} Media {activeIndex + 1} of {items.length}.
              Use the left and right arrow keys to browse.
            </DialogPrimitive.Description>

            <DialogPrimitive.Close asChild>
              <button
                ref={closeButtonRef}
                type="button"
                className="absolute right-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-cream-100/25 bg-white/[0.06] text-cream-50 outline-none transition-[background-color,border-color,transform] hover:border-cream-100/50 hover:bg-white/15 focus-visible:ring-4 focus-visible:ring-gold-300/70 active:translate-y-[0.5px] sm:right-5 sm:top-5"
                aria-label="Close gallery viewer"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream-100/25 bg-evergreen-950/60 text-cream-50 outline-none backdrop-blur transition-[background-color,border-color,transform] hover:border-cream-100/50 hover:bg-evergreen-900 focus-visible:ring-4 focus-visible:ring-gold-300/70 active:scale-[0.98] sm:left-5 sm:h-14 sm:w-14"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream-100/25 bg-evergreen-950/60 text-cream-50 outline-none backdrop-blur transition-[background-color,border-color,transform] hover:border-cream-100/50 hover:bg-evergreen-900 focus-visible:ring-4 focus-visible:ring-gold-300/70 active:scale-[0.98] sm:right-5 sm:h-14 sm:w-14"
              aria-label="Next media"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>

            <div
              className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-center px-4 pb-32 pt-16 sm:px-20 sm:pb-28 sm:pt-16"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  onClose();
                  window.requestAnimationFrame(() => returnFocusRef.current?.focus());
                }
              }}
            >
              <div className="group relative h-[64vh] w-full overflow-hidden rounded-[1.5rem] bg-black/25 ring-1 ring-white/10 sm:h-[70vh]">
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
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => setIsVideoPlaying(false)}
                    />
                    <button
                      type="button"
                      onClick={toggleLightboxVideo}
                      className={
                        isVideoPlaying
                          ? "absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-evergreen-950/60 text-cream-50 outline-none backdrop-blur-md transition-colors hover:bg-evergreen-950/80 focus-visible:ring-4 focus-visible:ring-cream-50/80"
                          : "absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-evergreen-950 shadow-lg outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-cream-50/80"
                      }
                      aria-label={isVideoPlaying ? `Pause ${activeItem.title}` : `Play ${activeItem.title}`}
                    >
                      {isVideoPlaying ? (
                        <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
                      ) : (
                        <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-5 sm:pb-6">
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-1.5 text-center">
                <p className="font-heading text-xl font-medium text-cream-50 sm:text-2xl" aria-hidden="true">
                  {activeItem.title}
                </p>
                <p className="text-sm leading-6 text-evergreen-100/85" aria-hidden="true">
                  {activeItem.description}
                </p>
                <p
                  className="mt-1 rounded-full border border-cream-100/20 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-cream-100"
                  aria-live="polite"
                >
                  {activeIndex + 1} / {items.length}
                </p>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </DialogPrimitive.Root>
  );
}
