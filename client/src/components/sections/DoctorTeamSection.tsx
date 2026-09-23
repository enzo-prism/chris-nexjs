import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trees } from "lucide-react";

import ButtonLink from "@/components/common/ButtonLink";
import { FeatureIcon } from "@/components/common/FeatureIcon";
import IntroVideoButton from "@/components/common/IntroVideoButton";

type TeamFact = {
  readonly title: string;
  readonly body: string;
  readonly image?: { readonly src: string; readonly alt: string };
};

// Specific, verifiable reasons to choose this office. Sourced from the team
// bios in client/src/lib/data.ts — keep them in sync if a bio changes.
const teamFacts: readonly TeamFact[] = [
  {
    title: "A periodontist on the team",
    body: "Dr. Pearl Tran, a Diplomate of the American Board of Periodontology, is part of the team for gum and periodontal care.",
    image: { src: "/images/team/dr-pearl-tran.png", alt: "Dr. Pearl Tran" },
  },
  {
    title: "Hygienists who know you",
    body: "Angelisa has cared for patients here since 2008, and Helen brings more than 15 years of dental hygiene experience.",
    image: { src: "/images/team/angelisa.png", alt: "Angelisa, registered dental hygienist" },
  },
  {
    title: "Garden-facing treatment rooms",
    body: "Treatment rooms look out on a quiet courtyard garden at our Cambridge Avenue office.",
  },
];

const DoctorTeamSection = () => {
  return (
    <section
      id="about-doctor"
      aria-labelledby="about-doctor-title"
      className="bg-[#F4F8FC] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          {/* Phones already see Dr. Wong (and the video shortcut) in the hero,
              so this second photo only appears on wider screens. It is a
              different frame from the hero: the intro video's courtyard shot. */}
          <div className="relative mx-auto hidden w-full max-w-md lg:sticky lg:top-28 lg:block lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-2 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.6)]">
              <Image
                src="/images/about/meet-dr-wong-poster.webp"
                alt="Dr. Christopher B. Wong seated beside the office's garden courtyard"
                width={1280}
                height={720}
                sizes="38vw"
                className="aspect-[4/5] h-auto w-full rounded-[1.55rem] object-cover object-[50%_50%]"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <IntroVideoButton context="home-doctor" label="Meet Dr. Wong (1 min)" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Meet your dentist
            </p>
            <h2
              id="about-doctor-title"
              className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl"
            >
              A dentist who explains before he treats
            </h2>
            <p className="mt-6 text-pretty text-lg leading-8 text-slate-700">
              Dr. Christopher B. Wong graduated from the University of the
              Pacific Arthur A. Dugoni School of Dentistry in 2018. He favors
              prevention, early detection, and keeping as much natural tooth
              structure as possible, and he explains what he sees before
              recommending treatment.
            </p>
            <p className="mt-4 text-pretty text-base leading-7 text-slate-600 md:text-lg">
              His clinical focus includes{" "}
              <Link href="/invisalign" className="ui-link-premium">
                Invisalign
              </Link>
              ,{" "}
              <Link href="/dental-implants" className="ui-link-premium">
                implant restoration
              </Link>
              , and{" "}
              <Link href="/restorative-dentistry" className="ui-link-premium">
                restorative care
              </Link>
              .
            </p>

            <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              The team behind your visit
            </h3>
            <ul className="mt-4 grid gap-3">
              {teamFacts.map((fact) => (
                <li
                  key={fact.title}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-5"
                >
                  {fact.image ? (
                    <Image
                      src={fact.image.src}
                      alt={fact.image.alt}
                      width={96}
                      height={96}
                      sizes="48px"
                      className="h-12 w-12 shrink-0 rounded-full object-cover object-[50%_30%] ring-2 ring-sky-100"
                    />
                  ) : (
                    <FeatureIcon icon={Trees} tone="emerald" size="md" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-950">{fact.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 md:text-base md:leading-7">
                      {fact.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ButtonLink
                href="/about"
                size="lg"
                className="min-h-12 rounded-full px-7 text-base font-semibold"
              >
                Meet Dr. Wong and the team
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorTeamSection;
