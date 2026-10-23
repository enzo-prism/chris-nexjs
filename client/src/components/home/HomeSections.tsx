import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Car,
  ClipboardList,
  Clock,
  CreditCard,
  GraduationCap,
  MapPin,
  Phone,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";

import { officeInfo } from "@/lib/data";
import { GoogleReviewProof } from "@/components/reviews/GoogleReviewProof";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import { ReviewCard, ReviewMarquee, StarRow } from "@/components/ds/Reviews";
import { TeamCard } from "@/components/ds/TeamCard";
import { careFinder } from "@/data/siteNav";
import { featuredQuote, homeRibbonQuotes } from "@/data/reviewHighlights";
import { drWong, team } from "@/data/team";
import { fullCircleFilm, fullCircleShort } from "@/data/fullCircleFilm";
import { fullCircleTranscript } from "@/data/fullCircleTranscript";
import { SpiderDrop } from "@/components/seasonal/HomeSeasonal";

// The player is interactive-only chrome: its chunk loads alongside hydration
// instead of counting toward the homepage's First Load JS.
const StoryFilm = dynamic(() => import("@/components/video/StoryFilm"));

/* ------------------------------------------------------ Current patients */
export function CurrentPatientStrip() {
  const linkClass =
    "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] font-semibold text-evergreen-800 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-evergreen-500";
  return (
    <nav aria-label="For current patients" className="border-y border-cream-300/70 bg-cream-100/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
        <span className="mr-2 text-sm font-semibold text-ink-muted">Already a patient?</span>
        <Link href="/patient-resources" className={linkClass}>
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Patient forms
        </Link>
        <Link href="/contact" className={linkClass}>
          <Clock className="h-4 w-4" aria-hidden="true" />
          Hours &amp; directions
        </Link>
        <a
          href={`tel:${officeInfo.phoneE164}`}
          data-analytics-context="current-patient-bar"
          className={linkClass}
          aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {officeInfo.phone}
        </a>
      </div>
    </nav>
  );
}

