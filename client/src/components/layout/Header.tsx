"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock,
  Instagram,
  MapPin,
  Menu,
  Phone,
  Star,
  X,
} from "lucide-react";

import { officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { ChromeVariant } from "@/lib/chrome";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ds/LogoMark";
import { ServiceIcon } from "@/components/ds/ServiceIcon";
import {
  aboutLinks,
  careFinder,
  patientLinks,
  reviewLinks,
  serviceGroups,
  type NavItem,
} from "@/data/siteNav";
import { GOOGLE_REVIEW_COUNT } from "@shared/reviewStats";

type MenuId = "services" | "about" | "patients";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/** "Open today 8:00 AM – 5:00 PM" in Palo Alto time; computed after mount. */
function useTodayHours(): string | null {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    try {
      const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "America/Los_Angeles",
      })
        .format(new Date())
        .toLowerCase() as (typeof DAY_KEYS)[number];
      const hours = officeInfo.hours[weekday as keyof typeof officeInfo.hours];
      setLabel(hours && hours !== "Closed" ? `Today ${hours.replace(" - ", "–")}` : "Closed today");
    } catch {
      setLabel(null);
    }
  }, []);
  return label;
}

function Wordmark({ compact = false }: { readonly compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <LogoMark className={cn("shrink-0 text-evergreen-800", compact ? "h-8 w-8 min-[400px]:h-9 min-[400px]:w-9" : "h-11 w-11")} />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "truncate font-heading font-medium tracking-[-0.01em] text-ink",
            compact ? "text-[1rem] min-[400px]:text-[1.06rem]" : "text-[1.3rem]",
          )}
        >
          Christopher B. Wong, DDS
        </span>
        <span
          className={cn(
            "mt-1 truncate font-semibold uppercase tracking-[0.18em] text-evergreen-600",
            compact ? "text-[0.6rem]" : "text-[0.66rem]",
          )}
        >
          {compact ? "Palo Alto Dentistry" : "Family & Cosmetic Dentistry · Palo Alto"}
        </span>
      </span>
    </span>
  );
}

type HeaderProps = {
  readonly variant?: ChromeVariant;
};

