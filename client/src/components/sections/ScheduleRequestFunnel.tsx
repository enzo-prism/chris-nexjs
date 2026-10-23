"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, PhoneCall } from "lucide-react";
import { officeInfo } from "@/lib/data";
import { useHolidayNotice } from "@/components/patients/useHolidayNotice";
import { ReviewCard } from "@/components/ds/Reviews";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";
import { reviewsFor } from "@/data/serviceReviews";
import { DEFAULT_APPOINTMENT_LEAD_FORM_NAME } from "@/lib/appointmentLead";
import type { AppointmentType } from "@shared/scheduleRequest";

type ScheduleRequestFunnelProps = {
  readonly title?: ReactNode;
  readonly lead?: string;
  readonly headingAs?: "h1" | "h2";
  readonly defaultAppointmentType?: AppointmentType;
  readonly leadFormName?: string;
  readonly requestSource?: string;
  readonly showReviews?: boolean;
  readonly showHelpLinks?: boolean;
};

const AppointmentForm = dynamic(
  () => import("@/components/forms/AppointmentForm"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        // Height matches the mounted form (measured: 962px < 768px, 852px >= 768px)
        // so the ssr:false placeholder->form swap reserves the right space and
        // doesn't shift content below it (keeps /schedule CLS near zero). The
        // form is client-only by design (viewport-dependent render), so a
        // skeleton that matches its height is the safe way to avoid the shift.
        className="min-h-[960px] w-full rounded-[1.25rem] bg-cream-50 md:min-h-[852px]"
      />
    ),
  },
);

// Verbatim quotes about visiting and being cared for (serviceReviews.ts).
// Never former-dentist praise on the conversion page.
const scheduleQuotes = reviewsFor(["visit", "gentle", "honest"], 3);

const helpLinks: readonly {
  readonly href: string;
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly body: string;
  readonly context: string;
}[] = [
  {
    href: "/contact",
    icon: "calendar",
    title: "Need office details?",
    body: "Hours, directions, parking notes, and a general-question form.",
    context: "schedule-help-contact",
  },
  {
    href: "/insurance",
    icon: "insurance",
    title: "Insurance & payment",
    body: "We’re out-of-network with PPO plans, and most still pay a share. See how coverage and payment work here.",
    context: "schedule-help-insurance",
  },
];

const ScheduleRequestFunnel = ({
  title = "Request Your Appointment",
  lead = "About a minute to fill out. We'll call or email within one business day to confirm a time.",
  headingAs = "h1",
  defaultAppointmentType,
  leadFormName = DEFAULT_APPOINTMENT_LEAD_FORM_NAME,
  requestSource = "schedule_page_form_v2",
  showReviews = true,
  showHelpLinks = true,
}: ScheduleRequestFunnelProps) => {
  // Post-mount only: a build-time date would mismatch on hydration.
  const holiday = useHolidayNotice();
  const Heading = headingAs;

  return (
    <section
      id="appointment"
      // `overflow-x-clip` (not `overflow-hidden`) clips the decorative glow
      // without making this section a scroll container, so nothing inside it
      // (including the form's own focus and scroll handling) gets trapped.
      className="relative overflow-x-clip paper pb-12 pt-6 sm:pb-16 sm:pt-10 lg:pb-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[url('/brand/roots-glow.svg')] bg-[length:1200px_300px] bg-[position:center_-160px] bg-no-repeat opacity-[0.12] [mask-image:linear-gradient(to_bottom,#000,transparent)]"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Heading className="font-heading text-3xl font-bold tracking-[-0.02em] text-ink sm:text-[2.75rem] sm:leading-[1.1]">
            {title}
          </Heading>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-base leading-7 text-ink-soft sm:mt-3 sm:text-lg">
            {lead}
          </p>
          <ul
            aria-label="What to expect"
            className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-ink-soft sm:mt-4 sm:text-sm"
          >
            {[
              "New patients welcome",
              "PPO benefits checked first",
              "No account needed",
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-evergreen-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p
          data-analytics-context="schedule-emergency"
          className="mx-auto mt-4 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-1.5 rounded-full border border-gold-300/80 bg-gold-200/40 py-0.5 pl-4 pr-2 text-center text-sm leading-6 text-ink"
        >
          <PhoneCall className="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
          <span className="font-semibold">In pain?</span> Calling is fastest:
          <a
            href={`tel:${officeInfo.phoneE164}`}
            aria-label={`Dental emergency? Call ${officeInfo.phone}`}
            className="ui-focus-premium inline-flex min-h-11 items-center rounded-full px-2 font-semibold text-evergreen-800 underline decoration-gold-500/70 underline-offset-4 hover:text-evergreen-950"
          >
            {officeInfo.phone}
          </a>
        </p>
        {holiday ? (
          <p className="mt-2 text-center text-xs leading-5 text-ink-muted">
            {holiday.shortNotice}
          </p>
        ) : null}

        <div className="mt-4 rounded-[1.75rem] border border-cream-300/80 bg-white px-5 py-6 shadow-lift sm:px-8 sm:py-8">
          <AppointmentForm
            presentation="funnel"
            defaultAppointmentType={defaultAppointmentType}
            leadFormName={leadFormName}
            requestSource={requestSource}
          />
        </div>
      </div>

      {showReviews || showHelpLinks ? (
        <div className="relative mx-auto mt-12 max-w-5xl px-4 sm:mt-14 sm:px-6 lg:px-8">
          {showReviews && scheduleQuotes.length ? (
            <div>
              <h2 className="text-center font-heading text-[1.6rem] font-medium leading-tight text-ink sm:text-[2rem]">
                What patients <em className="font-normal italic text-gold-600">say</em>
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {scheduleQuotes.map((quote) => (
                  <ReviewCard key={quote.name} review={quote} size="sm" />
                ))}
              </div>
            </div>
          ) : null}

          {showHelpLinks ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {helpLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card card-lift group flex items-center gap-4 p-5 outline-none"
                  data-analytics-context={link.context}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                    <ServiceIcon name={link.icon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{link.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-ink-muted">{link.body}</span>
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-evergreen-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default ScheduleRequestFunnel;
