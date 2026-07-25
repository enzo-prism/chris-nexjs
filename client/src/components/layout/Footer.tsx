"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Mail, ArrowRight, Instagram, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { officeInfo } from "@/lib/data";
import type { ChromeVariant } from "@/lib/chrome";
import ButtonLink from "@/components/common/ButtonLink";
import { cn } from "@/lib/utils";

type FooterProps = {
  readonly variant?: ChromeVariant;
};

const Footer = ({ variant = "default" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname() || "/";
  const isActive = (href: string) => pathname === href;

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "Dr. Wong" },
    { href: "/services", label: "Services" },
    { href: "/patient-resources", label: "Patient Resources" },
    { href: "/insurance", label: "Insurance & Payments" },
    { href: "/patient-stories", label: "Patient Stories" },
    { href: "/gallery", label: "Gallery" },
    { href: "/office-tour", label: "Office Tour" },
    { href: "/blog", label: "Blog" },
    { href: "/dentist-menlo-park", label: "Menlo Park Families" },
    { href: "/dentist-stanford", label: "Stanford Patients" },
    { href: "/dentist-mountain-view", label: "Mountain View Families" },
    { href: "/locations", label: "All Locations" },
    { href: "/contact", label: "Contact" },
  ];

  const internalLinks = [{ href: "/changelog", label: "Changelog" }];

  const services = [
    { href: "/preventive-dentistry", label: "Preventive Dentistry" },
    { href: "/invisalign", label: "Invisalign®" },
    { href: "/dental-veneers", label: "Cosmetic Dentistry" },
    { href: "/teeth-whitening-palo-alto", label: "Teeth Whitening" },
    { href: "/restorative-dentistry", label: "Restorative Dentistry" },
    { href: "/pediatric-dentistry", label: "Pediatric Dentistry" },
    { href: "/dental-implants", label: "Dental Implants" },
    { href: "/emergency-dental", label: "Emergency Dentist" },
  ];

  const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/hipaa", label: "HIPAA Notice" },
    { href: "/accessibility", label: "Accessibility" },
  ];

  const socialMedia = [
    {
      icon: <Instagram className="h-4 w-4" />,
      href: officeInfo.socialMedia.instagram,
      label: "Instagram",
      rel: "noopener noreferrer",
    },
  ];

  const businessUrl = "https://www.chriswongdds.com";

  if (variant === "conversion") {
    return (
      <footer className="border-t border-slate-200 bg-white/95">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Christopher B. Wong, DDS
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Palo Alto dental care with thoughtful, conservative treatment.
                </p>
              </div>
              <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
                  className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-slate-700 transition-colors hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                  {officeInfo.phone}
                </a>
                <a
                  href={officeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
                  className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-slate-700 transition-colors hover:text-primary"
                >
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                  {officeInfo.address.line1}, {officeInfo.address.city}
                </a>
                <a
                  href={`mailto:${officeInfo.email}`}
                  aria-label={`Email Dr. Wong's office at ${officeInfo.email}`}
                  className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-slate-700 transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  {officeInfo.email}
                </a>
                <a
                  href={officeInfo.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-context="footer-review"
                  aria-label="Review Dr. Wong on Google (opens in a new tab)"
                  className="ui-focus-premium inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-slate-700 transition-colors hover:text-primary"
                >
                  <Star className="h-4 w-4 text-primary" aria-hidden="true" />
                  Review us on Google
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "ui-link-premium inline-flex min-h-11 items-center rounded-lg px-2 text-slate-600",
                    isActive(link.href) && "bg-slate-100 font-semibold text-primary",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Separator className="my-6 bg-slate-200" />

          <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {currentYear} Christopher B. Wong, DDS. All rights reserved.</p>
            <p>Regular privacy, HIPAA, and accessibility details remain available site-wide.</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-primary bg-opacity-95 text-white">
      <div className="hidden py-12 md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            <div itemScope itemType="https://schema.org/Dentist">
              <meta itemProp="url" content={businessUrl} />
              <h3 className="text-lg font-medium tracking-tight mb-4" itemProp="name">
                Dr. Christopher B. Wong
              </h3>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Comprehensive dental care in a comfortable, state-of-the-art environment.
              </p>
              <div className="space-y-4">
                <p className="flex items-center text-sm text-white/90">
                  <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" aria-hidden="true" />
                  <a
                    href={`tel:${officeInfo.phoneE164}`}
                    className="ui-link-premium-dark px-1 py-0.5 text-white/90"
                    itemProp="telephone"
                    aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
                  >
                    {officeInfo.phone}
                  </a>
                </p>

                <p className="flex items-center text-sm text-white/90">
                  <Mail className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" aria-hidden="true" />
                  <a
                    href={`mailto:${officeInfo.email}`}
                    className="ui-link-premium-dark break-all px-1 py-0.5 text-white/90"
                    itemProp="email"
                    aria-label={`Email Dr. Wong's office at ${officeInfo.email}`}
                  >
                    {officeInfo.email}
                  </a>
                </p>

                <div className="flex items-start text-sm text-white/90">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0 text-white/70" aria-hidden="true" />
                  <address
                    className="not-italic"
                    itemProp="address"
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                  >
                    <a
                      href={officeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ui-link-premium-dark inline-block rounded px-1 py-0.5 text-white/90"
                      aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
                    >
                      <span itemProp="streetAddress">{officeInfo.address.line1}</span>
                      <br />
                      <span>
                        <span itemProp="addressLocality">{officeInfo.address.city}</span>,{" "}
                        <span itemProp="addressRegion">{officeInfo.address.region}</span>{" "}
                        <span itemProp="postalCode">{officeInfo.address.postalCode}</span>
                      </span>
                    </a>
                    <meta itemProp="addressCountry" content={officeInfo.address.country} />
                  </address>
                </div>
                <div className="flex space-x-2 mt-3">
                  {socialMedia.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      className="ui-link-premium-dark inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80"
                      aria-label={`Visit Dr. Wong on ${social.label} (opens in a new tab)`}
                      rel="noopener noreferrer"
                      target="_blank"
                      itemProp="sameAs"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
                <ButtonLink
                  href="/schedule#appointment"
                  aria-label="Request an appointment"
                  className="mt-5 min-h-11 rounded-full border border-white/25 bg-white px-5 text-primary hover:bg-blue-50"
                >
                  Request Appointment
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4 font-medium">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href} className="text-sm text-white/80">
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        "group inline-flex items-center rounded-md px-2 py-1 ui-link-premium-dark text-white/80",
                        isActive(link.href) && "bg-white/10 font-semibold text-white",
                      )}
                    >
                      <span>{link.label}</span>
                      <ArrowRight
                        className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4 font-medium">Services</h3>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service.href} className="text-sm text-white/80">
                    <Link
                      href={service.href}
                      aria-current={isActive(service.href) ? "page" : undefined}
                      className={cn(
                        "rounded-md px-2 py-1 ui-link-premium-dark text-white/80",
                        isActive(service.href) && "bg-white/10 font-semibold text-white",
                      )}
                    >
                      {service.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-white/20" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-xs text-white/70">&copy; {currentYear} Christopher B. Wong, DDS. All rights reserved.</p>
              <p className="text-xs text-white/50 mt-1">
                Invisalign®, the Invisalign® logo, iTero™, and Vivera™ are trademarks of Align Technology, Inc. and are registered in the U.S. and other countries.
              </p>
              <p className="text-xs text-white/50 mt-1">
                website built by{" "}
                <a
                  href="https://www.design-prism.com/case-studies/dr-christopher-wong?utm_source=drwong&utm_medium=referral&utm_campaign=drwong_2025-07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-link-premium-dark px-1 py-0.5 text-white/70"
                >
                  Prism in silicon valley
                </a>
              </p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "ui-link-premium-dark rounded px-1 py-0.5 text-xs text-white/70",
                    isActive(link.href) && "font-semibold text-white",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {internalLinks.length > 0 ? (
              <div className="mt-4 md:mt-0 flex flex-wrap items-center justify-center md:justify-end gap-2 text-[10px]">
                {internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className="ui-link-premium-dark px-1 py-0.5 text-white/30"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="py-8 md:hidden">
        <div className="max-w-md mx-auto px-5">
          <div className="text-center mb-8" itemScope itemType="https://schema.org/Dentist">
            <meta itemProp="url" content={businessUrl} />
            <h3 className="text-lg font-medium mb-2" itemProp="name">Dr. Christopher B. Wong</h3>
            <p className="text-sm text-white/80 mb-4">Comprehensive dental care in Palo Alto</p>

            <div className="flex justify-center space-x-2 mb-4">
              {socialMedia.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  className="ui-link-premium-dark inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80"
                  aria-label={`Visit Dr. Wong on ${social.label} (opens in a new tab)`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-white/10 p-2">
            <div className="space-y-1">
              <a
                href={`tel:${officeInfo.phoneE164}`}
                className="ui-focus-premium flex min-h-11 items-center rounded-lg px-3 text-sm text-white/90 hover:bg-white/10"
                itemProp="telephone"
                aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              >
                <Phone className="mr-3 h-4 w-4 flex-shrink-0 text-white/70" aria-hidden="true" />
                {officeInfo.phone}
              </a>

              <a
                href={`mailto:${officeInfo.email}`}
                className="ui-focus-premium flex min-h-11 items-center rounded-lg px-3 text-sm text-white/90 hover:bg-white/10"
                itemProp="email"
                aria-label={`Email Dr. Wong's office at ${officeInfo.email}`}
              >
                <Mail className="mr-3 h-4 w-4 flex-shrink-0 text-white/70" aria-hidden="true" />
                <span className="break-all">{officeInfo.email}</span>
              </a>

              <address
                className="not-italic"
                itemProp="address"
                itemScope
                itemType="https://schema.org/PostalAddress"
              >
                <a
                  href={officeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-focus-premium flex min-h-11 items-start rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                  aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
                >
                  <MapPin className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-white/70" aria-hidden="true" />
                  <span>
                    <span itemProp="streetAddress">{officeInfo.address.line1}</span>
                    <br />
                    <span itemProp="addressLocality">{officeInfo.address.city}</span>,{" "}
                    <span itemProp="addressRegion">{officeInfo.address.region}</span>{" "}
                    <span itemProp="postalCode">{officeInfo.address.postalCode}</span>
                  </span>
                </a>
                <meta itemProp="addressCountry" content={officeInfo.address.country} />
              </address>
            </div>
          </div>

          <Accordion type="single" collapsible className="mb-8">
            <AccordionItem value="quick-links" className="border-white/20">
              <AccordionTrigger className="text-sm py-3 text-white hover:text-white">
                Quick Links
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-2">
                  {quickLinks.map((link) => (
                    <li key={link.href} className="text-sm text-white/80">
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "ui-focus-premium flex min-h-11 items-center rounded-lg px-3 text-white/80 hover:bg-white/10",
                          isActive(link.href) && "bg-white/10 font-semibold text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="services" className="border-white/20">
              <AccordionTrigger className="text-sm py-3 text-white hover:text-white">
                Our Services
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 py-2 pl-2">
                  {services.map((service) => (
                    <li key={service.href} className="text-sm text-white/80">
                      <Link
                        href={service.href}
                        aria-current={isActive(service.href) ? "page" : undefined}
                        className={cn(
                          "ui-focus-premium flex min-h-11 items-center rounded-lg px-3 text-white/80 hover:bg-white/10",
                          isActive(service.href) && "bg-white/10 font-semibold text-white",
                        )}
                      >
                        {service.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="bg-white/20 mb-6" />

          <div className="text-center">
            <p className="text-xs text-white/70 mb-2">&copy; {currentYear} Christopher B. Wong, DDS. All rights reserved.</p>
            <p className="text-xs text-white/50 mb-2">
              Invisalign®, the Invisalign® logo, iTero™, and Vivera™ are trademarks of Align Technology, Inc. and are registered in the U.S. and other countries.
            </p>
            <p className="text-xs text-white/50 mb-4">
              website built by{" "}
              <a
                href="https://www.design-prism.com/case-studies/dr-christopher-wong?utm_source=drwong&utm_medium=referral&utm_campaign=drwong_2025-07"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-link-premium-dark px-1 py-0.5 text-white/70"
              >
                Prism in silicon valley
              </a>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "ui-focus-premium inline-flex min-h-11 items-center rounded-lg px-2 text-xs text-white/70",
                    isActive(link.href) && "bg-white/10 font-semibold text-white",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {internalLinks.length > 0 ? (
              <p className="mt-3 text-[10px] text-white/30">
                <Link
                  href={internalLinks[0].href}
                  className="ui-link-premium-dark px-1 py-0.5 text-white/30"
                >
                  {internalLinks[0].label}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
