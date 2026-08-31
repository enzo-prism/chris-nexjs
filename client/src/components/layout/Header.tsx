import {
  useState,
  useLayoutEffect,
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
  House,
  UserRound,
  Stethoscope,
  Phone,
  MapPin,
  ChevronDown,
  Clock,
  ArrowRight,
  Instagram,
  type LucideIcon,
} from "lucide-react";
import { officeInfo } from "@/lib/data";
import ButtonLink from "@/components/common/ButtonLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChromeVariant } from "@/lib/chrome";

type NavChild = {
  readonly href: string;
  readonly label: string;
};

type NavLink = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly submenu?: readonly NavChild[];
};

const DESKTOP_NAV_BREAKPOINT = 1280;

const navLinks: readonly NavLink[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/about", label: "About", icon: UserRound },
  {
    href: "/services",
    label: "Services",
    icon: Stethoscope,
    submenu: [
      { href: "/invisalign", label: "Invisalign" },
      { href: "/dental-veneers", label: "Cosmetic Dentistry (Veneers)" },
      { href: "/teeth-whitening-palo-alto", label: "Teeth Whitening" },
      { href: "/zoom-whitening", label: "ZOOM! Whitening" },
      { href: "/dental-implants", label: "Dental Implants" },
      { href: "/emergency-dental", label: "Emergency Dentist" },
      { href: "/services", label: "View All Services" },
    ],
  },
  {
    href: "/locations",
    label: "Locations",
    icon: MapPin,
    submenu: [
      { href: "/dentist-menlo-park", label: "Menlo Park" },
      { href: "/dentist-stanford", label: "Stanford" },
      { href: "/dentist-mountain-view", label: "Mountain View" },
      { href: "/locations", label: "All Locations" },
    ],
  },
  { href: "/testimonials", label: "Testimonials", icon: UserRound },
  { href: "/contact", label: "Contact", icon: Phone },
] as const;

const slugifyLabel = (label: string): string =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type HeaderProps = {
  readonly variant?: ChromeVariant;
};

