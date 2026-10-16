import Image from "next/image";
import { Mail } from "lucide-react";

import { cn } from "@/lib/utils";

// The scanned thank-you note (same letter and transcript the site has shown
// since May 2026 — see components/testimonials/HandwrittenLetter.tsx). The
// typed transcript sits next to the scan so the handwriting is readable,
// accessible, and indexable without a dialog.
const LETTER_IMAGE = "/images/patient-letter-thank-you.png";
const LETTER_DATE = "May 16, 2026";
const LETTER_DATE_ISO = "2026-05-16";
const LETTER_GREETING = "Dear Dr. Wong (& Kelty),";
const LETTER_BODY =
  "Many thanks for your close care and excellent work when I visited on Wednesday. Though I know my teeth won't last forever, I am very grateful for your efforts to help me keep them as long as I can. The bonding you did on Wednesday is holding very nicely.";
const LETTER_CLOSING = "I hope the rest of your spring is lovely.";
const LETTER_SIGNOFF = "Yours, George";

/** A patient's handwritten thank-you, shown as paper + transcript. */
export function HandwrittenNote({
  className,
  headingLevel = "h2",
}: {
  readonly className?: string;
  readonly headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <figure
      className={cn(
        "card relative grid items-center gap-8 overflow-hidden p-6 sm:p-10 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-12",
        className,
      )}
    >
      <a
        href={LETTER_IMAGE}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mx-auto block w-full max-w-[15rem] -rotate-2 rounded-2xl border border-cream-300 bg-cream-50 p-3 shadow-lift outline-none transition-transform duration-500 hover:-rotate-1 focus-visible:ring-4 focus-visible:ring-evergreen-300"
        aria-label="Open the full handwritten note in a new tab"
      >
        <Image
          src={LETTER_IMAGE}
          alt={`Handwritten thank-you note from a patient named George to Dr. Wong and Kelty, dated ${LETTER_DATE}`}
          width={612}
          height={841}
          sizes="15rem"
          className="h-auto w-full rounded-lg"
        />
        <span
          aria-hidden="true"
          className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-evergreen-800 text-gold-300 shadow-soft"
        >
          <Mail className="h-4 w-4" />
        </span>
      </a>
      <div>
        <p className="eyebrow">A handwritten note</p>
        <Heading className="h-card mt-3 text-[1.6rem] sm:text-[2rem]">
          “The bonding you did on Wednesday is <em>holding very nicely</em>”
        </Heading>
        <blockquote className="mt-6 space-y-3 border-l-2 border-gold-300 pl-5 font-heading text-lg italic leading-8 text-ink-soft">
          <p>{LETTER_GREETING}</p>
          <p>{LETTER_BODY}</p>
          <p>{LETTER_CLOSING}</p>
          <p className="not-italic font-medium text-ink">{LETTER_SIGNOFF}</p>
        </blockquote>
        <figcaption className="mt-5 text-sm text-ink-muted">
          George, a patient · note dated <time dateTime={LETTER_DATE_ISO}>{LETTER_DATE}</time>
        </figcaption>
      </div>
    </figure>
  );
}

export default HandwrittenNote;
