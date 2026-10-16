import Link from "next/link";
import { CalendarDays, ClipboardCheck, PhoneCall, Phone } from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: CalendarDays,
    title: "Tell us what you need",
    body: "Pick a visit type, from a new-patient exam to urgent care. It takes about a minute.",
  },
  {
    icon: ClipboardCheck,
    title: "Add your insurance, if any",
    body: "We check your PPO benefits so you know your portion before treatment.",
  },
  {
    icon: PhoneCall,
    title: "We confirm a time",
    body: "The team calls or emails within one business day to confirm your visit.",
  },
] as const;

type CtaBandProps = {
  readonly id?: string;
  readonly title?: React.ReactNode;
  readonly lead?: string;
  readonly showSteps?: boolean;
  readonly analyticsContext?: string;
  readonly className?: string;
};

/** Closing "book or call" band with the glowing redwood roots. */
export function CtaBand({
  id = "appointment",
  title = (
    <>
      Ready when <em>you are</em>
    </>
  ),
  lead = "Request a visit online in about a minute, or call and talk to the front desk. Either way, you’ll know your next step before you hang up or close the page.",
  showSteps = true,
  analyticsContext = "cta-band",
  className,
}: CtaBandProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("bg-cream-100 px-4 py-14 sm:px-6 sm:py-20 lg:px-8", className)}
    >
      <div className="cw-sky surface-evergreen on-dark relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 pb-10 pt-12 shadow-lift sm:px-10 sm:pt-16 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-48 bg-[url('/brand/roots-glow.svg')] bg-[length:1440px_360px] bg-[position:center_-110px] bg-no-repeat opacity-40"
        />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-light">Your next visit</p>
            <h2 id={`${id}-title`} className="h-section mt-4 text-balance">
              {title}
            </h2>
            <p className="lead mt-5">{lead}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[17rem]">
            <Link
              href="/schedule#appointment"
              className="btn btn-gold btn-lg"
              data-analytics-context={`${analyticsContext}-book`}
            >
              <CalendarDays aria-hidden="true" />
              Request an appointment
            </Link>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-outline-light btn-lg"
              data-analytics-context={`${analyticsContext}-call`}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              Call {officeInfo.phone}
            </a>
          </div>
        </div>
        {showSteps ? (
          <ol className="relative mt-10 grid gap-5 border-t border-white/10 pt-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-4">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-[11px] font-bold text-evergreen-950">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="font-semibold text-cream-50">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-evergreen-100/85">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

export default CtaBand;