/* ---------------------------------------------------------------- Reviews */
export function ReviewRibbon() {
  const half = Math.ceil(homeRibbonQuotes.length / 2);
  return (
    <section aria-labelledby="ribbon-title" className="relative bg-white py-14 sm:py-16">
      <SpiderDrop className="right-[6%] top-0 h-40 w-12 overflow-hidden sm:right-[12%]" />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="eyebrow">In their words</p>
          <h2 id="ribbon-title" className="h-section mt-3 text-[1.9rem] sm:text-[2.4rem]">
            <GoogleReviewProof surface="home-sections" variant="heading" />
          </h2>
        </div>
        <Link href="/testimonials" className="btn btn-outline self-start sm:self-auto">
          Read the reviews
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-8 space-y-4">
        <ReviewMarquee reviews={homeRibbonQuotes.slice(0, half)} duration={95} label="Patient reviews, row one" />
        <ReviewMarquee
          reviews={homeRibbonQuotes.slice(half)}
          duration={110}
          reverse
          label="Patient reviews, row two"
          className="hidden md:block"
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Care finder */
export function CareFinder() {
  return (
    <Section id="find-care" tone="cream" labelledBy="find-care-title">
      <SectionHeading
        id="find-care-title"
        eyebrow="Find the right care"
        title={
          <>
            What brings you <em>in today?</em>
          </>
        }
        lead="Choose what sounds closest. Each page explains the visit, the costs, and what Dr. Wong will look for."
      />
      <ul className="reveal-stagger mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {careFinder.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="card card-lift group flex h-full flex-col gap-4 p-4 outline-none sm:p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors duration-300 group-hover:bg-evergreen-800 group-hover:text-gold-300 sm:h-14 sm:w-14">
                <ServiceIcon name={item.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <span>
                <span className="block font-heading text-[1.15rem] font-medium leading-snug text-ink sm:text-[1.35rem]">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm leading-snug text-ink-muted sm:text-[15px]">{item.blurb}</span>
              </span>
              <ArrowRight
                className="mt-auto h-5 w-5 text-evergreen-600 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-[15px] text-ink-soft">
        Something else?{" "}
        <Link href="/services" className="link-rooted">
          See every service
        </Link>{" "}
        or{" "}
        <a href={`tel:${officeInfo.phoneE164}`} className="link-rooted" data-analytics-context="finder-call">
          call {officeInfo.phone}
        </a>
        .
      </p>
    </Section>
  );
}

/* ------------------------------------------------------- Full Circle film */
export function StorySection() {
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="surface-evergreen on-dark relative isolate overflow-hidden py-16 sm:py-20 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] bg-[url('/brand/roots-glow.svg')] bg-[length:1440px_360px] bg-[position:center_-150px] bg-no-repeat opacity-50"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="story-title"
          align="center"
          eyebrow={<span className="text-mint-300">A short film · Full Circle</span>}
          title={
            <>
              Three dentists, one practice, <em>full circle</em>
            </>
          }
          lead="How Dr. Wong found dentistry, how Dr. Kris Hamamoto came to hand him the practice she took over from Dr. Benson Kanemoto, and why the same team still greets families who have been coming for decades."
        />
        <div className="mt-10">
          <StoryFilm
            film={fullCircleFilm}
            short={fullCircleShort}
            analyticsContext="home-story"
            transcript={fullCircleTranscript}
            onDark
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- Team */
export function TeamSection() {
  return (
    <Section id="team" tone="cream" labelledBy="team-title">
      <SectionHeading
        id="team-title"
        eyebrow="Meet the team"
        title={
          <>
            The people who’ll <em>know your name</em>
          </>
        }
        lead="Patients mention them by name in their reviews, and many have seen the same faces for years."
      />

      <article className="card mt-10 grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[22rem] bg-evergreen-900 lg:min-h-full">
          <Image
            src={drWong.image}
            alt="Dr. Christopher B. Wong"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[50%_25%]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-evergreen-950/70 to-transparent" />
          <p className="absolute bottom-4 left-5 rounded-full bg-cream-50/90 px-3 py-1 text-xs font-bold text-evergreen-800">
            Named in {drWong.mentions}+ five-star reviews
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <p className="eyebrow">Your dentist</p>
          <h3 className="h-section mt-3 text-[2rem] sm:text-[2.5rem]">
            Dr. Christopher B. <em>Wong</em>
          </h3>
          <p className="prose-rooted mt-4">
            Dr. Wong explains what he sees before recommending treatment. His
            approach centers on prevention, early detection, and keeping as much
            natural tooth as possible, with a clinical focus on{" "}
            <Link href="/invisalign">Invisalign</Link>,{" "}
            <Link href="/dental-implants">implant restoration</Link>, and{" "}
            <Link href="/restorative-dentistry">restorative care</Link>.
          </p>
          <ul className="mt-6 grid gap-2.5 text-[15px] text-ink-soft sm:grid-cols-2">
            <li className="flex items-start gap-2.5">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
              University of the Pacific, Dugoni School of Dentistry, 2018
            </li>
            <li className="flex items-start gap-2.5">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-evergreen-600" aria-hidden="true" />
              Member of the ADA, CDA, and Santa Clara County Dental Society
            </li>
          </ul>
          <figure className="mt-7 rounded-2xl bg-cream-100 p-5">
            <StarRow size="h-3.5 w-3.5" />
            <blockquote className="mt-2 font-heading text-lg leading-8 text-ink">
              <p>“{drWong.quote.text}”</p>
            </blockquote>
            <figcaption className="mt-2 text-sm font-semibold text-ink-muted">{drWong.quote.name} · Google review</figcaption>
          </figure>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/about" className="btn btn-primary">
              Read Dr. Wong’s story
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="#story" className="btn btn-outline">
              Watch the film
            </Link>
          </div>
        </div>
      </article>

      <div className="relative mt-6 -mx-4 sm:mx-0">
        <ul className="snap-rail px-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
          {team.map((member) => (
            <li key={member.slug} className="w-[78vw] max-w-[20rem] sm:w-auto sm:max-w-none">
              <TeamCard member={member} />
            </li>
          ))}
          {/* Fills the grid's last slot (2 cols: 8th cell; lg 3 cols: spans 2; xl 4 cols: 8th cell). */}
          <li className="w-[78vw] max-w-[20rem] sm:w-auto sm:max-w-none lg:col-span-2 xl:col-span-1">
            <div className="surface-evergreen on-dark flex h-full flex-col justify-between gap-6 rounded-[1.75rem] p-6 sm:p-7">
              <div>
                <p className="eyebrow eyebrow-light">Before your visit</p>
                <h3 className="h-card mt-3 text-[1.6rem] leading-tight">
                  Questions? <em>Just ask.</em>
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-evergreen-100">
                  The front desk can check your insurance benefits, explain costs,
                  and find a visit time that fits your week.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/schedule#appointment"
                  className="btn btn-gold"
                  data-analytics-context="home-team-request"
                >
                  Request a visit
                </Link>
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="btn btn-outline-light"
                  data-analytics-context="home-team-call"
                >
                  <Phone aria-hidden="true" />
                  {officeInfo.phone}
                </a>
              </div>
            </div>
          </li>
        </ul>
        <p className="mt-2 px-4 text-center text-sm text-ink-muted sm:hidden" aria-hidden="true">
          Swipe to meet everyone →
        </p>
      </div>

      <figure className="relative mt-10 overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
        <div className="relative aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/7]">
          <Image
            src="/images/redesign/team-group-reception-smiling.webp"
            alt="Dr. Christopher B. Wong and the dental team smiling together in the office reception area"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-[50%_45%]"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-evergreen-950/75 to-transparent sm:block" />
        {/* Phones: a solid panel under the photo so the caption never covers faces. */}
        <figcaption className="flex flex-col gap-3 bg-evergreen-900 p-5 text-cream-50 sm:absolute sm:inset-x-0 sm:bottom-0 sm:flex-row sm:items-end sm:justify-between sm:bg-transparent sm:p-8">
          <span>
            <span className="block font-heading text-2xl leading-tight sm:text-3xl">
              Same faces, <em className="text-gold-300">visit after visit</em>
            </span>
            <span className="mt-1 block text-sm text-cream-100/90">Dr. Wong and the team in the reception area</span>
          </span>
          <Link href="/about#team" className="btn btn-outline-light btn-sm self-start sm:self-auto">
            Meet everyone
            <ArrowRight aria-hidden="true" />
          </Link>
        </figcaption>
      </figure>
    </Section>
  );
}

/* ------------------------------------------------------------------ Office */
export function OfficeSection() {
  const easyParking = homeRibbonQuotes.find((q) => q.name === "Lawan Jackson");
  return (
    <Section id="office" tone="white" labelledBy="office-title">
      <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
        <SectionHeading
          id="office-title"
          eyebrow="The office"
          title={
            <>
              A garden office on <em>Cambridge Avenue</em>
            </>
          }
          lead="Treatment rooms open onto a quiet courtyard, a short walk from California Avenue in Palo Alto."
        />
        <div className="flex flex-wrap gap-3">
          <Link href="/office-tour" className="btn btn-primary">
            Take the office tour
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/gallery" className="btn btn-outline">
            Gallery
          </Link>
        </div>
      </div>

      <div className="reveal-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <figure className="relative overflow-hidden rounded-[1.75rem] sm:col-span-2 lg:row-span-2">
          <video
            className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto"
            src="/videos/office-atrium.mp4"
            poster="/images/tour/office-atrium-poster.webp"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            aria-hidden="true"
          />
          <figcaption className="absolute bottom-4 left-4 rounded-full bg-cream-50/90 px-3 py-1 text-sm font-semibold text-ink">
            The atrium courtyard
          </figcaption>
        </figure>
        <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:aspect-auto">
          <Image src="/images/office/garden-view-operatory.webp" alt="Treatment room with a window onto the garden" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
        </figure>
        <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:aspect-auto">
          <Image src="/images/redesign/office-reception-waiting.webp" alt="Reception and waiting area with wood-slat walls and navy seating" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
        </figure>
        {easyParking ? (
          <div className="sm:col-span-2">
            <ReviewCard review={easyParking} className="h-full" />
          </div>
        ) : null}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ Cost clarity */
const costCards = [
  {
    icon: ShieldCheck,
    title: "Have PPO insurance?",
    body: "We’re out-of-network, but most PPO plans still pay a share of your care here. Send us your plan and we’ll check your benefits and explain your portion before treatment.",
  },
  {
    icon: PiggyBank,
    title: "No dental insurance?",
    body: "Ask about our in-house dental plan, which offers savings on preventive care and treatment.",
  },
  {
    icon: CreditCard,
    title: "Ways to pay",
    body: "We accept Visa, MasterCard, and FSA/HSA funds.",
  },
] as const;

export function CostSection() {
  return (
    <Section id="insurance-and-cost" tone="paper" labelledBy="cost-title">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            id="cost-title"
            eyebrow="Insurance & cost"
            title={
              <>
                Know your cost <em>before</em> you commit
              </>
            }
            lead="“Out-of-network” sounds more alarming than it is. Most PPO plans still contribute, and you’ll hear what your plan is expected to pay, and what you’d pay, before treatment begins."
          />
          <Link href="/insurance" className="btn btn-outline mt-8">
            How out-of-network coverage works
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ul className="reveal-stagger grid gap-4">
          {costCards.map((card) => {
            const Icon = card.icon;
            return (
              <li key={card.title} className="card flex items-start gap-5 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="h-card text-[1.3rem]">{card.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-7 text-ink-soft">{card.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------- Visit */
const nearby = [
  { href: "/dentist-menlo-park", label: "Menlo Park" },
  { href: "/dentist-stanford", label: "Stanford" },
  { href: "/dentist-mountain-view", label: "Mountain View" },
  { href: "/locations", label: "All nearby areas" },
] as const;

const hoursRows = [
  ["Monday", "monday"],
  ["Tuesday", "tuesday"],
  ["Wednesday", "wednesday"],
  ["Thursday", "thursday"],
  ["Friday", "friday"],
  ["Weekends", "saturday"],
] as const;

export function VisitSection() {
  return (
    <Section id="palo-alto-dentist" tone="white" labelledBy="visit-title">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <SectionHeading
            id="visit-title"
            eyebrow="Visiting the office"
            title={
              <>
                In Palo Alto’s <em>California Avenue</em> district
              </>
            }
            lead="At our Cambridge Avenue office, the team provides modern, conservative dentistry for children, teens, and adults. Patients visit from Palo Alto, Stanford, Menlo Park, Mountain View, and nearby Peninsula communities."
          />
          <nav aria-label="Dental office service areas" className="mt-8 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link key={n.href} href={n.href} className="pill min-h-11 transition-colors hover:border-evergreen-400 hover:text-evergreen-800">
                <MapPin className="h-3.5 w-3.5 text-evergreen-500" aria-hidden="true" />
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="card overflow-hidden">
          <div className="relative aspect-[16/9]">
            <Image
              src="/images/redesign/office-entrance-dr-wong.webp"
              alt="Dr. Christopher B. Wong in a white coat at the office entrance, beside the practice sign"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-[60%_35%]"
            />
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-ink">
                <MapPin className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                Office location
              </h3>
              <address className="mt-2 text-[15px] not-italic leading-7 text-ink-soft">
                {officeInfo.address.line1}
                <br />
                {officeInfo.address.line2}
              </address>
              <a
                href={officeInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-rooted mt-2 inline-flex min-h-11 items-center gap-1.5"
              >
                <Car className="h-4 w-4" aria-hidden="true" />
                Get directions
              </a>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-ink">
                <Clock className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                Regular hours
              </h3>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] text-ink-soft">
                {hoursRows.map(([label, key]) => (
                  <div key={key} className="contents">
                    <dt className="font-medium text-ink">{label}</dt>
                    <dd>{officeInfo.hours[key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------- Featured quote */
export function FeaturedQuote() {
  return (
    <Section tone="white" spacing="tight" label="A patient’s words">
      <figure className="reveal mx-auto max-w-4xl text-center">
        <StarRow className="justify-center" size="h-5 w-5" />
        <blockquote className="mt-5 font-heading text-[1.7rem] leading-[1.35] text-ink sm:text-[2.3rem]">
          <p>“{featuredQuote.text}”</p>
        </blockquote>
        <figcaption className="mt-5 text-[15px] font-semibold text-ink-muted">
          {featuredQuote.name} · Google review
        </figcaption>
      </figure>
    </Section>
  );
}
