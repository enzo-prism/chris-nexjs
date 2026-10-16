import Image from "next/image";
import { Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TeamMember } from "@/data/team";

type TeamCardProps = {
  readonly member: TeamMember;
  readonly className?: string;
  readonly showBio?: boolean;
  readonly sizes?: string;
};

/** Portrait card: real photo, name/role, a verifiable highlight, and — when
 *  patients have named them in reviews — a verbatim quote. */
export function TeamCard({
  member,
  className,
  showBio = false,
  sizes = "(max-width: 640px) 78vw, (max-width: 1024px) 40vw, 22rem",
}: TeamCardProps) {
  return (
    <article
      className={cn(
        "cw-cobweb group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-cream-300/80 bg-white shadow-soft",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-200">
        <Image
          src={member.image}
          alt={`${member.name}, ${member.role}`}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
          style={{ objectPosition: member.focus ?? "50% 30%" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-evergreen-950/80 via-evergreen-950/25 to-transparent"
        />
        {member.since ? (
          <span className="absolute left-3 top-3 rounded-full bg-cream-50/90 px-3 py-1 text-xs font-bold text-evergreen-800 backdrop-blur">
            Here since {member.since}
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4 text-cream-50">
          <h3 className="font-heading text-2xl font-medium leading-tight">{member.name}</h3>
          <p className="mt-0.5 text-sm font-medium text-cream-100/90">{member.role}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[15px] font-semibold text-evergreen-800">{member.highlight}</p>
        {showBio ? <p className="mt-2 text-[15px] leading-6 text-ink-soft">{member.bio}</p> : null}
        {member.quote ? (
          <figure className="mt-4 rounded-2xl bg-cream-100 p-4">
            <Quote className="h-4 w-4 text-gold-500" aria-hidden="true" />
            <blockquote className="mt-1.5 text-[15px] leading-6 text-ink">
              <p>“{member.quote.text}”</p>
            </blockquote>
            <figcaption className="mt-2 text-xs font-semibold text-ink-muted">
              {member.quote.name}
              {member.mentions && member.mentions > 2 ? (
                <span className="font-normal"> · one of {member.mentions}+ reviews naming {member.name}</span>
              ) : null}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </article>
  );
}

export default TeamCard;
