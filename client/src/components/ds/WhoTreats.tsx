import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import { drWong, team, type TeamMember } from "@/data/team";

/** "Who will treat you": Dr. Wong plus the relevant teammates. */
export function WhoTreats({
  teamSlugs = [],
  intro = "Dr. Wong explains what he sees before recommending treatment, and keeps as much natural tooth as possible.",
  className,
}: {
  readonly teamSlugs?: readonly string[];
  readonly intro?: string;
  readonly className?: string;
}) {
  const members = teamSlugs
    .map((slug) => team.find((m) => m.slug === slug))
    .filter((m): m is TeamMember => Boolean(m));
  return (
    <section className={cn("bg-white py-12 sm:py-20", className)} aria-labelledby="who-treats-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">Your care team</p>
        <h2 id="who-treats-title" className="h-section mt-4">
          Who you’ll <em>see</em>
        </h2>
        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-[1.2fr_1fr]">
          <article className="card grid grid-cols-[6.5rem_1fr] overflow-hidden sm:grid-cols-[13rem_1fr]">
            <div className="relative min-h-[10rem] bg-evergreen-900 sm:min-h-[16rem]">
              <Image src={drWong.image} alt="Dr. Christopher B. Wong" fill sizes="(max-width: 640px) 104px, 13rem" className="object-cover object-[50%_25%]" />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="h-card">Dr. Christopher B. Wong</h3>
              <p className="mt-1 text-sm font-semibold text-evergreen-700">{drWong.role}</p>
              <p className="mt-3 text-[15px] leading-7 text-ink-soft">{intro}</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2">
                  <GraduationCap className="h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  UOP Dugoni School of Dentistry, 2018
                </li>
                <li className="flex gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
                  ADA, CDA, and SCCDS member
                </li>
              </ul>
              <Link href="/about" className="link-rooted mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm">
                Meet Dr. Wong <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
          {members.length ? (
            <ul className="grid gap-4">
              {members.map((m) => (
                <li key={m.slug} className="card flex items-center gap-4 p-4">
                  <Image
                    src={m.image}
                    alt={`${m.name}, ${m.role}`}
                    width={128}
                    height={128}
                    sizes="64px"
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                    style={{ objectPosition: m.focus ?? "50% 30%" }}
                  />
                  <div>
                    <h3 className="font-heading text-lg font-medium text-ink">{m.name}</h3>
                    <p className="text-sm text-evergreen-700">{m.role}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{m.highlight}</p>
                  </div>
                </li>
              ))}
              <li>
                <Link href="/about#team" className="link-rooted inline-flex min-h-11 items-center gap-1.5 text-sm">
                  Meet the whole team <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default WhoTreats;
