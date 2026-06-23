"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { officeInfo } from "@/lib/data";

// The request funnel pages already lead with their own call banner and form,
// and the bar would cover the form's bottom controls on small screens.
const HIDDEN_PATHS = new Set(["/schedule", "/zoom-whitening/schedule"]);

const MobileActionBar = () => {
  const pathname = usePathname() || "/";

  if (HIDDEN_PATHS.has(pathname)) return null;

  return (
    <nav
      aria-label="Quick actions"
      data-testid="mobile-action-bar"
      data-analytics-context="mobile-action-bar"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-3">
        <a
          href={`tel:${officeInfo.phoneE164}`}
          className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 py-1.5 text-slate-700 transition-colors hover:text-primary"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">Call</span>
        </a>
        <a
          href={officeInfo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 py-1.5 text-slate-700 transition-colors hover:text-primary"
        >
          <MapPin className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">Directions</span>
        </a>
        <Link
          href="/schedule#appointment"
          className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 bg-primary py-1.5 text-white transition-colors hover:bg-primary/90"
        >
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">Request Visit</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileActionBar;
