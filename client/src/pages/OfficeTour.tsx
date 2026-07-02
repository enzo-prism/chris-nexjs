"use client";

import { useEffect, useRef, useState } from "react";
import { Play, MapPin, ArrowRight, CalendarCheck } from "lucide-react";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import ButtonLink from "@/components/common/ButtonLink";
import OptimizedImage from "@/components/seo/OptimizedImage";
import StructuredData from "@/components/seo/StructuredData";
import { buildVideoObjectSchemas } from "@/lib/structuredData";
import { officeInfo } from "@/lib/data";

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Office Tour", path: "/office-tour" },
];

type TourStop = {
  src: string;
  poster: string;
  label: string;
  caption: string;
};

const TOUR_STOPS: TourStop[] = [
  {
    src: "/videos/office-exterior.mp4",
    poster: "/images/tour/office-exterior-poster.webp",
    label: "Easy to find",
    caption: `We're at ${officeInfo.address.line1} in downtown ${officeInfo.address.city}, with convenient parking and a welcoming entrance.`,
  },
  {
    src: "/videos/office-lounge.mp4",
    poster: "/images/tour/office-lounge-poster.webp",
    label: "A calming reception",
    caption:
      "Settle into our quiet reception lounge — soft lighting and a saltwater reef aquarium make the wait feel like anything but.",
  },
  {
    src: "/videos/office-frontdesk.mp4",
    poster: "/images/tour/office-frontdesk-poster.webp",
    label: "A team that takes care of the details",
    caption:
      "From scheduling to insurance, our front-desk team keeps every visit smooth so you can focus on your smile.",
  },
];

