import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Images, MapPin } from "lucide-react";

import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import StructuredData from "@/components/seo/StructuredData";
import { CtaBand } from "@/components/ds/CtaBand";
import { ReviewCard } from "@/components/ds/Reviews";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";
import type { StoryVideoVersion } from "@/components/video/types";
import { fullCircleFilm, fullCircleShort } from "@/data/fullCircleFilm";
import { fullCircleTranscriptText } from "@/data/fullCircleTranscript";
import { homeRibbonQuotes } from "@/data/reviewHighlights";
import { officeInfo } from "@/lib/data";
import {
  buildBreadcrumbSchema,
  buildFullCircleVideoSchemas,
  buildVideoObjectSchemas,
  type StructuredDataNode,
} from "@/lib/structuredData";

// Interactive players load their chunk alongside hydration; the SSR shell
// (poster + play button) paints without it.
const StoryFilm = dynamic(() => import("@/components/video/StoryFilm"));
const StoryPlayer = dynamic(() =>
  import("@/components/video/StoryPlayer").then((mod) => mod.StoryPlayer),
);

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Office tour & film", path: "/office-tour" },
];

// The four real office clips (silent, 1280×720, self-hosted). Captions only
// describe what the clips show.
type TourClip = {
  readonly id: string;
  readonly schemaId: string;
  readonly version: StoryVideoVersion;
  readonly caption: string;
};

const clip = (
  id: string,
  title: string,
  durationSeconds: number,
): StoryVideoVersion => ({
  id: `tour-${id}`,
  label: title,
  title,
  durationSeconds,
  aspect: "16/9",
  sources: [{ src: `/videos/office-${id}.mp4`, width: 1280 }],
  poster: `/images/tour/office-${id}-poster.webp`,
});

const tourClips: readonly TourClip[] = [
  {
    id: "atrium",
    schemaId: "atrium",
    version: clip("atrium", "The garden courtyard", 13),
    caption:
      "The treatment rooms open onto a planted courtyard with a stone fountain, so most visits come with daylight and a little green.",
  },
  {
    id: "exterior",
    schemaId: "stop-1",
    version: clip("exterior", "Finding the office", 8),
    caption: `The entrance at ${officeInfo.address.line1} in ${officeInfo.address.city}, marked by a sculpted pine and the Christopher Wong D.D.S. sign.`,
  },
  {
    id: "lounge",
    schemaId: "stop-2",
    version: clip("lounge", "The aquarium lounge", 12),
    caption: "A quiet place to wait, with a reef aquarium, leather chairs, and soft light.",
  },
  {
    id: "frontdesk",
    schemaId: "stop-3",
    version: clip("frontdesk", "The front desk", 11),
    caption: "Where the team checks you in, confirms your visits, and answers insurance questions.",
  },
];

// Real office photos (manifest selects, exported to public/images/redesign).
const photos = [
  {
    src: "/images/redesign/office-entrance-dr-wong.webp",
    width: 1024,
    height: 576,
    alt: "Dr. Christopher B. Wong in a white coat at the office entrance, beside the Christopher Wong D.D.S. sign and a sculpted pine",
    caption: "The front entrance",
    span: "col-span-2 lg:col-span-2 lg:row-span-2",
    position: "55% 40%",
  },
  {
    src: "/images/redesign/office-front-desk-atrium.webp",
    width: 1280,
    height: 720,
    alt: "Front desk with wood-slat panels beside the glass atrium",
    caption: "Front desk",
    span: "",
    position: "40% 45%",
  },
  {
    src: "/images/redesign/office-aquarium-lounge.webp",
    width: 1280,
    height: 720,
    alt: "Lounge with a reef aquarium and leather chairs",
    caption: "Aquarium lounge",
    span: "",
    position: "55% 40%",
  },
  {
    src: "/images/office/garden-view-operatory.webp",
    width: 1800,
    height: 1350,
    alt: "Treatment room that looks out onto the garden courtyard",
    caption: "Garden-view treatment room",
    span: "",
    position: "50% 50%",
  },
  {
    src: "/images/redesign/office-reception-waiting.webp",
    width: 1024,
    height: 576,
    alt: "Reception and waiting area with wood-slat walls and navy seating",
    caption: "Reception",
    span: "",
    position: "50% 45%",
  },
  {
    src: "/images/office/quiet-garden-courtyard.webp",
    width: 1800,
    height: 1350,
    alt: "Quiet garden courtyard with a stone fountain, seen through the office’s glass walls",
    caption: "The courtyard fountain",
    span: "",
    position: "50% 55%",
  },
  {
    src: "/images/redesign/office-hallway-glass.webp",
    width: 1280,
    height: 720,
    alt: "Office hallway with glass walls and framed artwork",
    caption: "Glass-walled hallway",
    span: "",
    position: "50% 50%",
  },
] as const;