const Header = ({ variant = "default" }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(
    null,
  );
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number>(0);

  const isActive = (path: string): boolean => pathname === path;
  const isParentActive = (children?: readonly NavChild[]): boolean =>
    Boolean(children?.some((child) => isActive(child.href)));

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      setExpandedMenus([]);
      requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
      return;
    }

    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setExpandedMenus(
      navLinks
        .filter((link) => isParentActive(link.submenu))
        .map((link) => link.label),
    );
    setMobileMenuOpen(true);
  };
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

  const closeMobileMenuAndRestoreFocus = () => {
    setMobileMenuOpen(false);
    setExpandedMenus([]);
    requestAnimationFrame(() => {
      (previouslyFocusedElementRef.current ?? mobileMenuButtonRef.current)?.focus();
    });
  };

  const syncHeaderHeight = () => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const measuredHeight = Math.ceil(headerEl.getBoundingClientRect().height);
    document.documentElement.style.setProperty(
      "--header-height",
      `${measuredHeight}px`,
    );
  };

  const scheduleHeaderHeightUpdate = () => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = 0;
      syncHeaderHeight();
    });
  };

  // Calculate and set header height from the rendered header size before paint.
  useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    syncHeaderHeight();
    scheduleHeaderHeightUpdate();

    if (typeof document.fonts?.ready?.then === "function") {
      document.fonts.ready.then(scheduleHeaderHeightUpdate).catch(() => {
        scheduleHeaderHeightUpdate();
      });
    }

    scheduleHeaderHeightUpdate();

    const onResize = () => {
      scheduleHeaderHeightUpdate();
    };

    window.addEventListener("resize", onResize);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        scheduleHeaderHeightUpdate();
      });
      observer.observe(headerEl);

      return () => {
        if (frameRef.current) {
          window.cancelAnimationFrame(frameRef.current);
        }
        observer.disconnect();
        window.removeEventListener("resize", onResize);
      };
    }

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", onResize);
    };
  }, [pathname, scrolled, variant]);

  // Handle scroll effect for sticky header.
  useEffect(() => {
    setScrolled(window.scrollY > 20);

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
    const previousOverflow = document.body.style.overflow;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        mobileMenuRef.current
          ?.querySelector<HTMLElement>("[data-mobile-nav-focus]")
          ?.focus();
      });
    } else {
      document.body.style.overflow = previousOverflow;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Keep mobile overlay closed once the desktop breakpoint is active.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_NAV_BREAKPOINT && mobileMenuOpen) {
        setMobileMenuOpen(false);
        setExpandedMenus([]);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  // Close nav and submenus on route changes.
  useEffect(() => {
    setOpenDesktopSubmenu(null);
    setExpandedMenus([]);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (variant === "conversion") {
      setOpenDesktopSubmenu(null);
      setExpandedMenus([]);
      setMobileMenuOpen(false);
    }
  }, [variant]);

  // Global escape closes any open menu.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopSubmenu(null);
        if (mobileMenuOpen) {
          closeMobileMenuAndRestoreFocus();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

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
    }
  };

  const handleDesktopMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    triggerId: string,
  ) => {
    const menuItems = Array.from(
      event.currentTarget.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]'),
    );
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeDesktopSubmenu();
      document.getElementById(triggerId)?.focus();
      return;
    }

    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    if (event.key === "Home") {
      menuItems[0]?.focus();
      return;
    }
    if (event.key === "End") {
      menuItems.at(-1)?.focus();
      return;
    }

    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + direction + menuItems.length) % menuItems.length;
    menuItems[nextIndex]?.focus();
  };

  const handleMobileMenuKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Tab") return;

    const menuFocusables = Array.from(
      mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ) ?? [],
    );
    const focusables = menuFocusables;
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (variant === "conversion") {
    return (
      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-[100] isolation-auto"
      >
        <div
          className={cn(
            "relative z-[101] w-full border-b border-slate-200/80 bg-white/95 backdrop-blur transition-[box-shadow,padding] duration-300",
            scrolled ? "py-2 shadow-lg" : "py-3 shadow-sm",
          )}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="ui-focus-premium group relative z-[102] min-w-0 shrink rounded-xl"
              aria-label="Christopher B. Wong, DDS home"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 transition-colors group-hover:bg-slate-50 sm:h-11 sm:w-11">
                  {!logoLoadFailed ? (
                    <img
                      src="/favicon.png"
                      alt="Christopher B. Wong, DDS logo"
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
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
                  <span className="truncate font-serif text-sm tracking-wide text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                    Christopher B. Wong, DDS
                  </span>
                  <span className="hidden truncate text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:block">
                    Palo Alto Dentistry
                  </span>
                </div>
              </div>
            </Link>

            <a
              href={`tel:${officeInfo.phoneE164}`}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              className="ui-focus-premium inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/15 bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_38px_-24px_rgba(37,99,235,0.7)] transition-transform hover:-translate-y-0.5 hover:bg-primary/95 sm:px-5"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline">Call {officeInfo.phone}</span>
            </a>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-[100] flex flex-col isolation-auto"
    >
      {/* Top Bar - Contact & Info */}
      <div
        className={cn(
          "relative z-[101] hidden w-full overflow-hidden bg-[#0b1f3a] text-white/80 transition-[height,opacity] duration-300 lg:block",
          scrolled
            ? "pointer-events-none h-0 opacity-0"
            : "h-10 border-b border-white/5 opacity-100",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 text-xs font-medium sm:px-6 sm:text-sm lg:px-8">
          <div className="flex items-center space-x-6">
            <a
              href={`tel:${officeInfo.phoneE164}`}
              aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
              className="ui-link-premium-dark group flex min-h-10 items-center rounded-lg px-1 py-0.5 text-white/85"
            >
              <Phone
                className="mr-2 h-3.5 w-3.5 text-blue-200 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              <span>{officeInfo.phone}</span>
            </a>
            <div className="hidden items-center text-white/60 2xl:flex">
              <Clock className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Regular weekly hours: Mon, Tue, Thu {officeInfo.hours.monday} · Wed{" "}
                {officeInfo.hours.wednesday} · Fri {officeInfo.hours.friday}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href={officeInfo.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
              className="ui-link-premium-dark group hidden min-h-10 items-center rounded-lg px-1 py-0.5 text-white/85 md:flex"
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
              className="ui-link-premium-dark flex min-h-10 min-w-10 items-center justify-center rounded-lg px-2 py-1 text-white/85"
              aria-label="Visit Dr. Wong on Instagram (opens in a new tab)"
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
          <div className="flex items-center justify-between gap-3 xl:gap-5">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Christopher B. Wong, DDS home"
              className={cn(
                "ui-focus-premium group relative z-[102] min-w-0 shrink rounded-xl",
                "xl:max-w-[20rem] 2xl:max-w-none",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 transition-colors group-hover:bg-slate-50 sm:h-11 sm:w-11">
                  {!logoLoadFailed ? (
                    <img
                      src="/favicon.png"
                      alt="Christopher B. Wong, DDS logo"
                      width={44}
                      height={44}
                      loading="lazy"
                      decoding="async"
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
                  <span className="truncate font-serif text-sm tracking-wide text-slate-900 transition-colors group-hover:text-primary sm:text-lg lg:text-base xl:text-base 2xl:text-lg">
                    Christopher B. Wong, DDS
                  </span>
                  <span className="hidden truncate text-[9px] uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-slate-600 xl:block xl:text-[9px] 2xl:text-[10px]">
                    Conservative dental care in Palo Alto
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation + CTA */}
            <div
              className={cn(
                "hidden min-w-0 flex-1 items-center justify-end gap-2 xl:flex 2xl:gap-4",
              )}
            >
              <nav className="relative z-[102] flex min-w-0 items-center gap-1.5 2xl:gap-3">
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
                        data-active={active ? "true" : undefined}
                        className="ui-focus-premium ui-nav-link relative z-[102] flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-[13px] font-medium tracking-wide text-slate-700 2xl:gap-1.5 2xl:px-3 2xl:text-sm"
                        aria-current={isActive(link.href) ? "page" : undefined}
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
                              "h-3 w-3 transition-[transform,color] duration-300 ease-out motion-reduce:transition-none",
                              openDesktopSubmenu === link.label
                                ? "-rotate-180 text-primary"
                                : cn(
                                    "text-slate-400 group-hover:translate-y-0.5 group-hover:text-primary",
                                    active && "text-primary",
                                  ),
                            )}
                            aria-hidden="true"
                          />
                        )}
                      </Link>

                      {/* Premium underline: wipes in from center on hover /
                          focus and stays lit while active (styles in globals). */}
                      <span
                        aria-hidden="true"
                        data-active={active ? "true" : undefined}
                        className="ui-nav-underline z-[101]"
                      />

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
                          <div className="relative z-[103] origin-top overflow-hidden rounded-xl border border-white/10 bg-[#102a4a] p-2 shadow-2xl duration-200 ease-out animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 motion-reduce:animate-none">
                            {link.submenu?.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                role="menuitem"
                                className={cn(
                                  "ui-focus-premium group/item relative z-[104] flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-[color,background-color,border-color,box-shadow]",
                                  isActive(subItem.href)
                                    ? "bg-white/14 text-blue-200 shadow-[inset_0_0_0_1px_rgba(191,219,254,0.35)]"
                                    : "text-white/90 hover:bg-white/8 hover:text-white",
                                )}
                                aria-current={isActive(subItem.href) ? "page" : undefined}
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
                aria-label="Request an appointment"
                className="ui-btn-primary shrink-0 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold 2xl:px-6 2xl:text-sm"
              >
                Request Appointment
              </ButtonLink>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              ref={mobileMenuButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className={cn(
                "relative z-50 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 shadow-sm transition-[background-color,border-color,color,box-shadow] hover:border-slate-300 hover:bg-white hover:text-primary focus-visible:ring-primary focus-visible:ring-offset-2",
                "xl:hidden",
              )}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-haspopup="dialog"
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
          ref={mobileMenuRef}
          id="mobile-nav"
          aria-label="Mobile navigation"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] overflow-hidden bg-[#0b1f3a] text-white xl:hidden"
          onKeyDown={handleMobileMenuKeyDown}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(147,197,253,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(147,197,253,0.1),transparent_45%)] opacity-60"
            aria-hidden="true"
          />

          <div className="relative z-10 flex h-full flex-col">
            <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm sm:px-6">
              <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
                <Link
                  href="/"
                  onClick={closeMenus}
                  className="ui-focus-premium group min-w-0 rounded-xl"
                  aria-label="Christopher B. Wong, DDS home"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                      {!logoLoadFailed ? (
                        <img
                          src="/favicon.png"
                          alt=""
                          width={40}
                          height={40}
                          className="h-full w-full object-contain p-1"
                          onError={() => setLogoLoadFailed(true)}
                        />
                      ) : (
                        <span className="font-serif text-sm font-semibold tracking-wide text-primary">
                          CW
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-sm tracking-wide sm:text-base">
                        Christopher B. Wong, DDS
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Palo Alto Dentistry
                      </span>
                    </span>
                  </span>
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileMenuAndRestoreFocus}
                  className="ui-focus-premium shrink-0 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 shadow-sm hover:bg-white hover:text-primary"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-6">
              <div className="mx-auto flex min-h-full max-w-lg flex-col py-5 sm:py-7">
                <div className="mb-4 px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/85">
                    Practice Menu
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Find care, patient stories, and ways to reach the office.
                  </p>
                </div>

                <nav className="overflow-hidden rounded-[1.65rem] border border-white/10 bg-white/[0.055] p-2 shadow-[0_28px_70px_-44px_rgba(0,0,0,0.75)]">
                  {navLinks.map((link) => {
                    const active = isActive(link.href) || isParentActive(link.submenu);
                    const hasSubmenu = Boolean(link.submenu?.length);
                    const submenuId = `mobile-submenu-${slugifyLabel(link.label)}`;
                    const Icon = link.icon;

                    return (
                      <div key={link.label}>
                        {!hasSubmenu ? (
                          <Link
                            href={link.href}
                            onClick={closeMenus}
                            data-mobile-nav-focus={link.href === "/" ? "true" : undefined}
                            className={cn(
                              "ui-focus-premium group relative flex min-h-14 items-center gap-3 rounded-2xl px-3.5 py-3 text-base font-semibold transition-[color,background-color,box-shadow] sm:text-lg",
                              active
                                ? "bg-sky-300/[0.13] text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.22)]"
                                : "text-slate-200 hover:bg-white/[0.065] hover:text-white",
                            )}
                            aria-current={isActive(link.href) ? "page" : undefined}
                          >
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors",
                                active
                                  ? "bg-sky-300/15 text-sky-200 ring-sky-200/20"
                                  : "bg-white/[0.055] text-slate-400 ring-white/10 group-hover:text-sky-200",
                              )}
                            >
                              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1 transition-transform group-active:scale-[0.99]">
                              {link.label}
                            </span>
                            <ArrowRight
                              className={cn(
                                "h-4 w-4 shrink-0 transition-[opacity,transform,color]",
                                active
                                  ? "translate-x-0 text-sky-200 opacity-100"
                                  : "-translate-x-1 text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:text-sky-200 group-hover:opacity-100",
                              )}
                              aria-hidden="true"
                            />
                          </Link>
                        ) : (
                          <div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => toggleSubmenu(link.label)}
                              className={cn(
                                "ui-focus-premium group flex h-auto min-h-14 w-full items-center gap-3 rounded-2xl bg-transparent px-3.5 py-3 text-base font-semibold transition-[color,background-color,box-shadow] sm:text-lg",
                                active
                                  ? "bg-sky-300/[0.13] text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.22)]"
                                  : "text-slate-200 hover:bg-white/[0.065] hover:text-white",
                              )}
                              aria-expanded={expandedMenus.includes(link.label)}
                              aria-controls={submenuId}
                            >
                              <span
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors",
                                  active
                                    ? "bg-sky-300/15 text-sky-200 ring-sky-200/20"
                                    : "bg-white/[0.055] text-slate-400 ring-white/10 group-hover:text-sky-200",
                                )}
                              >
                                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                              </span>
                              <span className="min-w-0 flex-1 text-left transition-transform group-active:scale-[0.99]">
                                {link.label}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-[transform,color] duration-300 motion-reduce:transition-none",
                                  expandedMenus.includes(link.label)
                                    ? "rotate-180 text-sky-200"
                                    : "text-slate-500",
                                )}
                                aria-hidden="true"
                              />
                            </Button>

                            {expandedMenus.includes(link.label) && (
                              <div
                                id={submenuId}
                                className="overflow-hidden duration-200 ease-out animate-in fade-in-0 slide-in-from-top-1 motion-reduce:animate-none"
                              >
                                <div className="mb-2 ml-[2.05rem] space-y-1 border-l border-sky-200/20 pb-2 pl-4 pr-1 pt-1">
                                  {link.submenu?.map((subLink) => (
                                    <Link
                                      key={subLink.href}
                                      href={subLink.href}
                                      onClick={closeMenus}
                                      className={cn(
                                        "ui-focus-premium block min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium leading-6 transition-[color,background-color,box-shadow] active:bg-white/5 sm:text-base",
                                        isActive(subLink.href)
                                          ? "bg-sky-300/[0.13] text-sky-100 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.2)]"
                                          : "text-slate-300 hover:bg-white/[0.055] hover:text-white",
                                      )}
                                      aria-current={isActive(subLink.href) ? "page" : undefined}
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

                <div className="mt-5 rounded-[1.65rem] border border-white/10 bg-white/[0.045] p-3 shadow-[0_24px_60px_-46px_rgba(0,0,0,0.75)]">
                  <ButtonLink
                    href="/schedule#appointment"
                    aria-label="Request an appointment"
                    onClick={closeMenus}
                    className="ui-btn-primary min-h-12 w-full rounded-2xl text-base font-bold"
                  >
                    Request Appointment
                  </ButtonLink>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${officeInfo.phoneE164}`}
                      aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
                      className="ui-focus-premium flex min-h-20 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3 text-white transition-[background-color,border-color] hover:border-sky-200/30 hover:bg-white/10 active:bg-white/10"
                    >
                      <Phone className="h-5 w-5 shrink-0 text-sky-200" aria-hidden="true" />
                      <span className="text-sm font-semibold">Call Office</span>
                    </a>
                    <a
                      href={officeInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
                      className="ui-focus-premium flex min-h-20 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-3 text-white transition-[background-color,border-color] hover:border-sky-200/30 hover:bg-white/10 active:bg-white/10"
                    >
                      <MapPin className="h-5 w-5 shrink-0 text-sky-200" aria-hidden="true" />
                      <span className="text-sm font-semibold">Directions</span>
                    </a>
                  </div>
                  <p className="px-2 pb-1 pt-3 text-center text-xs text-slate-400">
                    {officeInfo.address.line1}, {officeInfo.address.city}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