function TourClip({ stop }: { stop: TourStop }): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pause and reset to the poster when scrolled out of view.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && !el.paused) {
            el.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.muted = true;
      el.loop = true;
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        // Autoplay can be blocked; ignore and keep the poster.
      }
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  return (
    <figure className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_55px_-40px_rgba(15,23,42,0.5)]">
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <video
          ref={videoRef}
          src={stop.src}
          poster={stop.poster}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          controls={false}
          onClick={toggle}
          onEnded={() => setIsPlaying(false)}
        />
        {!isPlaying && (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Play the ${stop.label} video`}
            className="ui-focus-premium absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-black/5 to-transparent transition-colors"
          >
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg ring-1 ring-white/70 transition-transform group-hover:scale-105">
              <Play className="h-7 w-7 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="px-6 py-6">
        <h3 className="font-heading text-lg font-semibold text-slate-900">
          {stop.label}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {stop.caption}
        </p>
      </figcaption>
    </figure>
  );
}

// All four clips shipped together on 2026-06-23 (self-hosted, no
// Cloudinary version segment to derive the date from).
const TOUR_VIDEO_UPLOAD_DATE = "2026-06-23";

const tourVideoSchemas = buildVideoObjectSchemas(
  [
    {
      id: "atrium",
      title: "Office tour: garden courtyard and treatment rooms",
      description:
        "A walk through the Palo Alto dental office, from the planted garden courtyard to the treatment rooms.",
      src: "/videos/office-atrium.mp4",
      poster: "/images/tour/office-atrium-poster.webp",
      uploadDate: TOUR_VIDEO_UPLOAD_DATE,
    },
    ...TOUR_STOPS.map((stop, index) => ({
      id: `stop-${index + 1}`,
      title: `Office tour: ${stop.label}`,
      description: stop.caption,
      src: stop.src,
      poster: stop.poster,
      uploadDate: TOUR_VIDEO_UPLOAD_DATE,
    })),
  ],
  "/office-tour",
);

const OfficeTour = (): JSX.Element => {
  // Click-to-play: a priority poster image is the LCP element (fast paint on
  // mobile); the video only mounts/loads when the visitor taps play.
  const [heroPlaying, setHeroPlaying] = useState(false);

  return (
    <>
      <StructuredData data={tourVideoSchemas} id="office-tour-video-schema" />
      <PageBreadcrumbs items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative overflow-x-clip bg-gradient-to-b from-[#f6fafc] via-white to-[#f9fbff] pt-8 lg:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 ring-1 ring-inset ring-blue-600/10">
                Virtual Office Tour
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                Step inside our Palo Alto dental office
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Calm, modern, and designed around your comfort — from a serene
                garden courtyard to a relaxing reception lounge. Take a look
                around before your first visit with Dr. Wong and the team.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ButtonLink
                  href="/schedule#appointment"
                  className="ui-btn-primary inline-flex h-12 items-center gap-2 rounded-full px-7 text-base font-semibold"
                >
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  Book a visit
                </ButtonLink>
                <a
                  href={officeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-focus-premium inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {officeInfo.address.line1}, {officeInfo.address.city}
                </a>
              </div>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] bg-slate-900 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/10">
              {heroPlaying ? (
                <video
                  src="/videos/office-atrium.mp4"
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls={false}
                  onEnded={() => setHeroPlaying(false)}
                />
              ) : (
                <>
                  {/* Plain <img> (not OptimizedImage) so the LCP hero paints as
                      soon as the small webp arrives, with no JS opacity-gating. */}
                  <img
                    src="/images/tour/office-atrium-poster.webp"
                    alt="Inside the Palo Alto dental office: the garden courtyard and treatment rooms"
                    width={1280}
                    height={800}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <button
                    type="button"
                    onClick={() => setHeroPlaying(true)}
                    aria-label="Play the office tour video"
                    className="ui-focus-premium group absolute inset-0 flex items-center justify-center"
                  >
                    <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg ring-1 ring-white/70 transition-transform group-hover:scale-105">
                      <Play className="h-8 w-8 translate-x-0.5 fill-current" aria-hidden="true" />
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tour stops */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
              A look around the practice
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Tap any clip to play. Everything you see is our real Palo Alto
              office and team.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {TOUR_STOPS.map((stop) => (
              <TourClip key={stop.src} stop={stop} />
            ))}
          </div>
        </div>
      </section>

      {/* Garden courtyard photo band */}
      <section className="bg-gradient-to-b from-white to-[#f5f9fc] py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="overflow-hidden rounded-3xl shadow-md ring-1 ring-slate-200/70">
              <OptimizedImage
                src="/images/office/atrium-courtyard.webp"
                alt="The garden courtyard with a water feature at the Palo Alto dental office"
                width={1600}
                height={900}
                sizes="(max-width: 1024px) 100vw, 600px"
                className="aspect-[16/9] w-full"
              />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                A breath of calm at the center of it all
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Our treatment rooms open onto a planted garden courtyard with a
                quiet water feature — natural light, greenery, and a moment of
                calm that makes a dental visit feel a little more like a retreat.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {[
                  "Modern, light-filled treatment rooms",
                  "Up-to-date imaging and technology",
                  "A friendly, long-tenured team",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the team band */}
      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
            The people who&rsquo;ll take care of you
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Dr. Christopher B. Wong leads a warm, experienced team that patients
            have trusted for years.
          </p>
          <div className="mt-8 overflow-hidden rounded-3xl shadow-md ring-1 ring-slate-200/70">
            <OptimizedImage
              src="/images/about/team-group.webp"
              alt="The Christopher B. Wong, DDS dental team in the Palo Alto office"
              width={1600}
              height={1067}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="aspect-[3/2] w-full"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0b1f3a] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Come see it in person
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-blue-100">
            New and returning patients are always welcome. Request a visit and
            we&rsquo;ll confirm by phone or email within one business day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink
              href="/schedule#appointment"
              className="ui-btn-primary inline-flex h-12 items-center gap-2 rounded-full px-7 text-base font-semibold"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Request an appointment
            </ButtonLink>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="ui-focus-premium inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {officeInfo.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default OfficeTour;
