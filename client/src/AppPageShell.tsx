"use client";

import { type ReactNode, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { HelmetProvider } from "@/lib/helmet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import SupplementalContent from "@/components/common/SupplementalContent";
import StructuredData from "@/components/seo/StructuredData";
import HolidayHoursNotice from "@/components/common/HolidayHoursNotice";

// Loaded after hydration so the fixed quick-action bar stays out of every
// page's First Load JS (it is interaction-only chrome, like the consent
// banner below).
const MobileActionBar = dynamic(
  () => import("@/components/common/MobileActionBar"),
  { ssr: false, loading: () => null },
);
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { ChromeVariant } from "@/lib/chrome";
import {
  buildOrganizationSchema,
  buildPersonSchema,
  buildWebSiteSchema,
} from "@/lib/structuredData";
import { publishedTestimonialAggregateRating } from "@shared/reviewStats";

const GoogleAnalytics = dynamic(
  () => import("@/components/common/GoogleAnalytics"),
  { ssr: false, loading: () => null },
);

const HotjarTracking = dynamic(
  () => import("@/components/common/HotjarTracking"),
  { ssr: false, loading: () => null },
);

type AppPageShellProps = {
  readonly ssrPath?: string;
  readonly queryClientOverride?: QueryClient;
  readonly helmetContext?: unknown;
  readonly enableQueryClient?: boolean;
  readonly enableHelmet?: boolean;
  readonly chromeVariant?: ChromeVariant;
  readonly children?: ReactNode;
};

function WouterPathSync() {
  const pathname = usePathname() || "/";
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (pathname !== location) {
      navigate(pathname, { replace: true });
    }
  }, [pathname, location, navigate]);

  return null;
}

function ScrollToTop() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    // Respect hash deep links (e.g. /schedule#appointment): scrolling to the
    // top here would override the browser/router anchor scroll and dump the
    // visitor at the top of the page instead of the requested section.
    const hash = window.location.hash;
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppPageShell({
  ssrPath,
  queryClientOverride,
  helmetContext,
  enableQueryClient = true,
  enableHelmet = true,
  chromeVariant = "default",
  children,
}: AppPageShellProps) {
  const client = queryClientOverride ?? queryClient;

  const shellContent = (
    <WouterRouter ssrPath={ssrPath}>
      <WouterPathSync />
      <ScrollToTop />
      <GoogleAnalytics />
      <HotjarTracking />
      <StructuredData
        data={[
          buildOrganizationSchema({
            aggregateRating: publishedTestimonialAggregateRating,
          }),
          buildPersonSchema(),
          buildWebSiteSchema(),
        ]}
        id="global-organization-schema"
      />
      <Header variant={chromeVariant} />
      <main style={{ paddingTop: "var(--header-height, 110px)" }}>
        {chromeVariant === "default" ? <HolidayHoursNotice /> : null}
        {children}
      </main>
      <Footer variant={chromeVariant} />
      {chromeVariant === "default" ? (
        <>
          {/* Reserve space under the footer so the fixed mobile action bar
              never covers the last page content on small screens. */}
          <div
            aria-hidden="true"
            className="h-[calc(3.25rem+env(safe-area-inset-bottom))] md:hidden"
          />
          <MobileActionBar />
        </>
      ) : null}
      {chromeVariant === "default" ? <SupplementalContent /> : null}
    </WouterRouter>
  );

  const withHelmet = enableHelmet ? (
    <HelmetProvider context={helmetContext}>{shellContent}</HelmetProvider>
  ) : (
    shellContent
  );

  const withProviders = enableQueryClient ? (
    <QueryClientProvider client={client}>{withHelmet}</QueryClientProvider>
  ) : (
    withHelmet
  );

  return (
    <>
      {withProviders}
      <Toaster />
    </>
  );
}

export default AppPageShell;
