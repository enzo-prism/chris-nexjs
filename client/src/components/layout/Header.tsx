import {
  useState,
  useEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  MapPin,
  ChevronDown,
  Clock,
  ArrowRight,
  Instagram,
} from "lucide-react";
import { officeInfo } from "@/lib/data";
import HolidayHoursNotice from "@/components/common/HolidayHoursNotice";
import ButtonLink from "@/components/common/ButtonLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavChild = {
  readonly href: string;
  readonly label: string;
};

type NavLink = {
  readonly href: string;
  readonly label: string;
  readonly submenu?: readonly NavChild[];
};

const navLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  {
    href: "/services",
    label: "Services",
    submenu: [
      { href: "/invisalign", label: "Invisalign" },
      { href: "/dental-veneers", label: "Cosmetic Dentistry (Veneers)" },
      { href: "/teeth-whitening-palo-alto", label: "Teeth Whitening" },
      { href: "/zoom-whitening", label: "ZOOM Whitening" },
      { href: "/dental-implants", label: "Dental Implants" },
      { href: "/emergency-dental", label: "Emergency Dentist" },
      { href: "/services", label: "View All Services" },
    ],
  },
  {
    href: "/locations",
    label: "Locations",
    submenu: [
      { href: "/dentist-menlo-park", label: "Menlo Park" },
      { href: "/dentist-stanford", label: "Stanford" },
      { href: "/dentist-mountain-view", label: "Mountain View" },
      { href: "/dentist-los-altos", label: "Los Altos" },
      { href: "/dentist-los-altos-hills", label: "Los Altos Hills" },
      { href: "/dentist-sunnyvale", label: "Sunnyvale" },
      { href: "/dentist-cupertino", label: "Cupertino" },
      { href: "/dentist-redwood-city", label: "Redwood City" },
      { href: "/dentist-atherton", label: "Atherton" },
      { href: "/dentist-redwood-shores", label: "Redwood Shores" },
      { href: "/locations", label: "All Locations" },
    ],
  },
  { href: "/patient-stories", label: "Patient Stories" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

const slugifyLabel = (label: string): string =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(
    null,
  );
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navRowRef = useRef<HTMLDivElement>(null);
  const desktopClusterRef = useRef<HTMLDivElement>(null);
  const requiredRowWidthRef = useRef<number>(0);
  const baselineHeaderHeightRef = useRef<number>(0);

  const isActive = (path: string): boolean => pathname === path;
  const isParentActive = (children?: readonly NavChild[]): boolean =>
    Boolean(children?.some((child) => isActive(child.href)));

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMenus = () => {
    setMobileMenuOpen(false);
    setExpandedMenus([]);
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const closeDesktopSubmenu = () => setOpenDesktopSubmenu(null);

  // Calculate and set header height based on actual rendered size.
  // Keep a stable minimum height when the top bar collapses on scroll.
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const updateHeaderHeight = () => {
      const measuredHeight = headerEl.offsetHeight;
      if (!scrolled) {
        baselineHeaderHeightRef.current = measuredHeight;
      }
      const effectiveHeight = scrolled
        ? Math.max(measuredHeight, baselineHeaderHeightRef.current)
        : measuredHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${effectiveHeight}px`,
      );
    };

    updateHeaderHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        requestAnimationFrame(updateHeaderHeight);
      });
      observer.observe(headerEl);
    }

    window.addEventListener("resize", updateHeaderHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [scrolled]);

  // Collapse desktop nav into hamburger if it overflows available width.
  useEffect(() => {
    const rowEl = navRowRef.current;
    const clusterEl = desktopClusterRef.current;
    if (!rowEl) return;

    const updateCollapse = () => {
      const isLgUp =
        typeof window.matchMedia === "function"
          ? window.matchMedia("(min-width: 1024px)").matches
          : window.innerWidth >= 1024;
      if (!isLgUp) {
        requiredRowWidthRef.current = 0;
        if (desktopCollapsed) setDesktopCollapsed(false);
        return;
      }

      if (!desktopCollapsed) {
        requiredRowWidthRef.current = rowEl.scrollWidth;
      }

      const requiredWidth = requiredRowWidthRef.current || rowEl.scrollWidth;
      const availableWidth = rowEl.clientWidth;
      const nextCollapsed = requiredWidth > availableWidth + 8;

      if (isLgUp && !nextCollapsed && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }

      if (nextCollapsed !== desktopCollapsed) {
        setDesktopCollapsed(nextCollapsed);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateCollapse);
      });
      resizeObserver.observe(rowEl);
      if (clusterEl) {
        resizeObserver.observe(clusterEl);
      }
    }

    window.addEventListener("resize", updateCollapse);
    requestAnimationFrame(updateCollapse);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateCollapse);
    };
  }, [desktopCollapsed, mobileMenuOpen]);

  // Handle scroll effect for sticky header.
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        frame = 0;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  // Lock body scroll when mobile menu is open.
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close nav and submenus on route changes.
  useEffect(() => {
    setOpenDesktopSubmenu(null);
    setExpandedMenus([]);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global escape closes any open menu.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopSubmenu(null);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleDesktopWrapperBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      closeDesktopSubmenu();
    }
  };

  const handleDesktopTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLAnchorElement>,
    link: NavLink,
  ) => {
    if (!link.submenu?.length) return;

    const menuId = `desktop-submenu-${slugifyLabel(link.label)}`;

    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setOpenDesktopSubmenu(link.label);
      requestAnimationFrame(() => {
        const firstItem = document.querySelector<HTMLAnchorElement>(
          `#${menuId} a`,
        );
        firstItem?.focus();
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpenDesktopSubmenu(link.label);
      requestAnimationFrame(() => {
        const menu = document.getElementById(menuId);
        const items = menu?.querySelectorAll<HTMLAnchorElement>("a");
        items?.[items.length - 1]?.focus();
      });
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDesktopSubmenu();
      (event.currentTarget as HTMLAnchorElement).blur();
    }
  };

  const handleDesktopMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    triggerId: string,
  ) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closeDesktopSubmenu();
    const trigger = document.getElementById(triggerId);
    trigger?.focus();
  };

  return (
    <header
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-[100] flex flex-col isolation-auto"
    >
      <div className="relative z-[101]">
        <HolidayHoursNotice />
      </div>

      {/* Top Bar - Contact & Info */}
      <div
        className={cn(
          "relative z-[101] w-full overflow-hidden bg-[#0b1f3a] text-white/80 transition-[height,opacity] duration-300",
          scrolled
            ? "pointer-events-none h-0 opacity-0"
            : "h-10 border-b border-white/5 opacity-100",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 text-xs font-medium sm:px-6 sm:text-sm lg:px-8">
          <div className="flex items-center space-x-6">
            <a
              href={`tel:${officeInfo.phoneE164}`}
              className="group flex items-center transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f3a]"
            >
              <Phone
                className="mr-2 h-3.5 w-3.5 text-blue-200 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span>{officeInfo.phone}</span>
            </a>
            <div className="hidden items-center text-white/60 sm:flex">
              <Clock className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Mon-Thu: {officeInfo.hours.monday} · Fri: {officeInfo.hours.friday}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href={officeInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden items-center transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f3a] md:flex"
            >
              <MapPin
                className="mr-2 h-3.5 w-3.5 text-blue-200 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span>
                {officeInfo.address.line1}, {officeInfo.address.city}
              </span>
            </a>
            <a
              href={officeInfo.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f3a]"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={cn(
          "relative z-[101] w-full border-b border-slate-200 transition-[background-color,box-shadow,padding] duration-300",
          scrolled ? "bg-white py-2 shadow-lg" : "bg-white py-4",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div ref={navRowRef} className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className={cn(
                "group relative z-[102] min-w-0 shrink",
                !desktopCollapsed && "lg:shrink-0",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 transition-colors group-hover:bg-slate-50 sm:h-11 sm:w-11">
                  {!logoLoadFailed ? (
                    <img
                      src="/favicon.png"
                      alt="Christopher B. Wong, DDS logo"
                      width={256}
                      height={256}
                      className="h-full w-full object-contain p-1"
                      onError={() => setLogoLoadFailed(true)}
                    />
                  ) : (
                    <span className="font-serif text-sm font-semibold tracking-wide text-primary">
                      CW
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-serif text-sm tracking-wide text-slate-900 transition-colors group-hover:text-primary sm:text-lg lg:text-base xl:text-lg">
                    Christopher B. Wong, DDS
                  </span>
                  <span className="truncate text-[9px] uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-slate-600 sm:text-[10px] lg:hidden xl:block">
                    Cosmetic & Family Dentistry
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation + CTA */}
            <div
              ref={desktopClusterRef}
              className={cn(
                "hidden flex-shrink-0 items-center gap-4 lg:flex xl:gap-6",
                desktopCollapsed && "lg:hidden",
              )}
            >
              <nav className="relative z-[102] flex items-center gap-4 xl:gap-6 2xl:gap-8">
                {navLinks.map((link) => {
                  const hasSubmenu = Boolean(link.submenu?.length);
                  const active = isActive(link.href) || isParentActive(link.submenu);
                  const menuSlug = slugifyLabel(link.label);
                  const menuId = `desktop-submenu-${menuSlug}`;
                  const triggerId = `desktop-trigger-${menuSlug}`;

                  return (
                    <div
                      key={link.label}
                      className="group relative"
                      onMouseEnter={() => hasSubmenu && setOpenDesktopSubmenu(link.label)}
                      onMouseLeave={closeDesktopSubmenu}
                      onBlur={handleDesktopWrapperBlur}
                    >
                      <Link
                        id={triggerId}
                        href={link.href}
                        className={cn(
                          "relative z-[102] flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md py-2 text-xs font-medium tracking-wide text-slate-700 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          active && "text-primary",
                          "xl:text-sm",
                        )}
                        aria-haspopup={hasSubmenu ? "menu" : undefined}
                        aria-expanded={hasSubmenu ? openDesktopSubmenu === link.label : undefined}
                        aria-controls={hasSubmenu ? menuId : undefined}
                        onFocus={() => hasSubmenu && setOpenDesktopSubmenu(link.label)}
                        onKeyDown={(event) => handleDesktopTriggerKeyDown(event, link)}
                      >
                        {link.label}
                        {hasSubmenu && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 transition-transform duration-300",
                              openDesktopSubmenu === link.label && "-rotate-180",
                            )}
                            aria-hidden="true"
                          />
                        )}
                      </Link>

                      {active && (
                        <span className="absolute -bottom-1 left-0 right-0 z-[101] h-0.5 bg-primary" />
                      )}

                      {hasSubmenu && openDesktopSubmenu === link.label && (
                        <div
                          id={menuId}
                          role="menu"
                          aria-labelledby={triggerId}
                          className="absolute left-1/2 top-full z-[103] w-64 -translate-x-1/2 pt-4"
                          onKeyDown={(event) =>
                            handleDesktopMenuKeyDown(event, triggerId)
                          }
                        >
                          <div className="-mt-4 h-4 w-full bg-transparent" />
                          <div className="relative z-[103] overflow-hidden rounded-xl border border-white/10 bg-[#102a4a] p-2 shadow-2xl">
                            {link.submenu?.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                role="menuitem"
                                className={cn(
                                  "group/item relative z-[104] flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102a4a]",
                                  isActive(subItem.href)
                                    ? "bg-white/10 text-blue-200"
                                    : "text-white/90 hover:bg-white/5 hover:text-white",
                                )}
                                onClick={closeDesktopSubmenu}
                              >
                                <span>{subItem.label}</span>
                                <ArrowRight
                                  className={cn(
                                    "h-3 w-3 -translate-x-2 opacity-0 transition-[opacity,transform]",
                                    isActive(subItem.href)
                                      ? "translate-x-0 opacity-100"
                                      : "group-hover/item:translate-x-0 group-hover/item:opacity-100",
                                  )}
                                  aria-hidden="true"
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <ButtonLink
                href="/schedule#appointment"
                aria-label="Book Appointment"
                className="whitespace-nowrap rounded-full bg-primary px-3 text-xs font-semibold text-white shadow-[0_0_15px_rgba(59,130,246,0.35)] transition-[transform,box-shadow,background-color] duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] xl:px-6 xl:text-sm"
              >
                Book <span className="hidden xl:inline">Appointment</span>
              </ButtonLink>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className={cn(
                "relative z-50 h-auto w-auto rounded-md p-2 text-slate-900 transition-colors hover:bg-transparent hover:text-primary focus-visible:ring-primary focus-visible:ring-offset-2",
                !desktopCollapsed && "lg:hidden",
              )}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          className={cn(
            "fixed inset-0 z-40 bg-[#0b1f3a] transition-opacity duration-200",
            !desktopCollapsed && "lg:hidden",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,197,253,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(147,197,253,0.1),transparent_45%)] opacity-60"
            aria-hidden="true"
          />

          <div
            className="flex h-full flex-col overflow-y-auto px-6 pb-8"
            style={{ paddingTop: "var(--header-height)" }}
          >
            <nav className="flex-1 space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href) || isParentActive(link.submenu);
                const hasSubmenu = Boolean(link.submenu?.length);
                const submenuId = `mobile-submenu-${slugifyLabel(link.label)}`;

                return (
                  <div key={link.label}>
                    {!hasSubmenu ? (
                      <Link
                        href={link.href}
                        onClick={closeMenus}
                        className={cn(
                          "group flex items-center justify-between border-b border-white/5 py-4 font-serif text-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f3a] sm:text-2xl",
                          active ? "text-blue-200" : "text-white/80",
                        )}
                      >
                        <span className="transition-transform group-active:scale-95">
                          {link.label}
                        </span>
                        <ArrowRight
                          className={cn(
                            "h-5 w-5 -translate-x-2 opacity-0 transition-[opacity,transform]",
                            active
                              ? "translate-x-0 opacity-100"
                              : "group-active:translate-x-0 group-active:opacity-100",
                          )}
                          aria-hidden="true"
                        />
                      </Link>
                    ) : (
                      <div className="border-b border-white/5">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => toggleSubmenu(link.label)}
                          className={cn(
                            "group flex h-auto w-full items-center justify-between bg-transparent px-0 py-4 font-serif text-xl font-medium transition-colors hover:bg-transparent focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f3a] sm:text-2xl",
                            active ? "text-blue-200" : "text-white/80",
                          )}
                          aria-expanded={expandedMenus.includes(link.label)}
                          aria-controls={submenuId}
                        >
                          <span className="transition-transform group-active:scale-95">
                            {link.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 transition-transform duration-300",
                              expandedMenus.includes(link.label)
                                ? "rotate-180 text-blue-200"
                                : "text-white/50",
                            )}
                            aria-hidden="true"
                          />
                        </Button>

                        {expandedMenus.includes(link.label) && (
                          <div id={submenuId} className="overflow-hidden">
                            <div className="mb-2 ml-1 space-y-1 border-l-2 border-blue-200/30 pb-4 pl-4">
                              {link.submenu?.map((subLink) => (
                                <Link
                                  key={subLink.href}
                                  href={subLink.href}
                                  onClick={closeMenus}
                                  className={cn(
                                    "block rounded-md px-2 py-3 text-base font-medium transition-colors active:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1f3a] sm:text-lg",
                                    isActive(subLink.href)
                                      ? "text-blue-200"
                                      : "text-white/70",
                                  )}
                                >
                                  {subLink.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="mt-8 space-y-4">
              <ButtonLink
                href="/schedule#appointment"
                onClick={closeMenus}
                className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-white transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
              >
                Book Appointment Now
              </ButtonLink>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <a
                  href={`tel:${officeInfo.phoneE164}`}
                  className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 text-white transition-colors active:bg-white/10"
                >
                  <Phone className="mb-2 h-6 w-6 text-blue-200" aria-hidden="true" />
                  <span className="text-sm font-medium">Call Us</span>
                </a>
                <a
                  href={officeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 p-4 text-white transition-colors active:bg-white/10"
                >
                  <MapPin className="mb-2 h-6 w-6 text-blue-200" aria-hidden="true" />
                  <span className="text-sm font-medium">Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
