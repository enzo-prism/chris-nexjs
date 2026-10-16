import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Phone, Play } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";
import { StarRow } from "@/components/ds/Reviews";
import { team } from "@/data/team";
import { homeRibbonQuotes } from "@/data/reviewHighlights";
import {
  HarvestMoon,
  HeroGhost,
  SeasonalGreeting,
  harvestMoonBox,
} from "@/components/seasonal/HomeSeasonal";
import { HarvestBats } from "@/components/seasonal/SeasonalClient";

const HERO_IMAGE = "/images/hero/dr-wong-hero.webp";
const faces = team.filter((m) => m.group !== "dentist").slice(0, 4);
// Verbatim (scripts/homepage-proof.test.ts checks homeRibbonQuotes).
const heroQuote = homeRibbonQuotes.find((q) => q.name === "Jimmy") ?? homeRibbonQuotes[0];

export function HomeHero() {
  return (
    <section className="paper relative isolate overflow-hidden" aria-labelledby="home-hero-title">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-6 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-8 lg:pb-10 lg:pt-14">
        <div className="relative z-10">
          <SeasonalGreeting />
          <div className="rise-in flex flex-wrap items-center gap-2">
            <span className="pill hidden min-[400px]:inline-flex">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-500" />
              </span>
              New patients welcome
            </span>
            <Link href="/testimonials" className="pill transition-colors hover:border-gold-400 hover:text-ink">
              <StarRow size="h-3.5 w-3.5" />
              {GOOGLE_REVIEW_COUNT} five-star Google reviews
            </Link>
          </div>

          <h1
            id="home-hero-title"
            className="h-display mt-6 text-balance text-[2.55rem] sm:text-[3.5rem] lg:text-[4.1rem] xl:text-[4.5rem]"
          >
            Your <em>gentle, unhurried</em> Palo Alto family dentist
          </h1>
          <p className="lead mt-5 max-w-xl">
            Dr. Christopher B. Wong and a hygiene team patients have trusted for
            years take time to explain what they see, protect healthy teeth, and
            walk you through costs before any treatment.
          </p>

          <div className="rise-in rise-in-3 mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Link href="/schedule#appointment" className="btn btn-primary btn-lg" data-analytics-context="hero-book">
              <CalendarDays aria-hidden="true" />
              Request a visit
            </Link>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-outline btn-lg"
              data-analytics-context="hero-call"
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              <span className="sm:hidden">Call us</span>
              <span className="hidden sm:inline">{officeInfo.phone}</span>
            </a>
          </div>

          <Link
            href="#team"
            className="rise-in rise-in-4 group mt-8 inline-flex items-center gap-3 rounded-full py-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-evergreen-500"
          >
            <span className="flex -space-x-3" aria-hidden="true">
              {faces.map((m) => (
                <Image
                  key={m.slug}
                  src={m.image}
                  alt=""
                  width={88}
                  height={88}
                  sizes="44px"
                  className="h-11 w-11 rounded-full border-2 border-cream-50 object-cover shadow-sm"
                  style={{ objectPosition: m.focus ?? "50% 30%" }}
                />
              ))}
            </span>
            <span className="text-[15px] font-semibold leading-tight text-ink-soft">
              Meet the team who’ll{" "}
              <span className="whitespace-nowrap text-evergreen-700 underline decoration-gold-500/60 underline-offset-4 group-hover:decoration-gold-500">
                know your name
                <ArrowRight className="ml-1 inline h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <HarvestMoon />
          <HeroGhost />
          <div
            aria-hidden="true"
            className="absolute -inset-4 -z-10 rounded-[2.75rem] bg-[conic-gradient(from_200deg,rgba(176,209,193,0.55),rgba(243,224,176,0.6),rgba(176,209,193,0.55))] opacity-60 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-evergreen-900 shadow-lift">
            <Image
              src={HERO_IMAGE}
              alt="Dr. Christopher B. Wong in his Palo Alto dental office"
              width={1280}
              height={960}
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="aspect-[4/3] h-auto w-full object-cover lg:aspect-[5/5.2]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-evergreen-950/70 to-transparent"
            />
            <Link
              href="#story"
              className="group absolute bottom-4 left-4 inline-flex items-center gap-3 rounded-full bg-cream-50/95 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5 sm:bottom-5 sm:left-5"
              data-analytics-context="hero-story"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-evergreen-950">
                <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
              </span>
              Watch Dr. Wong’s story
              <span className="font-normal text-ink-muted">2:14</span>
            </Link>
          </div>

          <figure className="absolute -bottom-8 right-3 hidden w-[17.5rem] rounded-[1.4rem] border border-cream-300/80 bg-white/95 p-4 shadow-lift backdrop-blur sm:block lg:-right-6 lg:bottom-10">
            <StarRow size="h-3.5 w-3.5" />
            <blockquote className="mt-2 font-heading text-[1.05rem] leading-snug text-ink">
              <p>“{heroQuote.text}”</p>
            </blockquote>
            <figcaption className="mt-2 text-xs font-semibold text-ink-muted">{heroQuote.name} · Google review</figcaption>
          </figure>
          <HarvestBats className={harvestMoonBox} />
        </div>
      </div>

      {/* Redwoods and roots drawing themselves under the hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative -mt-2 h-[120px] bg-[url('/brand/roots-ink.svg')] bg-[length:1100px_275px] bg-[position:center_-28px] bg-no-repeat sm:h-[150px] sm:bg-[length:1440px_360px] sm:bg-[position:center_-40px]"
      />
    </section>
  );
}

export default HomeHero;
