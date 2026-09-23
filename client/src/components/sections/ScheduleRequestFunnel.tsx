"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { officeInfo } from "@/lib/data";
import { useHolidayHours } from "@/hooks/useHolidayHours";
import { FeatureIcon } from "@/components/common/FeatureIcon";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import { getTestimonialCollection } from "@/lib/testimonials";

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
        className="min-h-[960px] w-full rounded-[28px] border border-slate-200 bg-white/80 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)] md:min-h-[852px]"
      />
    ),
  },
);

const ScheduleRequestFunnel = () => {
  const holiday = useHolidayHours();
  const scheduleTestimonials = getTestimonialCollection("scheduleFunnel");

  return (
    <section
      id="appointment"
      // `overflow-x-clip` (not `overflow-hidden`) clips the decorative blurs
      // without making this section the sticky containing block — otherwise the
      // funnel's `sticky bottom-0` submit CTA can't pin to the viewport.
      className="relative overflow-x-clip bg-[linear-gradient(180deg,#f6fafc_0%,#ffffff_38%,#f9fbff_100%)] pb-10 pt-6 sm:py-14 lg:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Request Your Appointment
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:mt-4 sm:text-lg">
            About a minute to fill out. We&apos;ll call or email within one
            business day to confirm a time.
          </p>
          <ul
            aria-label="What to expect"
            className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-600 sm:text-sm"
          >
            {[
              "New patients welcome",
              "PPO benefits checked first",
              "No account needed",
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p
          data-analytics-context="schedule-emergency"
          className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-sm leading-6 text-rose-800"
        >
          <PhoneCall className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span className="font-semibold">In pain?</span> Calling is fastest:
          <a
            href={`tel:${officeInfo.phoneE164}`}
            aria-label={`Dental emergency? Call ${officeInfo.phone}`}
            className="ui-focus-premium inline-flex min-h-11 items-center rounded-full px-1 font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 hover:text-rose-800"
          >
            {officeInfo.phone}
          </a>
        </p>
        {holiday ? (
          <p className="mt-1 text-center text-xs leading-5 text-slate-500">
            {holiday.shortNotice}
          </p>
        ) : null}

        <div className="mt-4 rounded-[28px] border border-slate-200/80 bg-white px-5 py-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.5)] sm:px-8 sm:py-8">
          <AppointmentForm presentation="funnel" />
        </div>

        <TestimonialSection
          className="pb-0 pt-10"
          containerClassName="max-w-none px-0"
          gridClassName="xl:grid-cols-3"
          eyebrow="Google Reviews"
          title="Patients say the process feels straightforward from the start"
          subtitle="For new-patient visit requests, the strongest reviews mention clear guidance, a caring team, and visits that feel easy to navigate instead of stressful."
          testimonials={scheduleTestimonials}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/contact"
            className="ui-focus-premium group block rounded-[24px] border border-slate-200 bg-white/80 p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]"
          >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <FeatureIcon icon={MapPin} size="sm" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Need office details?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Get directions, parking notes, and visit prep details.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
          </Link>

          <Link
            href="/insurance"
            className="ui-focus-premium group block rounded-[24px] border border-slate-200 bg-white/80 p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]"
          >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <FeatureIcon icon={ShieldCheck} size="sm" tone="emerald" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Insurance &amp; payment
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    We&apos;re out-of-network with PPO plans, and most still pay a
                    share. See how coverage and payment work here.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ScheduleRequestFunnel;
