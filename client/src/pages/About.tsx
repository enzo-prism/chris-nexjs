import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CarFront,
  ChefHat,
  Flag,
  GraduationCap,
  MapPin,
  Mountain,
  Play,
  Plane,
  Users,
} from "lucide-react";

import StructuredData from "@/components/seo/StructuredData";
import { CtaBand } from "@/components/ds/CtaBand";
import { FactGrid, type Fact } from "@/components/ds/FactGrid";
import { PageHero } from "@/components/ds/PageHero";
import { ReviewCard, StarRow, type ReviewQuote } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";
import { ServiceReviews } from "@/components/ds/ServiceReviews";
import { TeamCard } from "@/components/ds/TeamCard";
import { PracticeLineage } from "@/components/trust/PracticeLineage";
import type { StoryVideoVersion } from "@/components/video/types";
import { fullCircleFilm, fullCircleShort } from "@/data/fullCircleFilm";
import { fullCircleTranscript } from "@/data/fullCircleTranscript";
import { featuredQuote, homeRibbonQuotes } from "@/data/reviewHighlights";
import { serviceReviews } from "@/data/serviceReviews";
import { drWong, team } from "@/data/team";
import {
  buildBreadcrumbSchema,
  buildProfilePageSchema,
  buildTeamPersonSchemas,
  buildVideoObjectSchemas,
  type StructuredDataNode,
} from "@/lib/structuredData";
import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";

// Interactive players load their chunk alongside hydration; the SSR shell
// (poster + play button) paints without it.
const StoryFilm = dynamic(() => import("@/components/video/StoryFilm"));
const StoryPlayer = dynamic(() =>
  import("@/components/video/StoryPlayer").then((mod) => mod.StoryPlayer),
);

const INTERVIEW_SRC = "/videos/meet-dr-wong.mp4";
const INTERVIEW_POSTER = "/images/about/meet-dr-wong-smile.webp";

const meetDrWong: StoryVideoVersion = {
  id: "meet-dr-wong",
  label: "Interview",
  title: "Meet Dr. Wong, a one-minute introduction",
  durationSeconds: 59,
  aspect: "16/9",
  sources: [{ src: INTERVIEW_SRC, width: 1280 }],
  poster: INTERVIEW_POSTER,
};

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "About Dr. Wong", path: "/about" },
];

// Verbatim quotes from the lead-owned, test-guarded review files.
const byName = (list: readonly ReviewQuote[], name: string): ReviewQuote | undefined =>
  list.find((q) => q.name === name);
const heroQuote = byName(homeRibbonQuotes, "Kevin Zhang");
const historyQuotes = [
  byName(homeRibbonQuotes, "Anne Starr"),
  byName(serviceReviews, "Ross Veltman"),
  featuredQuote,
].filter((q): q is ReviewQuote => Boolean(q));

const credentials: readonly Fact[] = [
  { icon: GraduationCap, label: "Dental school", value: "University of the Pacific, Dugoni School of Dentistry, 2018" },
  { icon: BookOpen, label: "Undergraduate", value: "UC Davis, bachelor’s degree in biology" },
  { icon: BadgeCheck, label: "Memberships", value: "ADA, CDA, and Santa Clara County Dental Society" },
  { icon: MapPin, label: "Hometown", value: "Born and raised in Sacramento" },
];

const approach: readonly { icon: ServiceIconName; title: string; body: string }[] = [
  {
    icon: "calendar",
    title: "Unhurried visits",
    body: "Time to ask questions and to understand your options. Nobody should leave a dental chair confused.",
  },
  {
    icon: "checkup",
    title: "He explains first",
    body: "Dr. Wong shows you what he sees and why it matters before he recommends anything.",
  },
  {
    icon: "tooth",
    title: "Conservative by default",
    body: "Prevention and early detection come first, and the plan keeps as much natural tooth as possible.",
  },
  {
    icon: "insurance",
    title: "Costs before treatment",
    body: "The team checks your PPO benefits and explains your portion before any treatment begins.",
  },
];

