"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { holidayHours, officeInfo } from "@/lib/data";
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
        className="min-h-[540px] w-full rounded-[28px] border border-slate-200 bg-white/80 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.35)]"
      />
    ),
  },
);

const ScheduleRequestFunnel = () => {
  const scheduleTestimonials = getTestimonialCollection("scheduleFunnel");

  return (
    <section
      id="appointment"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f6fafc_0%,#ffffff_38%,#f9fbff_100%)] py-10 sm:py-14 lg:py-20"
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
        <Link
          href="/"
          className="ui-focus-premium inline-flex items-center gap-1.5 rounded-full text-sm font-medium text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <div className="mt-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">
            Appointment Request
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Request Your Appointment
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Answer a few quick questions and we&apos;ll confirm by phone or email
            within one business day.
          </p>
        </div>

        <a
          href={`tel:${officeInfo.phoneE164}`}
          className="ui-focus-premium group mt-6 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 transition-colors hover:border-rose-300 hover:bg-rose-50"
        >
          <span className="flex items-center gap-2.5 text-sm leading-5 text-rose-800">
            <PhoneCall className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>
              <span className="font-semibold">In pain or a dental emergency?</span>{" "}
              Calling is the fastest way to be seen.
            </span>
          </span>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white transition-transform group-hover:-translate-y-0.5 sm:inline-flex">
            Call {officeInfo.phone}
          </span>
        </a>
        {holidayHours.active ? (
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            {holidayHours.shortNotice}
          </p>
        ) : null}

        <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-white px-5 py-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.5)] sm:px-8 sm:py-8">
          <AppointmentForm presentation="funnel" />
        </div>

        <TestimonialSection
          className="pb-0 pt-10"
          containerClassName="max-w-none px-0"
          gridClassName="xl:grid-cols-3"
          eyebrow="Google Reviews"
          title="Patients say the process feels straightforward from the start"
          subtitle="For new-patient booking, the strongest reviews mention clear guidance, a caring team, and visits that feel easy to navigate instead of stressful."
          testimonials={scheduleTestimonials}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/contact">
            <div className="group rounded-[24px] border border-slate-200 bg-white/80 p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
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
            </div>
          </Link>

          <Link href="/patient-resources#insurance">
            <div className="group rounded-[24px] border border-slate-200 bg-white/80 p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <FeatureIcon icon={ShieldCheck} size="sm" tone="emerald" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    Insurance &amp; payment
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Review PPO coverage guidance and payment options before your visit.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ScheduleRequestFunnel;
