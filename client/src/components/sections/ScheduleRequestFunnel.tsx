"use client";

import dynamic from "next/dynamic";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { holidayHours, officeInfo } from "@/lib/data";

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
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/75">
            Appointment Request
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Request Your Appointment
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Tell us what you need and we&apos;ll confirm by phone or email. Most
            patients finish in under a minute.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/"
              className="ui-focus-premium inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition-[border-color,color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary hover:shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                Need urgent care?
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-600">
                <p className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Our team usually replies within one business day.</span>
                </p>
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Your request is sent through our secure intake form.</span>
                </p>
                {holidayHours.active ? (
                  <p className="text-xs leading-5 text-slate-500">
                    {holidayHours.shortNotice}
                  </p>
                ) : null}
              </div>
            </div>

            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="ui-focus-premium inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(37,99,235,0.7)] transition-transform hover:-translate-y-0.5 hover:bg-primary/95"
            >
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              Call {officeInfo.phone}
            </a>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-slate-200/80 bg-white px-5 py-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.5)] sm:px-8 sm:py-8">
          <AppointmentForm presentation="funnel" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/contact">
            <div className="group rounded-[24px] border border-slate-200 bg-white/80 p-5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex rounded-full bg-primary/[0.08] p-2 text-primary">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
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
                  <div className="inline-flex rounded-full bg-primary/[0.08] p-2 text-primary">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>
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
