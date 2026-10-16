"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ChevronDown, MessageSquareQuote, PenLine, Quote } from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import TestimonialQuote from "@/components/testimonials/TestimonialQuote";
import { CtaBand } from "@/components/ds/CtaBand";
import { PageHero } from "@/components/ds/PageHero";
import { StarRow } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { HandwrittenNote } from "@/components/trust/HandwrittenNote";
import { drWong, team } from "@/data/team";
import { officeInfo } from "@/lib/data";
import { buildBreadcrumbSchema } from "@/lib/structuredData";
import { isNoAdditionalCommentPlaceholder } from "@/lib/testimonialText";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@shared/schema";
import { GOOGLE_REVIEW_COUNT, PUBLISHED_REVIEW_COUNT } from "@shared/reviewStats";

type TestimonialsProps = {
  /** Server-rendered published reviews (app/testimonials/page.tsx). */
  readonly initialTestimonials?: Testimonial[];
  /** Present when mounted by the legacy wouter router (unused). */
  readonly params?: unknown;
};

const FIRST_PAGE = 12;
const PAGE_STEP = 24;

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Patient reviews", path: "/testimonials" },
];

// Client-side filters over the verbatim review text. Counts are computed from
// the same list that renders, so a chip can never promise more than it shows.
type Filter = {
  readonly id: string;
  readonly label: string;
  readonly kind: "topic" | "person";
  readonly test: RegExp;
};

