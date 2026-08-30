"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeOff, Camera, Pause, Play, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion-lite";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import { buildVideoObjectSchemas } from "@/lib/structuredData";
import ButtonLink from "@/components/common/ButtonLink";
import { cn } from "@/lib/utils";
import {
  galleryItems,
  heroVideo,
  type GalleryMediaItem,
  type GalleryCategory,
} from "@/data/galleryMedia";
import GalleryTile from "@/components/gallery/GalleryTile";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

const CATEGORIES: readonly (GalleryCategory | "All")[] = [
  "All",
  "Our Space",
  "Patient Care",
  "Technology",
  "Our Team",
];

function GalleryHero({ video }: { video: GalleryMediaItem }): React.JSX.Element {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRequestedVideo, setHasRequestedVideo] = useState(false);
  const [videoErrored, setVideoErrored] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const playbackControlRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const videoElement = heroVideoRef.current;
    if (!videoElement || !hasRequestedVideo || videoErrored) return;

    let cancelled = false;
    videoElement.muted = true;
    videoElement.loop = true;
    playbackControlRef.current?.focus({ preventScroll: true });
    void videoElement.play().catch(() => {
      if (!cancelled) setIsPlaying(false);
    });

    return () => {
      cancelled = true;
    };
  }, [hasRequestedVideo, videoErrored]);

  const togglePlayback = async () => {
    if (!hasRequestedVideo) {
      setHasRequestedVideo(true);
      return;
    }

    const videoElement = heroVideoRef.current;
    if (!videoElement) return;

    if (!videoElement.paused) {
      videoElement.pause();
      return;
    }

    try {
      await videoElement.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleSound = () => {
    setIsMuted((currentValue) => {
      const nextValue = !currentValue;
      if (heroVideoRef.current) heroVideoRef.current.muted = nextValue;
      return nextValue;
    });
  };

  return (
    <section className="relative overflow-hidden bg-white pt-8 lg:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 ring-1 ring-inset ring-blue-600/10">
                <Camera className="h-3.5 w-3.5" />
                Photo &amp; Video Gallery
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                See Our Office, <br />
                <span className="text-blue-600">Care &amp; Team</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                Browse real photos and short clips of our Palo Alto practice,
                from serene garden views to the people and technology behind
                your care.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/schedule?source=gallery#appointment" className="ui-btn-primary h-12 rounded-full px-8 text-base font-semibold">
                Request Appointment
              </ButtonLink>
              <ButtonLink
                href="/office-tour"
                variant="outline"
                className="h-12 rounded-full px-7 text-base font-semibold"
              >
                Take the Guided Office Tour
              </ButtonLink>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[16/10] relative overflow-hidden rounded-[32px] bg-slate-900 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10">
              <Image
                src={video.poster ?? "/images/hero-office-1280.webp"}
                alt=""
                fill
                sizes="(max-width: 1023px) calc(100vw - 2rem), (max-width: 1279px) 55vw, 48rem"
                className="object-cover"
                priority
              />
              {hasRequestedVideo && !videoErrored && (
                <video
                  ref={heroVideoRef}
                  src={video.src}
                  poster={video.poster}
                  className="absolute inset-0 h-full w-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  preload="none"
                  controls={false}
                  aria-label={`${video.title}. ${video.description}`}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setVideoErrored(true);
                    setIsPlaying(false);
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {!hasRequestedVideo && !videoErrored && (
                <button
                  ref={playbackControlRef}
                  type="button"
                  onClick={togglePlayback}
                  className="ui-focus-premium group absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[32px] text-white"
                  aria-label="Play office highlights video"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/55 bg-black/45 shadow-xl backdrop-blur-sm transition-[background-color,border-color,transform] group-hover:scale-105 group-hover:border-white/80 group-hover:bg-black/60 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-black/45 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    Play Office Highlights
                  </span>
                </button>
              )}

              {hasRequestedVideo && !videoErrored && (
                <div className="absolute bottom-5 left-5 z-10 flex flex-wrap gap-2">
                  <button
                    ref={playbackControlRef}
                    type="button"
                    onClick={togglePlayback}
                    className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-[background-color,border-color,transform] hover:border-white/55 hover:bg-black/60 active:translate-y-[0.5px]"
                    aria-label={isPlaying ? "Pause gallery highlights" : "Play gallery highlights"}
                  >
                    {isPlaying ? (
                      <><Pause className="h-4 w-4" aria-hidden="true" /> Pause</>
                    ) : (
                      <><Play className="h-4 w-4" aria-hidden="true" /> Play</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition-[background-color,border-color,transform] hover:border-white/55 hover:bg-black/60 active:translate-y-[0.5px]"
                    aria-label={isMuted ? "Unmute gallery highlights" : "Mute gallery highlights"}
                  >
                    {isMuted ? (
                      <><VolumeOff className="h-4 w-4" aria-hidden="true" /> Sound Off</>
                    ) : (
                      <><Volume2 className="h-4 w-4" aria-hidden="true" /> Sound On</>
                    )}
                  </button>
                </div>
              )}

              {videoErrored && (
                <p className="absolute bottom-5 left-5 right-5 z-10 rounded-xl bg-black/60 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm" role="status">
                  The video is unavailable right now. Browse the office photos below.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Gallery(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<(GalleryCategory | "All")>("All");

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const videoSchemas = buildVideoObjectSchemas(
    [heroVideo, ...galleryItems.filter((item) => item.kind === "video")],
    "/gallery",
  );

  return (
    <div className="bg-white">
      {videoSchemas.length > 0 && (
        <StructuredData data={videoSchemas} id="gallery-video-schema" />
      )}
      <PageBreadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ]}
      />

      <GalleryHero video={heroVideo} />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Browse the Gallery</h2>
              <p className="text-slate-500 font-medium">Choose a category, then open any photo or clip</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-200/60">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setActiveIndex(null);
                  }}
                  data-selected={activeCategory === category ? "true" : "false"}
                  aria-pressed={activeCategory === category}
                  className={cn(
                    "ui-chip-interactive relative min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold",
                    activeCategory === category ? "text-primary" : "text-slate-600"
                  )}
                >
                  {category}
                  {activeCategory === category && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-xl ring-2 ring-blue-600/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const isWide = item.layout === "videoWide" && activeCategory === "All";
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={cn(
                      "group relative",
                      isWide ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                    )}
                  >
                    <GalleryTile
                      item={item}
                      onOpen={() => setActiveIndex(index)}
                      className="w-full"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-slate-50 p-6 ring-1 ring-slate-200">
                <LayoutGrid className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No Items Found</h3>
              <p className="text-slate-500">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      <GalleryLightbox
        items={filteredItems}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onChange={setActiveIndex}
      />

      {/* Footer CTA */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to See It in Person?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Visit our Palo Alto practice and experience the garden-view treatment spaces firsthand.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/schedule?source=gallery#appointment" className="rounded-full px-10 h-14 text-lg">
              Request Appointment
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" className="rounded-full px-10 h-14 text-lg">
              Contact Us
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
