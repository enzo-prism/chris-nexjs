import Link from "next/link";
import { ArrowRight, Home, Phone } from "lucide-react";
import { officeInfo } from "@/lib/data";
import { LogoMark } from "@/components/ds/LogoMark";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";
import { SeasonFallback } from "@/components/seasonal/SeasonalClient";

// Body of app/not-found.tsx. It lives under client/src so Tailwind's content
// scan (client/src only) generates its classes. The 404 renders outside the
// site shell (no header/footer), so it carries its own way home.
const popular: readonly {
  readonly href: string;
  readonly icon: ServiceIconName;
  readonly label: string;
}[] = [
  { href: "/schedule#appointment", icon: "calendar", label: "Request an appointment" },
  { href: "/services", icon: "tooth", label: "Dental services" },
  { href: "/patient-resources", icon: "forms", label: "New patients & forms" },
  { href: "/insurance", icon: "insurance", label: "Insurance & payment" },
  { href: "/emergency-dental", icon: "emergency", label: "Emergency dentist" },
  { href: "/contact", icon: "checkup", label: "Contact & hours" },
];

const NotFoundPanel = () => {
  return (
    <main className="paper min-h-screen w-full">
      <SeasonFallback />
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-3 self-start rounded-full pr-3 text-evergreen-800 outline-none focus-visible:shadow-[var(--ui-focus-shadow)]"
        >
          <LogoMark className="h-9 w-9" />
          <span className="font-heading text-lg font-medium text-ink">{officeInfo.name}</span>
        </Link>

        <div className="flex flex-1 items-center py-10">
          <div className="card w-full p-6 text-center sm:p-10">
            {/* October seasonal art (AGENTS.md "Seasonal layer (October)"): a
                ghost-tooth floating in front of a harvest moon. */}
            <div aria-hidden="true" className="cw-season-only mb-8">
              <div className="cw-porthole mx-auto grid h-36 w-36 place-items-center overflow-hidden rounded-full shadow-xl ring-4 ring-white">
                <span className="cw-art cw-art-ghost cw-ghost-float w-16" />
              </div>
            </div>
            <p className="eyebrow justify-center">Error 404</p>
            <h1 className="h-display mt-4 text-balance text-[2.2rem] sm:text-[3rem]">
              We can&apos;t find <em>that page</em>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
              The link may be old or mistyped. Try one of these, or call the office if you need help scheduling.
            </p>

            <nav aria-label="Popular pages" className="mt-8">
              <ul className="grid gap-2 text-left sm:grid-cols-2">
                {popular.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex min-h-14 items-center gap-3 rounded-2xl border border-cream-300/80 bg-cream-50 px-4 py-2.5 font-semibold text-ink outline-none transition-colors hover:border-evergreen-200 hover:bg-white focus-visible:shadow-[var(--ui-focus-shadow)]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                        <ServiceIcon name={item.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">{item.label}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-evergreen-600 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="btn btn-primary">
                <Home aria-hidden="true" />
                Back to homepage
              </Link>
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="btn btn-outline"
                aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              >
                <Phone aria-hidden="true" />
                {officeInfo.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPanel;
