"use client";

import { Mail, PenLine, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LETTER_IMAGE = "/images/patient-letter-thank-you.png";
const LETTER_DATE = "May 16, 2026";

// Typed transcript of the scanned note. Rendered alongside the image so the
// handwriting is readable, accessible to screen readers, and understandable to
// search engines and other platforms.
const LETTER_BODY =
  "Many thanks for your close care and excellent work when I visited on Wednesday. Though I know my teeth won't last forever, I am very grateful for your efforts to help me keep them as long as I can. The bonding you did on Wednesday is holding very nicely.";
const LETTER_CLOSING = "I hope the rest of your spring is lovely.";
const LETTER_GREETING = "Dear Dr. Wong (& Kelty),";
const LETTER_SIGNOFF = "Yours, George";

// A shorter pull-quote shown on the page itself (outside the dialog) so the
// sentiment is visible and indexable without requiring a click.
const LETTER_EXCERPT =
  "Many thanks for your close care and excellent work… The bonding you did on Wednesday is holding very nicely.";

const HandwrittenLetter = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-[#F5F9FC] via-white to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="grid gap-8 p-8 md:grid-cols-[auto,1fr] md:items-center md:p-10">
            {/* Stationery preview */}
            <div className="mx-auto w-full max-w-[220px]">
              <div className="relative -rotate-2 rounded-xl border border-[#E5E7EB] bg-[#FCFBF7] p-3 shadow-md transition-transform duration-300 hover:-rotate-1">
                <img
                  src={LETTER_IMAGE}
                  alt={`Handwritten thank-you note dated ${LETTER_DATE} from a patient named George to Dr. Wong and team member Kelty`}
                  width={612}
                  height={841}
                  loading="lazy"
                  className="h-auto w-full rounded-md"
                />
                <span className="pointer-events-none absolute -right-2 -top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <PenLine className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            {/* Framing copy + visible excerpt */}
            <div className="space-y-4 text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-primary">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Handwritten note
              </span>
              <h2 className="font-heading text-2xl font-bold leading-tight text-[#1F2933] sm:text-3xl">
                A handwritten thank-you from a patient
              </h2>
              <blockquote className="relative border-l-2 border-primary/30 pl-4 text-left">
                <Quote
                  className="mb-1 h-6 w-6 text-primary/30"
                  aria-hidden="true"
                />
                <p className="text-lg italic leading-relaxed text-[#4B5563]">
                  {LETTER_EXCERPT}
                </p>
                <cite className="mt-2 block text-sm font-semibold not-italic text-[#1F2933]">
                  — George, {LETTER_DATE}
                </cite>
              </blockquote>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary px-6 py-2 font-medium text-white shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg">
                    <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
                    Read the handwritten letter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-xl text-[#1F2933]">
                      A handwritten note from George
                    </DialogTitle>
                    <DialogDescription>
                      A scanned thank-you note received {LETTER_DATE}, shown with
                      a typed transcript for readability.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 md:grid-cols-2">
                    <figure className="m-0">
                      <img
                        src={LETTER_IMAGE}
                        alt={`Full handwritten thank-you note dated ${LETTER_DATE} from George thanking Dr. Wong and Kelty for dental bonding work and close care`}
                        width={612}
                        height={841}
                        className="mx-auto h-auto w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-[#FCFBF7] p-2 shadow-sm"
                      />
                      <figcaption className="mt-2 text-center text-xs text-[#6B7280]">
                        Original note, shared with permission.
                      </figcaption>
                    </figure>

                    <div className="space-y-4 text-[#1F2933]">
                      <p className="text-sm font-medium text-[#6B7280]">
                        {LETTER_DATE}
                      </p>
                      <p className="leading-relaxed">{LETTER_GREETING}</p>
                      <p className="leading-relaxed">{LETTER_BODY}</p>
                      <p className="leading-relaxed">{LETTER_CLOSING}</p>
                      <p className="font-semibold leading-relaxed">
                        {LETTER_SIGNOFF}
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HandwrittenLetter;