const interests = [
  { icon: Mountain, label: "Running, hiking & working out" },
  { icon: Flag, label: "Golf & basketball" },
  { icon: Plane, label: "Travel & new cultures" },
  { icon: ChefHat, label: "Cooking international cuisines" },
  { icon: CarFront, label: "An avid car enthusiast" },
] as const;

// Real photos from Dr. Wong and Dr. Michelle Fong's wedding, which the team
// attended (Cloudinary originals, resized at the CDN before next/image).
const cld = (path: string) => `https://res.cloudinary.com/dhqpqfw6w/image/upload/c_limit,w_1100,q_auto/${path}`;
const weddingPhotos = [
  { src: cld("v1764193096/Michelle_Chris-preview28_zkbzo6.webp"), alt: "Dr. Wong and Dr. Michelle Fong walking hand in hand on their wedding day" },
  { src: cld("v1764193096/IMG_8294_dbsehz.webp"), alt: "The newlyweds with guests in front of a red floral backdrop" },
  { src: cld("v1764193096/IMG_8193_wcxrms.webp"), alt: "Dr. Wong laughing in the photo booth with friends at his wedding" },
  { src: cld("v1764193098/Michelle_Chris-preview54_dg6hwz.webp"), alt: "Dr. Wong and Dr. Michelle Fong at sunset above the coast" },
  { src: cld("v1764193098/IMG_8195_hddelf.webp"), alt: "Wedding guests posing with props in the photo booth with Dr. Wong" },
] as const;

const hygiene = team.filter((m) => m.group === "hygiene");
const others = team.filter((m) => m.group !== "hygiene");

function buildAboutSchema(): StructuredDataNode[] {
  const nodes: StructuredDataNode[] = [];
  const breadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbs) nodes.push(breadcrumbs);
  // ProfilePage → Dr. Wong, plus a Person node for everyone on the team grid.
  nodes.push(buildProfilePageSchema({ dateModified: "2026-10-28" }));
  nodes.push(...buildTeamPersonSchemas(team));
  nodes.push(
    ...buildVideoObjectSchemas(
      [
        {
          id: "meet-dr-wong",
          title: "Meet Dr. Wong — Palo Alto dentist introduction",
          description:
            "Dr. Christopher B. Wong introduces himself and his conservative, comfort-first approach to dentistry in Palo Alto.",
          src: INTERVIEW_SRC,
          poster: INTERVIEW_POSTER,
          uploadDate: "2026-06-23",
        },
      ],
      "/about",
    ),
  );
  return nodes;
}

const interviewEnd = (
  <div className="flex max-w-sm flex-col items-center gap-4 text-center">
    <p className="font-heading text-2xl font-medium text-cream-50">
      Come say <em className="text-gold-300">hello</em>.
    </p>
    <div className="flex flex-wrap justify-center gap-2.5">
      <Link href="/schedule#appointment" className="btn btn-gold btn-sm" data-analytics-context="about-interview-end-request">
        <CalendarDays aria-hidden="true" />
        Request a visit
      </Link>
      <Link href="#story" className="btn btn-outline-light btn-sm">
        <Play aria-hidden="true" />
        Watch the film
      </Link>
    </div>
  </div>
);