const filters: readonly Filter[] = [
  { id: "gentle", label: "Gentle", kind: "topic", test: /gentle|pain[- ]?(free|less)|comfort|anxi|nervous|fear|scared|calm|relax|hardly hurt|didn[’']?t hurt/i },
  { id: "hygienists", label: "Hygienists", kind: "topic", test: /hygien|cleaning|angeli[sc][ae]|\bhelen\b|\bkaye\b/i },
  { id: "families", label: "Families", kind: "topic", test: /famil|\bkids?\b|child|\bsons?\b|daughter|generation|parents|husband|\bwife\b|since i was/i },
  { id: "explains", label: "Explains clearly", kind: "topic", test: /explain|easy to understand|understood|answer(s|ed)?\b|listen|takes? (the |real )?time|took (the )?time|clear(ly)?\b/i },
  { id: "urgent", label: "Urgent help", kind: "topic", test: /emergenc|urgent|same[- ]day|toothache|broke|cracked|chipped|fell out|in pain|last[- ]minute|squeez|fit me in|made time/i },
  { id: "front-desk", label: "Front desk & insurance", kind: "topic", test: /front desk|insurance|\brachel\b|\bkelty\b|billing|scheduling|reception/i },
  { id: "dr-wong", label: "Dr. Wong", kind: "person", test: /dr\.?\s*wong|chris(topher)?\s+(b\.\s+)?wong|\bwong[’']s\b/i },
  { id: "angelisa", label: "Angelisa", kind: "person", test: /angeli[sc][ae]/i },
  { id: "helen", label: "Helen", kind: "person", test: /\bhelen\b/i },
  { id: "rachel", label: "Rachel", kind: "person", test: /\brachel\b/i },
  { id: "kelty", label: "Kelty", kind: "person", test: /\bkelty\b/i },
];

// Featured picks are looked up by reviewer name in the published corpus and
// rendered in full, so they are verbatim by construction (nothing renders if
// the review is ever removed).
const FEATURED_NAME = "Ang N.";
const STAY_NAME = "Helen T.";
const PHOTO_NAME = "Lauren Hall";

// People patients name most (portraits + one verbatim quote each from
// client/src/data/team.ts, which `pnpm test:reviews` guards).
const mentionPeople = [
  {
    filter: "dr-wong",
    name: drWong.name,
    role: drWong.role,
    image: drWong.image,
    focus: "50% 25%",
    mentions: drWong.mentions as number | undefined,
    quote: drWong.quote,
  },
  ...["angelisa", "helen", "rachel"].flatMap((slug) => {
    const m = team.find((t) => t.slug === slug);
    return m && m.quote
      ? [{ filter: slug, name: m.name, role: m.role, image: m.image, focus: m.focus ?? "50% 30%", mentions: m.mentions, quote: m.quote }]
      : [];
  }),
];

function hasText(review: Testimonial): boolean {
  return review.text.trim().length > 0 && !isNoAdditionalCommentPlaceholder(review.text);
}

// The corpus lists the (long) Yelp reviews first; weave them through the
// Google ones so the first screen mixes long and short voices. Deterministic,
// so the server and client render the same order.
function interleaveSources(list: readonly Testimonial[]): Testimonial[] {
  const yelp = list.filter((r) => sourceOf(r) === "Yelp");
  const google = list.filter((r) => sourceOf(r) !== "Yelp");
  const out: Testimonial[] = [];
  while (yelp.length || google.length) {
    const g = google.splice(0, 2);
    const y = yelp.splice(0, 1);
    out.push(...y, ...g);
  }
  return out;
}

function sourceOf(review: Testimonial): "Google" | "Yelp" {
  return review.location?.toLowerCase().includes("yelp") ? "Yelp" : "Google";
}

const Testimonials = ({ initialTestimonials }: TestimonialsProps) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    initialData: initialTestimonials,
    // The route server-renders the list; the API is only the fallback.
    enabled: !initialTestimonials,
  });
  const reviews = useMemo(() => data ?? [], [data]);
  const withText = useMemo(() => interleaveSources(reviews.filter(hasText)), [reviews]);
  const ratingOnly = reviews.length - withText.length;

  const [active, setActive] = useState<string>("all");
  const [visible, setVisible] = useState(FIRST_PAGE);
  const listId = useId();

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: withText.length };
    for (const f of filters) out[f.id] = withText.filter((r) => f.test.test(r.text)).length;
    return out;
  }, [withText]);

  const activeFilter = filters.find((f) => f.id === active);
  const filtered = activeFilter ? withText.filter((r) => activeFilter.test.test(r.text)) : withText;
  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  const featured = reviews.find((r) => r.name === FEATURED_NAME && hasText(r));
  const stayReview = reviews.find((r) => r.name === STAY_NAME && hasText(r));
  const photoReview = reviews.find((r) => r.name === PHOTO_NAME && r.image);

  const choose = (id: string, scroll = false) => {
    setActive(id);
    setVisible(FIRST_PAGE);
    if (scroll) document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const breadcrumb = buildBreadcrumbSchema(breadcrumbItems);
  const showSkeleton = isLoading && reviews.length === 0;

  return (
    <>
      {/* Breadcrumb only: no Review/AggregateRating markup (self-serving
          reviews aren't eligible, and copied Google reviews aren't ours). */}
      {breadcrumb ? <StructuredData data={[breadcrumb]} /> : null}

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="In patients’ own words"
        title={
          <>
            Patient <em>reviews</em>
          </>
        }
        lead="Every review on this page is quoted word for word from Google and Yelp: about Dr. Wong, the long-time hygienists, the front desk, and families who have come here for generations."
        analyticsContext="testimonials-hero"
        showReviews={false}
        actions={[
          <a key="read" href="#reviews" className="btn btn-primary btn-lg" data-analytics-context="testimonials-hero-read">
            <MessageSquareQuote aria-hidden="true" />
            Read the reviews
          </a>,
          <Link
            key="request"
            href="/schedule#appointment"
            className="btn btn-outline btn-lg"
            data-analytics-context="testimonials-hero-request"
          >
            <CalendarDays aria-hidden="true" />
            Request a visit
          </Link>,
        ]}
        media={
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-evergreen-900 shadow-lift">
              <Image
                src="/images/redesign/dr-wong-reception-conversation.webp"
                alt="Dr. Christopher B. Wong talking with two team members at the reception counter"
                width={1280}
                height={720}
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="aspect-[4/3] h-auto w-full object-cover object-[35%_35%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-evergreen-950/85 via-evergreen-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-cream-50 sm:p-7">
                <StarRow size="h-5 w-5" label="Five stars" />
                <p className="mt-2 flex items-baseline gap-3">
                  <span className="font-heading text-[3.6rem] font-medium leading-none sm:text-[4.6rem]">{GOOGLE_REVIEW_COUNT}</span>
                  <span className="max-w-[11rem] text-[15px] font-semibold leading-snug text-cream-100">five-star Google reviews</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-cream-100/85">
                  {PUBLISHED_REVIEW_COUNT} published five-star reviews in all, including Yelp. Read every one below.
                </p>
              </div>
            </div>
          </div>
        }
      />

      {/* ------------------------------------------------------- Featured */}
      {featured || photoReview ? (
        <section aria-labelledby="featured-title" className="surface-evergreen on-dark relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-[url('/brand/roots-glow.svg')] bg-[length:1440px_360px] bg-[position:center_-150px] bg-no-repeat opacity-40"
          />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16 lg:px-8">
            <div>
              <p className="eyebrow eyebrow-light">Featured review</p>
              <h2 id="featured-title" className="sr-only">
                Featured patient review
              </h2>
              {featured ? (
                <figure className="mt-6">
                  <Quote className="h-10 w-10 text-gold-300/80" aria-hidden="true" />
                  <blockquote className="mt-4 font-heading text-[1.55rem] leading-[1.45] text-cream-50 sm:text-[2rem] sm:leading-[1.4]">
                    <p className="text-pretty">“{featured.text}”</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 text-sm">
                    <StarRow size="h-4 w-4" />
                    <span className="font-semibold text-cream-50">{featured.name}</span>
                    <span className="text-evergreen-100/80">· {sourceOf(featured)} review</span>
                  </figcaption>
                </figure>
              ) : null}
            </div>
            {photoReview ? (
              <figure className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] bg-cream-50 text-ink shadow-lift lg:max-w-none">
                <Image
                  src={photoReview.image}
                  alt="A smiling patient gives a thumbs-up in the dental chair with Dr. Wong and an assistant"
                  width={960}
                  height={1280}
                  sizes="(max-width: 1024px) 24rem, 30vw"
                  className="aspect-[4/4.2] h-auto w-full object-cover object-[50%_40%]"
                />
                <div className="p-5 sm:p-6">
                  <StarRow size="h-3.5 w-3.5" />
                  <blockquote className="mt-2 text-[15px] leading-7 text-ink">
                    <p>“{photoReview.text}”</p>
                  </blockquote>
                  <figcaption className="mt-3 text-sm font-semibold text-ink-muted">
                    {photoReview.name} · shared this photo with her review
                  </figcaption>
                </div>
              </figure>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------- Names patients mention */}
      <Section id="team-mentions" tone="cream" labelledBy="mentions-title">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            id="mentions-title"
            eyebrow="The names in the reviews"
            title={
              <>
                People patients <em>ask for by name</em>
              </>
            }
            lead="Long-time patients don’t just review an office. They write about Dr. Wong, their hygienist, and the person who sorted out their insurance."
          />
          <Link href="/about#team" className="btn btn-outline self-start lg:self-auto">
            Meet the whole team
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="-mx-4 mt-10 sm:mx-0">
        <ul className="snap-rail px-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 xl:grid-cols-4">
          {mentionPeople.map((p) => (
            <li key={p.filter} className="card card-lift flex w-[82vw] max-w-[21rem] flex-col overflow-hidden sm:w-auto sm:max-w-none">
              <div className="flex items-center gap-4 p-5 pb-0">
                <Image
                  src={p.image}
                  alt={`${p.name}, ${p.role}`}
                  width={128}
                  height={128}
                  sizes="64px"
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                  style={{ objectPosition: p.focus }}
                />
                <div className="min-w-0">
                  <h3 className="font-heading text-xl font-medium leading-tight text-ink">{p.name}</h3>
                  <p className="mt-0.5 text-sm text-evergreen-700">{p.role}</p>
                </div>
              </div>
              <figure className="mx-5 mt-4 flex-1 rounded-2xl bg-cream-100 p-4">
                <Quote className="h-4 w-4 text-gold-500" aria-hidden="true" />
                <blockquote className="mt-1.5 text-[15px] leading-6 text-ink">
                  <p>“{p.quote.text}”</p>
                </blockquote>
                <figcaption className="mt-2 text-xs font-semibold text-ink-muted">{p.quote.name} · Google review</figcaption>
              </figure>
              <div className="flex flex-wrap items-center justify-between gap-2 p-5 pt-4">
                {p.mentions && p.mentions > 2 ? (
                  <span className="text-sm font-semibold text-evergreen-800">Named in {p.mentions}+ reviews</span>
                ) : (
                  <span className="text-sm font-semibold text-evergreen-800">Named in reviews</span>
                )}
                <button
                  type="button"
                  onClick={() => choose(p.filter, true)}
                  className="link-rooted inline-flex min-h-11 items-center gap-1.5 text-sm"
                  aria-controls={listId}
                >
                  Read them <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </Section>

      {/* ------------------------------------------------------- All reviews */}
      <Section id="reviews" tone="white" labelledBy="reviews-title" className="scroll-mt-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-14">
          <SectionHeading
            id="reviews-title"
            eyebrow="Every review"
            title={
              <>
                What patients <em>mention</em>
              </>
            }
            lead="Tap a topic or a name to narrow the list."
          />
          <div className="space-y-4">
            <FilterGroup
              label="Topics"
              items={[{ id: "all", label: "All reviews" }, ...filters.filter((f) => f.kind === "topic")]}
              active={active}
              counts={counts}
              onChoose={choose}
              controls={listId}
            />
            <FilterGroup
              label="People"
              items={filters.filter((f) => f.kind === "person")}
              active={active}
              counts={counts}
              onChoose={choose}
              controls={listId}
            />
          </div>
        </div>

        <p className="mt-8 text-sm text-ink-muted" aria-live="polite">
          {activeFilter
            ? `Showing ${shown.length} of ${filtered.length} reviews that mention ${activeFilter.kind === "topic" ? `“${activeFilter.label.toLowerCase()}”` : activeFilter.label}.`
            : `Showing ${shown.length} of ${filtered.length} written reviews.`}{" "}
          {active !== "all" ? (
            <button type="button" onClick={() => choose("all")} className="link-rooted inline-flex min-h-11 items-center">
              Show all
            </button>
          ) : null}
        </p>

        {showSkeleton ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-[1.5rem] border border-cream-300/80 bg-cream-100" />
            ))}
          </div>
        ) : isError && reviews.length === 0 ? (
          <div className="card mt-6 p-8 text-center">
            <h3 className="h-card">We’re refreshing patient reviews right now</h3>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-ink-soft">
              Please try again in a moment, or read them on{" "}
              <a href={officeInfo.reviewUrl} className="link-rooted" target="_blank" rel="noopener noreferrer">
                Google
              </a>
              .
            </p>
            <button type="button" onClick={() => void refetch()} className="btn btn-outline mt-5">
              Retry loading reviews
            </button>
          </div>
        ) : (
          <ul id={listId} className="mt-6 gap-5 sm:columns-2 lg:columns-3">
            {shown.map((review) => (
              <li key={review.id} className="mb-5 break-inside-avoid">
                <TestimonialQuote testimonial={review} className="h-auto" />
              </li>
            ))}
          </ul>
        )}

        {remaining > 0 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_STEP)}
              className="btn btn-outline btn-lg"
              aria-controls={listId}
            >
              Show more reviews
              <span className="font-normal text-ink-muted">({remaining} more)</span>
              <ChevronDown aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="mt-10 grid gap-3 text-sm leading-6 text-ink-muted sm:grid-cols-2">
          {ratingOnly > 0 ? (
            <p>
              Another {ratingOnly} patients left five stars without writing a comment. They count toward the{" "}
              {PUBLISHED_REVIEW_COUNT} total but don’t appear as cards.
            </p>
          ) : null}
          <p>
            Some Google reviews were imported as previews and end in “…”. Older reviews may name Dr. Kris
            Hamamoto, who passed the practice to Dr. Wong, or other dentists who have practiced here.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------- Letters & stay */}
      <Section id="letters" tone="paper" labelledBy="letters-title">
        <SectionHeading
          id="letters-title"
          eyebrow="Beyond the star rating"
          title={
            <>
              Notes that say <em>a little more</em>
            </>
          }
          lead="A handwritten thank-you, and why one family stayed even when the office went out of network."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <HandwrittenNote headingLevel="h3" />
          {stayReview ? (
            <figure className="card flex flex-col p-6 sm:p-8">
              <StarRow />
              <h3 className="h-card mt-3 text-[1.45rem]">
                Why one family <em>stayed</em>
              </h3>
              <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-ink-soft">
                <p>“{stayReview.text}”</p>
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold text-ink-muted">
                {stayReview.name} · {sourceOf(stayReview)} review
              </figcaption>
              <Link href="/insurance" className="link-rooted mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm">
                How out-of-network PPO benefits work <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </figure>
          ) : null}
        </div>
        <p className="mt-8 text-[15px] text-ink-soft">
          Looking for longer before-and-after stories?{" "}
          <Link href="/patient-stories" className="link-rooted">
            Read patient stories
          </Link>
          .
        </p>
      </Section>

      {/* -------------------------------------------------- Leave a review */}
      <Section id="leave-a-review" tone="white" spacing="tight" labelledBy="leave-review-title">
        <div className="card flex flex-col items-start gap-6 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
              <PenLine className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="leave-review-title" className="h-card text-[1.6rem] sm:text-[1.9rem]">
                Been in <em>recently?</em>
              </h2>
              <p className="mt-2 max-w-xl text-[15px] leading-7 text-ink-soft">
                A Google review helps neighbors find a dentist they can trust, and the team reads every one.
              </p>
            </div>
          </div>
          <a
            href={officeInfo.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold btn-lg w-full md:w-auto"
            data-analytics-context="testimonials-share"
          >
            Leave a Google review
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </Section>

      <CtaBand
        analyticsContext="testimonials-cta"
        title={
          <>
            See what they’re <em>talking about</em>
          </>
        }
      />
    </>
  );
};

function FilterGroup({
  label,
  items,
  active,
  counts,
  onChoose,
  controls,
}: {
  readonly label: string;
  readonly items: readonly { readonly id: string; readonly label: string }[];
  readonly active: string;
  readonly counts: Record<string, number>;
  readonly onChoose: (id: string) => void;
  readonly controls: string;
}) {
  return (
    <div role="group" aria-label={`Filter reviews by ${label.toLowerCase()}`}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items
          .filter((item) => item.id === "all" || (counts[item.id] ?? 0) > 0)
          .map((item) => {
            const on = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                aria-controls={controls}
                onClick={() => onChoose(item.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-evergreen-200",
                  on
                    ? "border-evergreen-800 bg-evergreen-800 text-cream-50"
                    : "border-cream-300 bg-white text-ink-soft hover:border-evergreen-300 hover:text-ink",
                )}
              >
                {item.label}
                <span className={cn("text-xs font-medium", on ? "text-gold-300" : "text-ink-muted")}>{counts[item.id] ?? 0}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default Testimonials;
