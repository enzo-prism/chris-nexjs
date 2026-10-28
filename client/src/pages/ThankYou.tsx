// /thank-you (noindex). Reached after the general-question form succeeds.
// Copy must never claim a scheduled or booked appointment: the office still
// has to reply and confirm. Quiet page: no seasonal decoration.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Home, Phone } from "lucide-react";

import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";
import { officeInfo } from "@/lib/data";

const nextSteps = [
  {
    title: "Your message reaches the office",
    body: "It goes to the office inbox and is read during office hours.",
  },
  {
    title: "We reply within one business day",
    body: "By phone or email, using the details you shared.",
  },
  {
    title: "Asked about a visit?",
    body: "Nothing is booked yet. We’ll find a time with you and confirm it.",
  },
] as const;

const whileYouWait: readonly {
  readonly href: string;
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly body: string;
}[] = [
  {
    href: "/patient-resources",
    icon: "forms",
    title: "New patients & forms",
    body: "Download forms and see what to bring.",
  },
  {
    href: "/insurance",
    icon: "insurance",
    title: "Insurance & payment",
    body: "How out-of-network PPO benefits work here.",
  },
  {
    href: "/office-tour",
    icon: "tooth",
    title: "Tour the office",
    body: "See the garden courtyard and treatment rooms.",
  },
];

const ThankYou = () => {
  return (
    <section className="paper relative isolate overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-12">
        <div className="card p-6 sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-evergreen-800 text-gold-300 shadow-soft">
            <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <p className="eyebrow mt-6">Request received</p>
          <h1 className="h-display mt-3 text-balance text-[2.2rem] sm:text-[2.9rem]">
            Thank you. We’ve <em>received</em> your message.
          </h1>
          <p className="lead mt-4">
            Our team will get back to you within one business day. If anything is urgent, please call
            the office.
          </p>

          <ol className="mt-8 grid gap-4 border-t border-cream-300/80 pt-6">
            {nextSteps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-300 bg-cream-50 font-heading text-lg italic text-gold-700">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-ink">{step.title}</span>
                  <span className="mt-0.5 block text-[15px] leading-6 text-ink-soft">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-primary"
              data-analytics-context="thank-you-call"
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              Call {officeInfo.phone}
            </a>
            <Link href="/" className="btn btn-outline" data-analytics-context="thank-you-home">
              <Home aria-hidden="true" />
              Return to homepage
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <figure className="overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
            <div className="relative aspect-[16/10]">
              <Image
                src="/images/redesign/team-group-lounge.webp"
                alt="Dr. Christopher B. Wong and the dental team in the office lounge, beside the aquarium"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                style={{ objectPosition: "52% 45%" }}
              />
            </div>
            <figcaption className="px-5 py-3 text-sm text-ink-muted">
              The team you’ll hear from, at our {officeInfo.address.line1} office.
            </figcaption>
          </figure>

          <nav aria-labelledby="while-you-wait-title" className="card p-5 sm:p-6">
            <h2 id="while-you-wait-title" className="h-card text-[1.3rem]">
              While you wait
            </h2>
            <ul className="mt-3 divide-y divide-cream-300/80">
              {whileYouWait.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex min-h-16 items-center gap-4 py-3 outline-none focus-visible:rounded-xl focus-visible:shadow-[var(--ui-focus-shadow)]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                      <ServiceIcon name={item.icon} className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{item.title}</span>
                      <span className="block text-sm leading-6 text-ink-muted">{item.body}</span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default ThankYou;
