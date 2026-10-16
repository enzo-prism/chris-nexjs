"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clapperboard, Pause, Play, Volume2, VolumeOff } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { CtaBand } from "@/components/ds/CtaBand";
import { PageHero } from "@/components/ds/PageHero";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryTile from "@/components/gallery/GalleryTile";
import {
  galleryItems,
  heroVideo,
  type GalleryCategory,
  type GalleryMediaItem,
} from "@/data/galleryMedia";
import { buildBreadcrumbSchema, buildVideoObjectSchemas, type StructuredDataNode } from "@/lib/structuredData";
import { cn } from "@/lib/utils";

const CATEGORIES: readonly (GalleryCategory | "All")[] = [
  "All",
  "Our Space",
  "Patient Care",
  "Technology",
  "Our Team",
];

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Photo & video gallery", path: "/gallery" },
];

// Bento cells: standard 1×1, tall 1×2, wide videos 2×1 on phones and 2×2 on
// desktop. The grid packs densely, so tiles never leave holes.
const cellClass: Record<GalleryMediaItem["layout"], string> = {
  photoStandard: "",
  photoTall: "row-span-2",
  videoWide: "col-span-2 lg:row-span-2",
};

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

  const control =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-evergreen-950/55 px-4 text-xs font-bold uppercase tracking-[0.14em] text-cream-50 outline-none backdrop-blur-md transition-colors hover:bg-evergreen-950/75 focus-visible:ring-4 focus-visible:ring-cream-50/80";

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -inset-4 -z-10 rounded-[2.75rem] bg-[conic-gradient(from_200deg,rgba(176,209,193,0.55),rgba(243,224,176,0.6),rgba(176,209,193,0.55))] opacity-60 blur-2xl"
      />
      <div className="relative aspect-[16/11] overflow-hidden rounded-[2.25rem] border border-white/70 bg-evergreen-950 shadow-lift">
        <Image
          src={video.poster ?? "/images/hero-office-1280.webp"}
          alt=""
          fill
          sizes="(max-width: 1023px) calc(100vw - 2rem), (max-width: 1279px) 45vw, 36rem"
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
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t from-evergreen-950/60 via-transparent to-transparent transition-opacity duration-500",
            isPlaying && "opacity-40",
          )}
        />

        {!hasRequestedVideo && !videoErrored && (
          <button
            ref={playbackControlRef}
            type="button"
            onClick={togglePlayback}
            className="group/play absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[2.25rem] text-cream-50 outline-none"
            aria-label="Play office highlights video"
          >
            <span className="relative flex h-20 w-20 items-center justify-center">
              <span className="ring-ripple absolute inset-0 rounded-full border border-gold-300/70" aria-hidden="true" />
              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gold-400 text-evergreen-950 shadow-[0_18px_50px_-12px_rgba(224,182,94,0.75)] transition-transform duration-300 group-hover/play:scale-105 group-focus-visible/play:ring-4 group-focus-visible/play:ring-cream-50/80">
                <Play className="ml-1 h-8 w-8 fill-current" aria-hidden="true" />
              </span>
            </span>
            <span className="rounded-full bg-evergreen-950/55 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
              Play office highlights
            </span>
          </button>
        )}

        {hasRequestedVideo && !videoErrored && (
          <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 sm:bottom-5 sm:left-5">
            <button
              ref={playbackControlRef}
              type="button"
              onClick={togglePlayback}
              className={control}
              aria-label={isPlaying ? "Pause gallery highlights" : "Play gallery highlights"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" aria-hidden="true" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" aria-hidden="true" /> Play
                </>
              )}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              className={control}
              aria-label={isMuted ? "Unmute gallery highlights" : "Mute gallery highlights"}
            >
              {isMuted ? (
                <>
                  <VolumeOff className="h-4 w-4" aria-hidden="true" /> Sound off
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" aria-hidden="true" /> Sound on
                </>
              )}
            </button>
          </div>
        )}

        {videoErrored && (
          <p
            className="absolute bottom-5 left-5 right-5 z-10 rounded-xl bg-evergreen-950/75 px-4 py-3 text-sm font-medium text-cream-50 backdrop-blur-sm"
            role="status"
          >
            The video is unavailable right now. Browse the office photos below.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Gallery(): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "All">("All");

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "All" || item.category === activeCategory,
  );
  const countFor = (category: GalleryCategory | "All") =>
    category === "All" ? galleryItems.length : galleryItems.filter((item) => item.category === category).length;

  const schema: StructuredDataNode[] = [];
  const breadcrumb = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumb) schema.push(breadcrumb);
  schema.push(
    ...buildVideoObjectSchemas([heroVideo, ...galleryItems.filter((item) => item.kind === "video")], "/gallery"),
  );

  return (
    <>
      <StructuredData data={schema} id="gallery-video-schema" />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Photo & video gallery"
        title={
          <>
            See our office, care <em>&amp; team</em>
          </>
        }
        lead="Real photos and short clips of the Palo Alto practice: the garden courtyard, the treatment rooms, and the people who’ll take care of you."
        analyticsContext="gallery-hero"
        showReviews={false}
        actions={[
          <Link
            key="request"
            href="/schedule?source=gallery#appointment"
            className="btn btn-primary btn-lg"
            data-analytics-context="gallery-hero-request"
          >
            <CalendarDays aria-hidden="true" />
            Request a visit
          </Link>,
          <Link key="tour" href="/office-tour" className="btn btn-outline btn-lg" data-analytics-context="gallery-hero-tour">
            <Clapperboard aria-hidden="true" />
            Take the guided office tour
          </Link>,
        ]}
        media={<GalleryHero video={heroVideo} />}
      />

      <Section id="browse" tone="white" labelledBy="browse-title">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="browse-title"
            eyebrow="Browse"
            title={
              <>
                Every corner, <em>every face</em>
              </>
            }
            lead="Choose a category, then open any photo or clip for a closer look."
          />
          <div role="group" aria-label="Filter the gallery" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <div className="flex w-max gap-2 lg:w-auto lg:flex-wrap lg:justify-end">
              {CATEGORIES.map((category) => {
                const selected = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveIndex(null);
                    }}
                    data-selected={selected ? "true" : "false"}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-evergreen-200",
                      selected
                        ? "border-evergreen-800 bg-evergreen-800 text-cream-50"
                        : "border-cream-300 bg-white text-ink-soft hover:border-evergreen-300 hover:text-ink",
                    )}
                  >
                    {category}
                    <span className={cn("text-xs font-medium", selected ? "text-gold-300" : "text-ink-muted")}>
                      {countFor(category)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <ul className="mt-10 grid auto-rows-[10.5rem] grid-flow-row-dense grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:auto-rows-[12.5rem] lg:grid-cols-4">
          {filteredItems.map((item, index) => (
            <li key={item.id} className={cellClass[item.layout]}>
              <GalleryTile item={item} onOpen={() => setActiveIndex(index)} />
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-[1.75rem] border border-cream-300/80 bg-cream-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] leading-7 text-ink-soft">
            Want the story behind the office? Watch <em className="font-heading">Full Circle</em>, Dr. Wong’s two-minute film.
          </p>
          <Link href="/office-tour#film" className="btn btn-outline btn-sm shrink-0">
            Watch the film
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </Section>

      <GalleryLightbox
        items={filteredItems}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onChange={setActiveIndex}
      />

      <CtaBand
        analyticsContext="gallery-cta"
        title={
          <>
            Ready to see it <em>in person?</em>
          </>
        }
        lead="New patients are always welcome. Request a visit online in about a minute, or call and talk with the front desk."
      />
    </>
  );
}
