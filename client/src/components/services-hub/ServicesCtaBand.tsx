import Link from "next/link";
import { CalendarDays, MessageCircle, Phone } from "lucide-react";

import { officeInfo } from "@/lib/data";

/**
 * Closing band for /services. Same look as ds/CtaBand, plus the "Ask a
 * Question" path. Heading and link names are a Playwright contract
 * (tests/mobile/cta-flows.spec.ts): keep them exact.
 */
export function ServicesCtaBand() {
  return (
    <section
      id="appointment"
      aria-labelledby="services-cta-title"
      className="bg-cream-100 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="cw-sky surface-evergreen on-dark relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] px-6 py-12 shadow-lift sm:py-16 sm:px-10 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 h-48 bg-[url('/brand/roots-glow.svg')] bg-[length:1440px_360px] bg-[position:center_-110px] bg-no-repeat opacity-40"
        />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-14">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-light">Your next visit</p>
            <h2 id="services-cta-title" className="h-section mt-4 text-balance">
              Ready to Request an <em>Appointment?</em>
            </h2>
            <p className="lead mt-5">
              Send your request today and our team will follow up to confirm an available time. Not sure which
              service you need? Ask us first, or call and talk to the front desk.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[17rem]">
            <Link
              href="/schedule#appointment"
              className="btn btn-gold btn-lg"
              data-analytics-context="services-cta-request"
            >
              <CalendarDays aria-hidden="true" />
              Request an Appointment
            </Link>
            <Link href="/contact" className="btn btn-outline-light btn-lg" data-analytics-context="services-cta-question">
              <MessageCircle aria-hidden="true" />
              Ask a Question
            </Link>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="btn btn-ghost btn-lg text-cream-50 hover:bg-white/10"
              data-analytics-context="services-cta-call"
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            >
              <Phone aria-hidden="true" />
              Call {officeInfo.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesCtaBand;
