"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeOff, Camera, Video, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
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

const CATEGORIES: (GalleryCategory | "All")[] = [
  "All",
  "Our Space",
  "Patient Care",
  "Technology",
  "Our Team",
];

function GalleryHero({ video }: { video: GalleryMediaItem }): JSX.Element {
  const [isMuted, setIsMuted] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!heroVideoRef.current) return;
    heroVideoRef.current.muted = isMuted;
  }, [isMuted]);

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
                Office Gallery
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Experience the <br />
                <span className="text-blue-600">Difference</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                Take a virtual tour of our state-of-the-art Palo Alto office. 
                From our serene garden views to our advanced technology, 
                every detail is designed with your comfort in mind.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/schedule#appointment" className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
                Book a Visit
              </ButtonLink>
              <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
                  ))}
                </div>
                <span>Trusted by 2,000+ patients</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[16/10] relative overflow-hidden rounded-[32px] bg-slate-900 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/10">
              <video
                ref={heroVideoRef}
                src={video.src}
                poster={video.poster}
                className="h-full w-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              <button
                type="button"
                onClick={() => setIsMuted((value) => !value)}
                className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-black/50"
              >
                {isMuted ? (
                  <><VolumeOff className="h-4 w-4" /> Unmute Tour</>
                ) : (
                  <><Volume2 className="h-4 w-4" /> Mute Tour</>
                )}
              </button>

              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/20">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white">Live Tour</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Gallery(): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<(GalleryCategory | "All")>("All");

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  return (
    <div className="bg-white">
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
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Explore our Space</h2>
              <p className="text-slate-500 font-medium">Select a category to see more</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-slate-50 p-1.5 ring-1 ring-slate-200/60">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    activeCategory === category
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-900"
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
          <motion.div 
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                // Determine layout on the fly for a more dynamic feel if needed, 
                // but for now we'll use a clean masonry-like columns
                const isWide = item.layout === "videoWide" && activeCategory === "All";
                
                return (
                  <motion.div
                    key={item.id}
                    layout
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
                      priority={index < 4}
                      className={cn(
                        "h-full w-full",
                        item.layout === "photoTall" ? "aspect-[3/4]" : "aspect-[4/3]"
                      )}
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
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No items found</h3>
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
            Ready to see it in person?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join the many Palo Alto families who trust Dr. Wong for their dental care.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/schedule#appointment" className="rounded-full px-10 h-14 text-lg">
              Book Appointment
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

