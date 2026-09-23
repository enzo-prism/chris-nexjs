import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";

import ButtonLink from "@/components/common/ButtonLink";
import IntroVideoButton from "@/components/common/IntroVideoButton";
import { officeInfo } from "@/lib/data";
import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";

const HERO_IMAGE_SRC = "/images/hero/dr-wong-hero.webp";

const HeroSection = () => {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#0B1F3A] pb-16 pt-[var(--header-height,110px)] text-white md:pb-20 lg:pb-24"
      style={{ marginTop: "calc(var(--header-height, 110px) * -1)" }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(59,130,246,0.16),transparent_30%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#123A6B]/45 to-transparent" />
        <div className="absolute -right-36 top-16 h-96 w-96 rounded-full border border-sky-300/10" />
        <div className="absolute -right-20 top-32 h-64 w-64 rounded-full border border-sky-300/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-16 xl:gap-20">
          <div className="max-w-2xl">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-200/20 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-sky-100 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-sky-300" aria-hidden="true" />
              {officeInfo.address.line1}, Palo Alto
              <span className="hidden text-sky-200/50 sm:inline" aria-hidden="true">·</span>
              <span className="hidden font-medium text-sky-100/90 sm:inline">New patients welcome</span>
            </div>

            <h1 className="mt-6 text-balance font-heading text-4xl font-bold leading-[1.08] tracking-[-0.025em] text-white sm:text-5xl lg:text-[3.65rem]">
              Unhurried, conservative dentistry in Palo Alto
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-slate-200 md:text-xl">
              Christopher B. Wong, DDS, and an experienced hygiene team take the
              time to explain what they see, protect healthy tooth structure, and
              walk you through costs before any treatment.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/schedule#appointment"
                size="lg"
                className="min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#0B1F3A] shadow-[0_18px_36px_-20px_rgba(255,255,255,0.55)] transition-[background-color,box-shadow,transform] hover:bg-sky-50"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Request an appointment
              </ButtonLink>
              <ButtonLink
                href="/services"
                variant="outline"
                size="lg"
                className="min-h-12 rounded-full border-white/30 px-7 text-base font-semibold text-white transition-[background-color,border-color,color] hover:border-white/50 hover:bg-white/10 hover:text-white"
              >
                Explore services
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>

            <a
              href={`tel:${officeInfo.phoneE164}`}
              data-analytics-context="hero-call"
              className="ui-focus-premium mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4 text-sky-300" aria-hidden="true" />
              Prefer to call? <span className="underline decoration-sky-300/60 underline-offset-4">{officeInfo.phone}</span>
            </a>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              <a
                href={officeInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read ${GOOGLE_REVIEW_COUNT} five-star Google reviews in a new tab`}
                className="ui-focus-premium group flex min-h-16 items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 transition-[background-color,border-color] hover:border-white/25 hover:bg-white/[0.11]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/15 text-amber-300">
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">
                    {GOOGLE_REVIEW_COUNT} five-star reviews
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-300">
                    Read reviews on Google
                  </span>
                </span>
              </a>

              <Link
                href="/insurance"
                className="ui-focus-premium group flex min-h-16 items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3 transition-[background-color,border-color] hover:border-white/25 hover:bg-white/[0.11]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-300/15 text-sky-200">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">
                    PPO insurance welcome
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-300">
                    Out-of-network · benefits checked first
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div
              className="absolute -inset-3 rounded-[2.2rem] border border-sky-200/10 bg-gradient-to-br from-white/10 to-transparent"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[1.8rem] border border-white/15 bg-slate-900 shadow-[0_40px_90px_-42px_rgba(0,0,0,0.78)]">
              <Image
                src={HERO_IMAGE_SRC}
                alt="Dr. Christopher B. Wong in his Palo Alto dental office"
                width={1280}
                height={960}
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="aspect-[4/3] h-auto w-full object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
                <IntroVideoButton context="home-hero" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