// All four clips shipped together on 2026-06-23 (self-hosted, no
// Cloudinary version segment to derive the date from).
const TOUR_VIDEO_UPLOAD_DATE = "2026-06-23";

const transcriptPlainText = fullCircleTranscriptText.map((part) => part.lines).join(" ");

function buildOfficeTourSchema(): StructuredDataNode[] {
  const nodes: StructuredDataNode[] = [];
  const breadcrumbs = buildBreadcrumbSchema(breadcrumbItems);
  if (breadcrumbs) nodes.push(breadcrumbs);
  // The film is this page's main content (Google shows video results there).
  nodes.push(...buildFullCircleVideoSchemas({ transcript: transcriptPlainText }));
  nodes.push(
    ...buildVideoObjectSchemas(
      tourClips.map((c) => ({
        id: c.schemaId,
        title: `Office tour: ${c.version.title.replace(/^The /, "the ")}`,
        description: c.caption,
        src: c.version.sources[0].src,
        poster: c.version.poster,
        uploadDate: TOUR_VIDEO_UPLOAD_DATE,
      })),
      "/office-tour",
    ),
  );
  return nodes;
}

const parkingQuote = homeRibbonQuotes.find((q) => q.name === "Lawan Jackson");

const OfficeTour = () => {
  return (
    <>
      <StructuredData data={buildOfficeTourSchema()} id="office-tour-video-schema" />

      {/* ------------------------------------------------- Hero + the film */}
      <section className="paper relative isolate overflow-hidden" aria-labelledby="office-tour-title">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20">
          <PageBreadcrumbs items={breadcrumbItems} inline className="mb-6 sm:mb-8" />
          <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
            <div className="max-w-3xl">
              <p className="eyebrow rise-in">Office tour · A short film</p>
              <h1
                id="office-tour-title"
                className="h-display mt-5 text-balance text-[2.35rem] sm:text-[3.1rem] lg:text-[3.6rem]"
              >
                Step inside our Palo Alto <em>dental office</em>
              </h1>
              <p className="lead mt-5 max-w-2xl">
                Start with <em className="font-heading">Full Circle</em>, Dr. Wong’s two-minute film about how
                the practice came to him. Then walk through the courtyard, the lounge, and the front desk
                before your first visit.
              </p>
            </div>
            <div className="rise-in rise-in-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col lg:items-stretch">
              <Link
                href="/schedule#appointment"
                className="btn btn-primary btn-lg"
                data-analytics-context="office-tour-hero-request"
              >
                <CalendarDays aria-hidden="true" />
                Request a visit
              </Link>
              <Link href="/gallery" className="btn btn-outline btn-lg" data-analytics-context="office-tour-hero-gallery">
                <Images aria-hidden="true" />
                Browse the photo gallery
              </Link>
            </div>
          </div>

          <div id="film" className="mx-auto mt-10 max-w-5xl scroll-mt-24 sm:mt-12">
            <StoryFilm film={fullCircleFilm} short={fullCircleShort} analyticsContext="office-tour-film" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Transcript */}
      <Section id="transcript" tone="white" labelledBy="transcript-title" spacing="tight">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-14">
          <div>
            <SectionHeading
              id="transcript-title"
              eyebrow="Read along"
              title={
                <>
                  Full Circle, <em>in his words</em>
                </>
              }
            />
            <p className="mt-4 text-[15px] leading-7 text-ink-soft">
              The film’s transcript, by chapter. Captions are also available in the player.
            </p>
            <Link href="/about" className="link-rooted mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm">
              More about Dr. Wong <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {fullCircleTranscriptText.map((part, i) => (
              <li key={part.chapter} className="border-l-2 border-gold-300 pl-4">
                <h3 className="font-heading text-lg font-medium text-ink">
                  <span className="mr-2 text-gold-700">{i + 1}</span>
                  {part.chapter}
                </h3>
                <p className="mt-1.5 text-[15px] leading-7 text-ink-soft">{part.lines}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ------------------------------------------------------- The clips */}
      <Section id="walkthrough" tone="cream" labelledBy="walkthrough-title">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            id="walkthrough-title"
            eyebrow="A short walk-through"
            title={
              <>
                Four corners of the <em>office</em>
              </>
            }
            lead="Short, silent clips filmed in the office. Tap any one to play it."
          />
          <a
            href={officeInfo.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline self-start lg:self-auto"
            data-analytics-context="office-tour-directions"
          >
            <MapPin aria-hidden="true" />
            Directions
          </a>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:gap-8">
          {tourClips.map((c) => (
            <li key={c.id}>
              <figure>
                <StoryPlayer version={c.version} analyticsContext={`office-tour-clip-${c.id}`} />
                <figcaption className="mt-4 px-1">
                  <h3 className="h-card text-[1.3rem]">{c.version.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-7 text-ink-soft">{c.caption}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Section>

      {/* ------------------------------------------------------- Photos */}
      <Section id="photos" tone="white" labelledBy="photos-title">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            id="photos-title"
            eyebrow="Photo highlights"
            title={
              <>
                Light, wood, and a <em>garden in the middle</em>
              </>
            }
            lead="Real photos of the office on Cambridge Avenue, from the front door to the treatment rooms."
          />
          <Link href="/gallery" className="btn btn-primary self-start lg:self-auto" data-analytics-context="office-tour-photos-gallery">
            See the full gallery
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ul className="reveal-stagger mt-10 grid auto-rows-[9.5rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:gap-4 lg:auto-rows-[13rem] lg:grid-cols-4">
          {photos.map((photo) => (
            <li key={photo.src} className={photo.span}>
              <figure className="group relative h-full overflow-hidden rounded-[1.5rem] bg-cream-200 shadow-soft">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={photo.span ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
                  style={{ objectPosition: photo.position }}
                />
                <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-cream-50/90 px-2.5 py-1 text-xs font-semibold text-ink-soft backdrop-blur sm:bottom-3 sm:left-3 sm:px-3">
                  {photo.caption}
                </figcaption>
              </figure>
            </li>
          ))}
          <li className="col-span-2">
            <div className="surface-evergreen on-dark flex h-full flex-col justify-between gap-4 rounded-[1.5rem] p-5 sm:p-6">
              <p className="font-heading text-xl leading-snug text-cream-50">
                See everything, from the operatories to <em className="text-gold-300">Dr. Wong’s polaroids</em>.
              </p>
              <Link href="/gallery" className="btn btn-gold btn-sm self-start">
                Open the gallery
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </li>
        </ul>

        {/* Visiting: the team photo and practical next steps. */}
        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <figure className="relative overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
            <Image
              src="/images/redesign/team-group-lounge.webp"
              alt="Dr. Christopher B. Wong and the dental team in the office lounge, beside the aquarium"
              width={1280}
              height={853}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="aspect-[4/3] h-auto w-full object-cover object-[52%_45%] sm:aspect-[16/9]"
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-evergreen-950/75 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-cream-50 sm:flex-row sm:items-end sm:justify-between sm:p-7">
              <span>
                <span className="block font-heading text-2xl leading-tight">
                  Who you’ll meet <em className="text-gold-300">at the door</em>
                </span>
                <span className="mt-1 block text-sm text-cream-100/90">Dr. Wong and the team in the office lounge</span>
              </span>
              <Link href="/about#team" className="btn btn-outline-light btn-sm self-start sm:self-auto">
                Meet the team
                <ArrowRight aria-hidden="true" />
              </Link>
            </figcaption>
          </figure>
          <div className="flex flex-col gap-5">
            <div className="card flex flex-1 flex-col p-6">
              <p className="eyebrow">Visiting</p>
              <address className="mt-3 not-italic">
                <span className="block font-heading text-xl text-ink">{officeInfo.address.line1}</span>
                <span className="block text-[15px] text-ink-soft">
                  {officeInfo.address.city}, {officeInfo.address.region} {officeInfo.address.postalCode}
                </span>
              </address>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={officeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  data-analytics-context="office-tour-visit-map"
                >
                  <MapPin aria-hidden="true" />
                  Open in Maps
                </a>
                <Link href="/contact" className="btn btn-ghost btn-sm" data-analytics-context="office-tour-visit-contact">
                  Contact & hours
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
            {parkingQuote ? <ReviewCard review={parkingQuote} /> : null}
          </div>
        </div>
      </Section>

      <CtaBand
        analyticsContext="office-tour-cta"
        title={
          <>
            Come see it <em>in person</em>
          </>
        }
        lead="New patients are always welcome. Request a visit online in about a minute, or call and talk with the front desk."
      />
    </>
  );
};

export default OfficeTour;
