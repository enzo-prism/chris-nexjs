import Link from "next/link";
import { AlertCircle, ArrowRight, Phone } from "lucide-react";
import { officeInfo } from "@/lib/data";
import { SeasonFallback } from "@/components/seasonal/SeasonalClient";

// Body of app/not-found.tsx. It lives under client/src so Tailwind's content
// scan (client/src only) generates its classes.
const NotFoundPanel = () => {
  return (
    <main className="min-h-screen w-full bg-[#F4F8FC]">
      <SeasonFallback />
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_28px_70px_-44px_rgba(15,23,42,0.52)] sm:p-10">
          {/* October seasonal art (AGENTS.md "Seasonal layer (October)"): a
              ghost-tooth floating in front of a harvest moon. */}
          <div aria-hidden="true" className="cw-season-only mb-8">
            <div className="cw-porthole mx-auto grid h-36 w-36 place-items-center overflow-hidden rounded-full shadow-xl ring-4 ring-white">
              <span className="cw-art cw-art-ghost cw-ghost-float w-16" />
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Error 404
          </p>
          <h1 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            404 Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-7 text-slate-600">
            Sorry — we can&apos;t find that page. Try the homepage, or contact
            the office if you need help scheduling.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="ui-btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold"
            >
              Back to homepage
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="ui-btn-outline inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {officeInfo.phone}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPanel;