const Header = ({ variant = "default" }: HeaderProps) => {
  const pathname = usePathname() || "/";
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const todayHours = useTodayHours();
  const navRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number>(0);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href;
  const groupActive = (items: readonly NavItem[]) => items.some((i) => isActive(i.href.split("#")[0]));

  // Close menus on navigation.
  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Desktop: click outside / Escape closes the open dropdown.
  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const trigger = document.getElementById(`nav-trigger-${openMenu}`);
        setOpenMenu(null);
        trigger?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  // Mobile menu: lock scroll, focus the panel, Escape closes.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileMenuOpen]);

  const closeMobile = useCallback(() => {
    setMobileMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    // Only elements that can really take focus right now: links inside a
    // closed <details> are skipped (Chrome still gives them layout boxes, so
    // getClientRects() alone can't tell), and <summary> toggles are included.
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) =>
      typeof el.checkVisibility === "function"
        ? el.checkVisibility()
        : el.getClientRects().length > 0,
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const hoverOpen = (id: MenuId) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenMenu(id), 90);
  };
  const hoverClose = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenMenu(null), 180);
  };

  const phoneHref = `tel:${officeInfo.phoneE164}`;

  if (variant === "conversion") {
    return (
      <header className="sticky top-0 z-[100] border-b border-cream-300/80 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="ui-focus-premium min-w-0 rounded-xl"
            aria-label="Christopher B. Wong, DDS home"
          >
            <Wordmark compact />
          </Link>
          <a
            href={phoneHref}
            aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
            className="btn btn-primary btn-sm shrink-0"
          >
            <Phone aria-hidden="true" />
            <span className="sm:hidden">Call</span>
            <span className="hidden sm:inline">{officeInfo.phone}</span>
          </a>
        </div>
      </header>
    );
  }

  const triggerClass = (active: boolean, open: boolean) =>
    cn(
      "relative inline-flex h-11 items-center gap-1 rounded-full px-3.5 py-0 text-[15px] font-semibold text-ink-soft outline-none transition-colors hover:bg-evergreen-50 hover:text-evergreen-900 focus-visible:ring-2 focus-visible:ring-evergreen-500 active:bg-evergreen-50 xl:px-4",
      (active || open) && "text-evergreen-900",
      open && "bg-evergreen-50",
    );

  const dropdown = (id: MenuId, label: string, items: readonly NavItem[], width = "w-[23rem]") => {
    const open = openMenu === id;
    return (
      <li
        className="relative"
        onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen(id)}
        onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
      >
        <Button
          type="button"
          variant="ghost"
          id={`nav-trigger-${id}`}
          aria-expanded={open}
          aria-controls={`nav-panel-${id}`}
          onClick={() => setOpenMenu(open ? null : id)}
          className={triggerClass(groupActive(items), open)}
        >
          {label}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
            aria-hidden="true"
          />
          {groupActive(items) ? (
            <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gold-500" aria-hidden="true" />
          ) : null}
        </Button>
        <div
          id={`nav-panel-${id}`}
          hidden={!open}
          className={cn(
            "absolute left-1/2 top-full z-10 -translate-x-1/2 pt-3",
            width,
          )}
        >
          <ul className="card overflow-hidden p-2 [animation:rooted-rise_.28s_var(--fx-ease)_both]">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="group flex items-start gap-3 rounded-2xl px-4 py-3 outline-none transition-colors hover:bg-cream-100 focus-visible:bg-cream-100 focus-visible:ring-2 focus-visible:ring-evergreen-500 aria-[current=page]:bg-evergreen-50"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink group-hover:text-evergreen-800">
                      {item.label}
                    </span>
                    {item.blurb ? (
                      <span className="mt-0.5 block text-sm text-ink-muted">{item.blurb}</span>
                    ) : null}
                  </span>
                  <ArrowRight
                    className="ml-auto mt-1 h-4 w-4 shrink-0 text-evergreen-500 opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  };

  const servicesOpen = openMenu === "services";
  const allServiceItems = serviceGroups.flatMap((g) => g.items);

  return (
    <header
      // Sticky at -40px on desktop so the utility bar scrolls away and only
      // the 76px main bar stays pinned.
      className="sticky top-0 z-[100] lg:-top-10"
      data-cw-quiet
    >
      {/* Utility bar (desktop) */}
      <div className="hidden bg-evergreen-900 text-cream-100 lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-6 px-8 text-[13px]">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5 font-semibold text-gold-200">
              <span className="cw-season-only cw-art cw-art-pumpkin h-4 w-4" aria-hidden="true" />
              New patients welcome
            </span>
            <a
              href={officeInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm text-cream-100/85 hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
              aria-label={`Directions to ${officeInfo.address.line1}, ${officeInfo.address.city} (opens in a new tab)`}
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {officeInfo.address.line1}, {officeInfo.address.city}
            </a>
            <span className="inline-flex min-w-[9.5rem] items-center gap-1.5 text-cream-100/85">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {todayHours ?? "Mon–Fri, by appointment"}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-1.5 rounded-sm text-cream-100/85 hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
            >
              <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" aria-hidden="true" />
              {GOOGLE_REVIEW_COUNT} five-star Google reviews
            </Link>
            <a
              href={officeInfo.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dr. Wong’s office on Instagram (opens in a new tab)"
              className="rounded-sm text-cream-100/85 hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-300"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        ref={navRef}
        className={cn(
          "relative border-b bg-cream-50/90 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,border-color] duration-300",
          scrolled || openMenu ? "border-cream-300/80 shadow-[0_10px_30px_-24px_rgba(11,42,33,0.45)]" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.75rem] lg:px-8">
          <Link
            href="/"
            className="ui-focus-premium -ml-1 min-w-0 rounded-2xl p-1"
            aria-label="Christopher B. Wong, DDS home"
          >
            <span className="lg:hidden">
              <Wordmark compact />
            </span>
            <span className="hidden lg:block">
              <Wordmark />
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-0.5">
              <li
                onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen("services")}
                onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
              >
                <Button
                  type="button"
                  variant="ghost"
                  id="nav-trigger-services"
                  aria-expanded={servicesOpen}
                  aria-controls="nav-panel-services"
                  onClick={() => setOpenMenu(servicesOpen ? null : "services")}
                  className={triggerClass(groupActive(allServiceItems) || isActive("/services"), servicesOpen)}
                >
                  Services
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform duration-200", servicesOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </Button>
                {/* Mega menu spans the bar width */}
                <div
                  id="nav-panel-services"
                  hidden={!servicesOpen}
                  className="absolute inset-x-0 top-full z-10 px-8 pt-2"
                >
                  <div className="card mx-auto grid max-w-7xl grid-cols-[1fr_1fr_1fr_17rem] gap-2 p-3 [animation:rooted-rise_.3s_var(--fx-ease)_both]">
                    {serviceGroups.filter((g) => g.title !== "Urgent").map((group) => (
                      <div key={group.title} className="p-2">
                        <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                          {group.title}
                        </p>
                        <ul>
                          {group.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                aria-current={isActive(item.href) ? "page" : undefined}
                                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 outline-none transition-colors hover:bg-cream-100 focus-visible:bg-cream-100 focus-visible:ring-2 focus-visible:ring-evergreen-500 aria-[current=page]:bg-evergreen-50"
                              >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                                  {item.icon ? <ServiceIcon name={item.icon} className="h-6 w-6" /> : null}
                                </span>
                                <span className="min-w-0">
                                  <span className="block font-semibold leading-tight text-ink">{item.label}</span>
                                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">
                                    {item.blurb}
                                  </span>
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="surface-evergreen on-dark flex flex-col justify-between rounded-[1.4rem] p-5">
                      <Link
                        href="/emergency-dental"
                        aria-current={isActive("/emergency-dental") ? "page" : undefined}
                        className="group mb-5 flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3 outline-none ring-gold-300 transition-colors hover:bg-white/[0.12] focus-visible:ring-2"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pumpkin-500/20 text-pumpkin-300">
                          <ServiceIcon name="emergency" className="h-6 w-6" />
                        </span>
                        <span>
                          <span className="block font-semibold text-cream-50">Dental pain?</span>
                          <span className="block text-[13px] text-evergreen-100">Emergency dentist — call us</span>
                        </span>
                      </Link>
                      <div>
                        <p className="eyebrow eyebrow-light">Not sure where to start?</p>
                        <p className="mt-3 font-heading text-[1.35rem] leading-snug text-cream-50">
                          Begin with a <em className="text-gold-300">relaxed</em> new-patient exam.
                        </p>
                        <p className="mt-2 text-sm text-evergreen-100">
                          Dr. Wong explains what he sees before recommending anything.
                        </p>
                      </div>
                      <div className="mt-5 flex flex-col gap-2">
                        <Link href="/schedule#appointment" className="btn btn-gold btn-sm">
                          <CalendarDays aria-hidden="true" />
                          Request a visit
                        </Link>
                        <Link href="/services" className="btn btn-outline-light btn-sm">
                          All services
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              {dropdown("about", "About", aboutLinks)}
              <li>
                <Link
                  href="/testimonials"
                  aria-current={isActive("/testimonials") ? "page" : undefined}
                  className={triggerClass(groupActive(reviewLinks), false)}
                >
                  Reviews
                </Link>
              </li>
              {dropdown("patients", "Patients", patientLinks)}
              <li>
                <Link
                  href="/contact"
                  aria-current={isActive("/contact") ? "page" : undefined}
                  className={triggerClass(isActive("/contact"), false)}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <a
              href={phoneHref}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              data-analytics-context="header-call"
              className="hidden h-11 items-center gap-2 rounded-full px-3 text-[15px] font-semibold text-evergreen-800 transition-colors hover:bg-evergreen-50 xl:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {officeInfo.phone}
            </a>
            <Link
              href="/schedule#appointment"
              className="btn btn-primary btn-sm hidden sm:inline-flex"
              data-analytics-context="header-book"
            >
              <CalendarDays aria-hidden="true" />
              Request a visit
            </Link>
            <a
              href={phoneHref}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              data-analytics-context="header-call-mobile"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-evergreen-800/15 bg-white text-evergreen-800 lg:hidden"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
            </a>
            <Button
              ref={menuButtonRef}
              type="button"
              variant="ghost"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-haspopup="dialog"
              className="h-11 min-w-11 gap-2 rounded-full bg-evergreen-800 px-3 text-[15px] min-[400px]:px-4 font-semibold text-cream-50 hover:bg-evergreen-700 hover:text-cream-50 active:bg-evergreen-700 active:text-cream-50 lg:hidden [&_svg]:size-5"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="hidden min-[400px]:inline">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onKeyDown={trapFocus}
          className="fixed inset-0 z-[120] flex flex-col bg-cream-50 lg:hidden [animation:rooted-fade_.2s_ease-out_both]"
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-cream-300/80 px-4 sm:px-6">
            <Link href="/" className="min-w-0 rounded-2xl" onClick={closeMobile} aria-label="Christopher B. Wong, DDS home">
              <Wordmark compact />
            </Link>
            <Button
              type="button"
              variant="ghost"
              onClick={closeMobile}
              data-autofocus
              aria-label="Close navigation menu"
              className="h-11 w-11 shrink-0 rounded-full border border-evergreen-800/15 bg-white p-0 text-evergreen-900 [&_svg]:size-5"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <div
            className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 sm:px-6"
          >
            <div className="grid grid-cols-3 gap-2.5 [animation:rooted-rise_.35s_var(--fx-ease)_both]">
              <Link
                href="/schedule#appointment"
                onClick={closeMobile}
                className="flex min-h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl bg-evergreen-800 px-2 text-center text-sm font-semibold text-cream-50"
              >
                <CalendarDays className="h-6 w-6 text-gold-300" aria-hidden="true" />
                Request a visit
              </Link>
              <a
                href={phoneHref}
                className="flex min-h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white px-2 text-center text-sm font-semibold text-ink"
                aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
                data-analytics-context="mobile-menu-call"
              >
                <Phone className="h-6 w-6 text-evergreen-600" aria-hidden="true" />
                Call
              </a>
              <a
                href={officeInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white px-2 text-center text-sm font-semibold text-ink"
                aria-label="Directions to the office (opens in a new tab)"
              >
                <MapPin className="h-6 w-6 text-evergreen-600" aria-hidden="true" />
                Directions
              </a>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              What brings you in?
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2.5">
              {careFinder.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex h-full min-h-[4.5rem] items-center gap-2.5 rounded-2xl border border-cream-300 bg-white p-3 text-[14px] font-semibold leading-tight text-ink aria-[current=page]:border-evergreen-500 aria-[current=page]:bg-evergreen-50"
                  >
                    <ServiceIcon name={item.icon} className="h-7 w-7 shrink-0 text-evergreen-600" animated={false} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <MobileGroup title="All services" items={serviceGroups.flatMap((g) => g.items)} onNavigate={closeMobile} isActive={isActive} extra={{ href: "/services", label: "Services overview" }} />
            <MobileGroup title="About the practice" items={aboutLinks} onNavigate={closeMobile} isActive={isActive} />
            <MobileGroup title="Reviews" items={reviewLinks} onNavigate={closeMobile} isActive={isActive} />
            <MobileGroup title="Patients" items={patientLinks} onNavigate={closeMobile} isActive={isActive} extra={{ href: "/contact", label: "Contact & hours" }} />

            <div className="mt-8 rounded-2xl bg-evergreen-900 p-5 text-cream-100">
              <p className="font-heading text-lg text-cream-50">{officeInfo.address.line1}</p>
              <p className="text-sm text-evergreen-100">{officeInfo.address.line2}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-evergreen-100">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {todayHours ?? "Mon–Fri, by appointment"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

function MobileGroup({
  title,
  items,
  onNavigate,
  isActive,
  extra,
}: {
  readonly title: string;
  readonly items: readonly NavItem[];
  readonly onNavigate: () => void;
  readonly isActive: (href: string) => boolean;
  readonly extra?: NavItem;
}) {
  const list = extra ? [...items, extra] : items;
  const containsCurrent = list.some((item) => isActive(item.href));
  return (
    <details className="faq-item group mt-3 rounded-2xl border border-cream-300 bg-white" open={containsCurrent}>
      <summary className="flex min-h-14 cursor-pointer items-center justify-between px-4 text-base font-semibold text-ink">
        {title}
        <ChevronDown className="h-5 w-5 text-ink-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ul className="border-t border-cream-200 px-2 py-2">
        {list.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 text-[15px] text-ink-soft aria-[current=page]:bg-evergreen-50 aria-[current=page]:font-semibold aria-[current=page]:text-evergreen-900"
            >
              {item.label}
              <ArrowRight className="h-4 w-4 text-evergreen-500" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default Header;
