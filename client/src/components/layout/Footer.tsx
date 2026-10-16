"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Instagram, Mail, MapPin, Phone, Star } from "lucide-react";

import { officeInfo } from "@/lib/data";
import type { ChromeVariant } from "@/lib/chrome";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ds/LogoMark";
import { aboutLinks, allServices, patientLinks, reviewLinks } from "@/data/siteNav";

type FooterProps = {
  readonly variant?: ChromeVariant;
};

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/hipaa", label: "HIPAA Notice" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/changelog", label: "Site updates" },
] as const;

// Nearby-community pages stay one click from every page (internal-link audit).
const nearbyLinks = [
  { href: "/dentist-menlo-park", label: "Menlo Park" },
  { href: "/dentist-stanford", label: "Stanford" },
  { href: "/dentist-mountain-view", label: "Mountain View" },
  { href: "/locations", label: "All nearby areas" },
] as const;

const practiceLinks = [
  ...aboutLinks.filter((l) => !l.href.includes("#")),
  ...reviewLinks,
  { href: "/about#team", label: "Our team" },
] as const;

const dayRows = [
  ["Mon", "monday"],
  ["Tue", "tuesday"],
  ["Wed", "wednesday"],
  ["Thu", "thursday"],
  ["Fri", "friday"],
  ["Sat–Sun", "saturday"],
] as const;

// The October greeting is drawn in CSS by `cw-season-footer` (app/globals.css).
// Urgent-care, legal, and post-conversion pages opt out via data-cw-quiet.
const QUIET_PATHS = /^\/(emergency-dental|thank-you|privacy-policy|hipaa|terms|accessibility)\/?$/;

const Footer = ({ variant = "default" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname() || "/";
  const isActive = (href: string) => pathname === href;

  const linkClass =
    "inline-flex min-h-10 items-center rounded-md text-[15px] text-evergreen-100/85 transition-colors hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300 aria-[current=page]:text-gold-200";

  if (variant === "conversion") {
    return (
      <footer className="border-t border-cream-300/80 bg-cream-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`tel:${officeInfo.phoneE164}`}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-evergreen-800"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {officeInfo.phone}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-evergreen-600" aria-hidden="true" />
              {officeInfo.address.line1}, {officeInfo.address.city}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {legalLinks.slice(0, 4).map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center hover:text-evergreen-800">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-ink-muted">
          &copy; {currentYear} Christopher B. Wong, DDS
        </p>
      </footer>
    );
  }

  return (
    <footer
      className="cw-season-footer on-dark relative isolate overflow-hidden bg-evergreen-900 text-cream-100"
      data-cw-quiet={QUIET_PATHS.test(pathname) || undefined}
    >
      {/* Redwoods on the footer's top edge with their root network glowing below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] bg-[url('/brand/roots-glow.svg')] bg-[length:1440px_360px] bg-[position:center_-128px] bg-no-repeat opacity-60 sm:bg-[length:1800px_450px] sm:bg-[position:center_-160px]"
      />
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-transparent via-evergreen-900/70 to-evergreen-950" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-40 sm:px-6 sm:pt-48 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-gold-300" aria-label="Christopher B. Wong, DDS home">
              <LogoMark className="h-12 w-12 text-cream-50" />
              <span className="font-heading text-2xl text-cream-50">Christopher B. Wong, DDS</span>
            </Link>
            <p className="mt-5 max-w-sm text-pretty text-[15px] leading-7 text-evergreen-100/85">
              Unhurried family and cosmetic dentistry on Cambridge Avenue,
              caring for Palo Alto families from first visits to lifelong smiles.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/schedule#appointment" className="btn btn-gold" data-analytics-context="footer-book">
                <CalendarDays aria-hidden="true" />
                Request a visit
              </Link>
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="btn btn-outline-light"
                aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
                data-analytics-context="footer-call"
              >
                <Phone aria-hidden="true" />
                {officeInfo.phone}
              </a>
            </div>

            <address className="mt-8 grid gap-3 text-[15px] not-italic text-evergreen-100/90">
              <a
                href={officeInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-3 rounded-md hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
                aria-label={`Get directions to ${officeInfo.address.line1}, ${officeInfo.address.line2} (opens in a new tab)`}
              >
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                <span>
                  {officeInfo.address.line1}
                  <br />
                  {officeInfo.address.line2}
                </span>
              </a>
              <a
                href={`mailto:${officeInfo.email}`}
                className="inline-flex items-center gap-3 rounded-md hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
              >
                <Mail className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                {officeInfo.email}
              </a>
            </address>

            <dl className="mt-8 grid max-w-xs grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              {dayRows.map(([label, key]) => (
                <div key={key} className="contents">
                  <dt className="font-semibold text-cream-50">{label}</dt>
                  <dd className="text-evergreen-100/85">{officeInfo.hours[key]}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
            <nav aria-label="Services">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Services</h2>
              <ul className="mt-4 space-y-0.5">
                {allServices.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} aria-current={isActive(s.href) ? "page" : undefined} className={linkClass}>
                      {s.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/services" aria-current={isActive("/services") ? "page" : undefined} className={cn(linkClass, "font-semibold text-cream-50")}>
                    All services
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="The practice">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">The practice</h2>
              <ul className="mt-4 space-y-0.5">
                {practiceLinks.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} aria-current={isActive(s.href) ? "page" : undefined} className={linkClass}>
                      {s.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/contact" aria-current={isActive("/contact") ? "page" : undefined} className={linkClass}>
                    Contact &amp; hours
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-1 md:grid-cols-1">
              <nav aria-label="Patients">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Patients</h2>
                <ul className="mt-4 space-y-0.5">
                  {patientLinks.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} aria-current={isActive(s.href) ? "page" : undefined} className={linkClass}>
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Nearby communities">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Nearby</h2>
                <ul className="mt-4 space-y-0.5">
                  {nearbyLinks.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} aria-current={isActive(s.href) ? "page" : undefined} className={linkClass}>
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={officeInfo.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-context="footer-review"
              className="pill min-h-11 hover:border-gold-300/50 hover:text-cream-50"
              aria-label="Leave a Google review (opens in a new tab)"
            >
              <Star className="h-4 w-4 fill-gold-400 text-gold-400" aria-hidden="true" />
              Leave a Google review
            </a>
            <a
              href={officeInfo.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="pill min-h-11 hover:border-gold-300/50 hover:text-cream-50"
              aria-label="Instagram (opens in a new tab)"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Instagram
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center text-evergreen-100/70 hover:text-cream-50 aria-[current=page]:text-gold-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-xs text-evergreen-100/55">
          &copy; {currentYear} Christopher B. Wong, DDS · Family &amp; cosmetic dentistry in Palo Alto, CA
        </p>
      </div>
    </footer>
  );
};

export default Footer;
