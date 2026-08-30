import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

const featuredReviews = [
  {
    name: "Marypat Power",
    text: "Dr Kris and Dr Wong are both so personable, professional, and gentle. I highly recommend them!",
  },
  {
    name: "Steve Collins",
    text: "High skill level, modern tools, helpful guidance and a friendly demeanor. An excellent experience for cleanings and fillings. Strong recommend.",
  },
  {
    name: "Michael Austin",
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me. Kind and caring, gentle and good, and reasonably priced!",
  },
] as const;

const PatientProofSection = () => {
  return (
    <section
      aria-labelledby="patient-proof-title"
      className="relative overflow-hidden bg-[#0B1F3A] py-16 text-white md:py-24"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end lg:gap-14">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sky-200">
              <Quote className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
              Patient Stories
            </p>
            <h2
              id="patient-proof-title"
              className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
              Care People Feel Good About Returning To
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-slate-300 md:text-lg">
              Selected comments from published Google reviews, shared in the
              patients&apos; own words.
            </p>
          </div>

          <div className="flex lg:justify-end">
            <Link
              href="/testimonials"
              className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-[background-color,border-color] hover:border-white/40 hover:bg-white/10"
            >
              Read more patient stories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6 md:mt-12">
          {featuredReviews.map((review) => (
            <article
              key={review.name}
              className="flex h-full flex-col rounded-3xl border border-white/12 bg-white/[0.07] p-6 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)] md:p-7"
            >
              <div
                aria-label="5 out of 5 stars"
                className="flex gap-0.5 text-amber-300"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-pretty text-base leading-7 text-slate-100 md:text-lg">
                “{review.text}”
              </blockquote>
              <footer className="mt-6 border-t border-white/12 pt-5">
                <p className="font-semibold text-white">{review.name}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Google Review
                </p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PatientProofSection;
