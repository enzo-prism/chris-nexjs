"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MapPin, Phone } from "lucide-react";
import { officeInfo } from "@/lib/data";

// The request funnel pages already lead with their own call banner and form,
// and the bar would cover the form's bottom controls on small screens.
const HIDDEN_PATHS = new Set(["/schedule", "/zoom-whitening/schedule"]);

// Slides in once the visitor scrolls past the page hero (which already shows
// the same call / request actions), so it never covers the hero buttons.
const REVEAL_AFTER_PX = 280;

/** Floating thumb-zone actions on phones: call, directions, request. */
const MobileActionBar = () => {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > REVEAL_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (HIDDEN_PATHS.has(pathname)) return null;

  return (
    <nav
      aria-label="Quick actions"
      data-testid="mobile-action-bar"
      data-analytics-context="mobile-action-bar"
      data-visible={visible}
      inert={!visible}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[90] translate-y-[calc(100%+1.5rem)] opacity-0 transition-[transform,opacity] duration-500 ease-out-soft data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-reduce:transition-none md:hidden"
    >
      <div className="grid grid-cols-[1fr_1fr_1.6fr] items-stretch gap-1 rounded-full border border-white/10 bg-evergreen-900/95 p-1 shadow-[0_18px_40px_-14px_rgba(6,26,20,0.7)] backdrop-blur-md">
        <a
          href={`tel:${officeInfo.phoneE164}`}
          aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-cream-50 transition-colors active:bg-white/10"
        >
          <Phone className="h-[18px] w-[18px] text-gold-300" aria-hidden="true" />
          Call
        </a>
        <a
          href={officeInfo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold text-cream-50 transition-colors active:bg-white/10"
        >
          <MapPin className="h-[18px] w-[18px] text-gold-300" aria-hidden="true" />
          Map
        </a>
        <Link
          href="/schedule#appointment"
          aria-label="Request an appointment"
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-gold-400 text-[14px] font-bold text-evergreen-950 transition-colors active:bg-gold-300"
        >
          <CalendarDays className="h-[18px] w-[18px]" aria-hidden="true" />
          Request a visit
        </Link>
      </div>
    </nav>
  );
};

export default MobileActionBar;