const About = () => {
  return (
    <>
      <StructuredData data={buildAboutSchema()} />

      <PageHero
        crumbs={breadcrumbItems}
        eyebrow="Your Palo Alto dentist"
        title={
          <>
            About Dr. Christopher B. <em>Wong</em>
          </>
        }
        lead="Dr. Wong leads the Cambridge Avenue practice that many Palo Alto families have trusted for decades. He takes time to explain what he sees, keeps as much natural tooth as he can, and makes sure you know your costs before treatment."
        analyticsContext="about-hero"
        chips={[
          <>
            <GraduationCap className="h-3.5 w-3.5 text-evergreen-600" aria-hidden="true" />
            UOP Dugoni, 2018
          </>,
        ]}
        media={
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rounded-[2.75rem] bg-[conic-gradient(from_200deg,rgba(176,209,193,0.55),rgba(243,224,176,0.6),rgba(176,209,193,0.55))] opacity-60 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-evergreen-900 shadow-lift">
              <Image
                src="/images/about/dr-wong-portrait.webp"
                alt="Dr. Christopher B. Wong smiling in the hallway of his Palo Alto office"
                width={880}
                height={1100}
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="aspect-square h-auto w-full object-cover object-[50%_22%] sm:aspect-[4/4.4] lg:aspect-[4/4.6]"
              />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-evergreen-950/70 to-transparent" />
              <Link
                href="#story"
                className="group absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-3 rounded-full bg-cream-50/95 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5 sm:bottom-5 sm:left-5"
                data-analytics-context="about-hero-film"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-evergreen-950">
                  <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                </span>
                Watch his story
                <span className="font-normal text-ink-muted">2:14</span>
              </Link>
            </div>
            {heroQuote ? (
              <figure className="absolute -bottom-8 right-3 hidden w-[16.5rem] rounded-[1.4rem] border border-cream-300/80 bg-white/95 p-4 shadow-lift backdrop-blur sm:block lg:-right-6 lg:bottom-12">
                <StarRow size="h-3.5 w-3.5" />
                <blockquote className="mt-2 font-heading text-[1.05rem] leading-snug text-ink">
                  <p>“{heroQuote.text}”</p>
                </blockquote>
                <figcaption className="mt-2 text-xs font-semibold text-ink-muted">{heroQuote.name} · Google review</figcaption>
              </figure>
            ) : null}
          </div>
        }
      />

      {/* ---------------------------------------------------------- His story */}
      <Section id="his-story" tone="white" labelledBy="his-story-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <SectionHeading
              id="his-story-title"
              eyebrow="His story"
              title={
                <>
                  Where it <em>started</em>
                </>
              }
            />
            <div className="prose-rooted mt-6 space-y-5">
              <p>
                Dr. Wong was born and raised in Sacramento and earned his bachelor’s degree in biology
                from the University of California, Davis. He graduated from the University of the
                Pacific Arthur A. Dugoni School of Dentistry in San Francisco in 2018.
              </p>
              <p>
                He found dentistry through his dad’s family friends, two brothers who were dentists.
                When he didn’t yet know what he wanted to do, they gave him a job assisting and
                sterilizing instruments. What stayed with him was the team, and how well the staff
                knew their patients.
              </p>
              <p>
                Today his clinical focus includes{" "}
                <Link href="/invisalign">Invisalign</Link>,{" "}
                <Link href="/dental-implants">implant restoration</Link>, and{" "}
                <Link href="/restorative-dentistry">restorative care</Link>, with an ethical,
                non-invasive approach. He stays current with advances in dentistry and is an active
                member of the ADA, CDA, and SCCDS.
              </p>
            </div>
            <figure className="mt-8 border-l-2 border-gold-400 pl-5">
              <blockquote className="font-heading text-[1.45rem] leading-snug text-ink sm:text-[1.65rem]">
                <p>
                  “What I noticed most that I liked was just the team dynamic and the patient
                  relationships… <em className="text-gold-700">that’s what really drew me into dentistry.</em>”
                </p>
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-ink-muted">Dr. Wong, in the film Full Circle</figcaption>
            </figure>
          </div>

          <div className="lg:pt-4">
            <StoryPlayer
              version={meetDrWong}
              analyticsContext="about-interview"
              endScreen={interviewEnd}
              posterCaption={
                <p className="font-heading text-xl font-medium text-cream-50 sm:text-2xl">
                  Meet Dr. Wong <span className="font-sans text-sm font-semibold text-cream-100/80">· 0:59</span>
                </p>
              }
            />
            <p className="mt-3 text-sm text-ink-muted">
              A one-minute introduction, filmed in the office hallway beside the garden courtyard.
            </p>
            <FactGrid facts={credentials} className="mt-6 sm:grid-cols-2 lg:grid-cols-2" />
          </div>
        </div>
      </Section>

      {/* Website use approved by Dr. Wong on October 26, 2026. */}
      <Section id="warriors-night" tone="paper" labelledBy="outside-office-title">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <SectionHeading
              id="outside-office-title"
              eyebrow="Outside the office"
              title={<>A night at <em>the game</em></>}
              lead="Away from the office, Dr. Wong enjoys cheering on the Golden State Warriors."
            />
          </div>
          <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
            <Image
              src="/images/about/warriors-website.jpeg"
              alt="Dr. Wong and a companion wearing Golden State Warriors jerseys at a basketball game"
              width={4284}
              height={5712}
              sizes="(max-width: 768px) 90vw, 384px"
              className="h-auto w-full"
            />
            <figcaption className="px-5 py-4 text-sm text-ink-soft">An evening cheering on the Warriors.</figcaption>
          </figure>
        </div>
      </Section>

      {/* ---------------------------------------------------- Full Circle film */}
      <section
        id="story"
        aria-labelledby="story-title"
        className="surface-evergreen on-dark relative isolate overflow-hidden py-16 sm:py-20 lg:py-24"
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
                The story behind <em>the practice</em>
              </>
            }
            lead="Dr. Wong tells how he found dentistry, how Dr. Hamamoto passed the practice to him, and why so many patients have stayed."
          />
          <div className="mt-10">
            <StoryFilm
              film={fullCircleFilm}
              short={fullCircleShort}
              analyticsContext="about-story"
              transcript={fullCircleTranscript}
              onDark
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- Practice history */}
      <Section id="history" tone="paper" labelledBy="history-title">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
          <SectionHeading
            id="history-title"
            eyebrow="Three generations of one practice"
            title={
              <>
                A practice that’s come <em>full circle</em>
              </>
            }
            lead="“This practice does have a lot of history, and a lot of patients are still around,” Dr. Wong says in the film. When Dr. Hamamoto passed it to him, patients got to meet him with her blessing, and the team stayed."
          />
          <figure className="relative overflow-hidden rounded-[2rem] border border-cream-300/80 bg-cream-50 shadow-soft">
            <Image
              src="/images/redesign/film-growth-rings-kanemoto-hamamoto-wong.webp"
              alt="Illustration from the film: tree growth rings labeled Dr. Kanemoto at the center, Dr. Hamamoto, and Dr. Wong at the outer ring"
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="h-auto w-full"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-cream-50/90 px-3 py-1 text-xs font-semibold text-ink-soft">
              Still from Full Circle
            </figcaption>
          </figure>
        </div>

        <PracticeLineage className="mt-12 lg:mt-16" />

        <div className="-mx-4 mt-12 md:mx-0">
          <ul className="snap-rail px-4 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {historyQuotes.map((q) => (
              <li key={q.name} className="w-[82vw] max-w-[22rem] md:w-auto md:max-w-none">
                <ReviewCard review={q} />
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">
          “The staff has been the same staff that she had, and they’ve been great and supportive as
          well. Can’t do it without them.” — Dr. Wong
        </p>
      </Section>

      {/* ------------------------------------------------------------ Approach */}
      <Section id="approach" tone="white" labelledBy="approach-title">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <SectionHeading
              id="approach-title"
              eyebrow="How he practices"
              title={
                <>
                  Unhurried, conservative, <em>clear about cost</em>
                </>
              }
              lead="The same few habits show up again and again in patients’ reviews, and they start at the front desk."
            />
            <p className="mt-6 text-[15px] text-ink-soft">
              Curious about coverage?{" "}
              <Link href="/insurance" className="link-rooted">
                See how out-of-network PPO benefits work
              </Link>
              .
            </p>
          </div>
          <figure className="reveal relative overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
            <Image
              src="/images/redesign/dr-wong-front-desk-laughing.webp"
              alt="Dr. Christopher B. Wong laughing with two team members at the front desk"
              width={1024}
              height={576}
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="aspect-[16/10] h-auto w-full object-cover object-[60%_30%]"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-full bg-cream-50/90 px-3 py-1 text-xs font-semibold text-ink-soft backdrop-blur">
              An ordinary afternoon at the front desk
            </figcaption>
          </figure>
        </div>
        <ul className="reveal-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((item) => (
            <li key={item.title} className="card card-lift group flex gap-4 p-5 sm:flex-col sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-800 text-gold-300">
                <ServiceIcon name={item.icon} className="h-7 w-7" />
              </span>
              <div>
                <h3 className="h-card text-[1.25rem] sm:text-[1.3rem]">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-ink-soft">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <ServiceReviews
        tags={["gentle", "honest"]}
        title={
          <>
            What patients say about <em>Dr. Wong</em>
          </>
        }
      />

      {/* ---------------------------------------------------------------- Team */}
      <Section id="team" tone="cream" labelledBy="team-title">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            id="team-title"
            eyebrow="Meet the team"
            title={
              <>
                The people who’ll <em>know your name</em>
              </>
            }
            lead="Many patients have seen the same friendly faces for years, and they name them in their reviews."
          />
          <Link href="/testimonials" className="btn btn-outline self-start lg:self-auto">
            Read {GOOGLE_REVIEW_COUNT} Google reviews
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* The practice's first team group photo: everyone, in the aquarium lounge. */}
        <figure className="relative mt-10 overflow-hidden rounded-[2rem] bg-evergreen-950 shadow-lift">
          <Image
            src="/images/redesign/team-group-lounge.webp"
            alt="Dr. Christopher B. Wong and the dental team in the office lounge, lit by the aquarium"
            width={1280}
            height={853}
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="aspect-[4/3] h-auto w-full object-cover object-[50%_45%] sm:aspect-[16/8] lg:aspect-[16/7]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-evergreen-950/80 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 text-cream-50 sm:p-8">
            <span className="font-heading text-2xl leading-tight sm:text-3xl">
              One team, <em className="text-gold-300">one front door</em>
            </span>
            <span className="text-sm text-cream-100/90">Dr. Wong and the team in the office lounge, beside the reef aquarium</span>
          </figcaption>
        </figure>

        <h3 className="mt-12 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Hygiene team</h3>
        <div className="-mx-4 mt-4 sm:mx-0">
          <ul className="snap-rail px-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {hygiene.map((member) => (
              <li key={member.slug} className="w-[80vw] max-w-[20rem] sm:w-auto sm:max-w-none">
                <TeamCard member={member} showBio sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 26rem" />
              </li>
            ))}
          </ul>
        </div>

        <h3 className="mt-12 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Clinical, front desk & specialist care</h3>
        <div className="-mx-4 mt-4 sm:mx-0">
          <ul className="snap-rail px-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {others.map((member) => (
              <li key={member.slug} className="w-[80vw] max-w-[20rem] sm:w-auto sm:max-w-none">
                <TeamCard member={member} showBio sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 20rem" />
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-center text-sm text-ink-muted sm:hidden" aria-hidden="true">
          Swipe to meet everyone →
        </p>

        <div className="mt-8 flex flex-col items-start gap-4 rounded-[1.75rem] border border-cream-300/80 bg-white/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-[15px] text-ink-soft">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-evergreen-50 text-evergreen-700">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            Dr. Wong is named in {drWong.mentions}+ five-star Google reviews, and the hygienists in dozens more.
          </p>
          <Link href="/office-tour" className="link-rooted inline-flex min-h-11 items-center gap-1.5 text-sm">
            See where they work <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Section>

      {/* -------------------------------------------------- Outside the office */}
      <Section id="outside-the-office" tone="white" labelledBy="outside-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <SectionHeading
              id="outside-title"
              eyebrow="Outside the office"
              title={
                <>
                  When he’s not <em>at the chair</em>
                </>
              }
              lead="Dr. Wong stays active, loves to travel, and enjoys cooking international cuisines. He married Dr. Michelle Fong, also a dentist, and the office team joined the celebration."
            />
            <ul className="mt-7 flex flex-wrap gap-2">
              {interests.map(({ icon: Icon, label }) => (
                <li key={label} className="pill min-h-10">
                  <Icon className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mx-4 min-w-0 sm:mx-0">
            <ul className="snap-rail px-4 sm:px-0" aria-label="Photos from Dr. Wong’s wedding">
              {weddingPhotos.map((photo) => (
                <li key={photo.src} className="w-[62vw] max-w-[15rem] sm:w-[13.5rem]">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-cream-200 shadow-soft">
                    <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 62vw, 14rem" className="object-cover" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand
        analyticsContext="about-cta"
        title={
          <>
            Come meet <em>Dr. Wong</em>
          </>
        }
        lead="New patients are always welcome. Request a visit online in about a minute, or call and talk with the front desk."
      />
    </>
  );
};

export default About;
