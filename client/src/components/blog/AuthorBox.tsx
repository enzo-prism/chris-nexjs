import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, GraduationCap } from "lucide-react";
import { doctorInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

// Split the bio into sentences without breaking on "Dr." or initials
// ("Christopher B. Wong", "Arthur A. Dugoni") — the old split(". ") cut the
// bio off at "Dr. Christopher B.".
function bioSentences(bio: string): string[] {
  const guarded = bio.replace(/\b(Dr|Mr|Mrs|Ms|St|[A-Z])\./g, "$1\u0000");
  return (guarded.match(/[^.!?]+[.!?]+/g) ?? [guarded])
    .map((sentence) => sentence.replace(/\u0000/g, ".").trim())
    .filter(Boolean);
}

/** Who runs the practice behind the article, with an honest education note. */
const AuthorBox = ({ className }: { readonly className?: string }) => {
  const sentences = bioSentences(doctorInfo.bio);
  // "Dr. Wong is passionate about …" + "His clinical focus includes …"
  // (education and memberships are listed below).
  const bio = sentences.slice(2, 4).join(" ");

  return (
    <aside aria-labelledby="author-box-title" className={cn("card overflow-hidden", className)}>
      <div className="grid sm:grid-cols-[11rem_1fr]">
        <div className="relative aspect-[4/3] bg-evergreen-900 sm:aspect-auto sm:min-h-full">
          <Image
            src="/images/about/dr-wong-portrait.webp"
            alt="Dr. Christopher B. Wong in the office"
            fill
            sizes="(max-width: 640px) 100vw, 11rem"
            className="object-cover object-[50%_22%]"
          />
        </div>
        <div className="p-6 sm:p-7">
          <p className="eyebrow">About the practice</p>
          <h2 id="author-box-title" className="h-card mt-3 text-[1.5rem]">
            {doctorInfo.name}
          </h2>
          <p className="mt-1 text-sm font-semibold text-evergreen-700">General and family dentist, Palo Alto</p>
          <p className="mt-3 text-[15px] leading-7 text-ink-soft">{bio}</p>
          <ul className="mt-4 grid gap-2 text-sm text-ink-soft">
            <li className="flex items-start gap-2">
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
              UOP Dugoni School of Dentistry, 2018
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-evergreen-600" aria-hidden="true" />
              ADA, CDA, and SCCDS member
            </li>
          </ul>
          <Link href="/about" className="link-rooted mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm">
            Meet Dr. Wong <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-4 border-t border-cream-300/80 pt-4 text-[13px] leading-6 text-ink-muted">
            This article is general dental education from our office. It isn’t a diagnosis and doesn’t replace an
            exam or personal treatment advice.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default AuthorBox;
