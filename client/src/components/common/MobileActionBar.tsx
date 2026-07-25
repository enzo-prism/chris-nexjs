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
          aria-label={`Call Dr. Wong's office at ${officeInfo.phone}`}
          className="ui-focus-premium flex min-h-14 flex-col items-center justify-center gap-0.5 border-r border-slate-200 py-1.5 text-slate-700 transition-[background-color,color] hover:bg-slate-50 hover:text-primary active:bg-slate-100"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">Call</span>
        </a>
        <a
          href={officeInfo.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions to Dr. Wong's office (opens in a new tab)"
          className="ui-focus-premium flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-slate-700 transition-[background-color,color] hover:bg-slate-50 hover:text-primary active:bg-slate-100"
        >
          <MapPin className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">Directions</span>
        </a>
        <Link
          href="/schedule#appointment"
          aria-label="Request an appointment"
          className="ui-focus-premium flex min-h-14 flex-col items-center justify-center gap-0.5 bg-primary py-1.5 text-white transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">Request Appointment</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileActionBar;
