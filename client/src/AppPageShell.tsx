"use client";

import { type ReactNode, useEffect } from "react";
import { HelmetProvider } from "@/lib/helmet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import HotjarTracking from "@/components/common/HotjarTracking";
import SitemapLink from "@/components/common/SitemapLink";
import Favicons from "@/components/common/Favicons";
import SupplementalContent from "@/components/common/SupplementalContent";
import PreloadResources from "@/components/seo/PreloadResources";
import StructuredData from "@/components/seo/StructuredData";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  buildOrganizationSchema,
  buildPersonSchema,
  buildWebSiteSchema,
} from "@/lib/structuredData";

type AppPageShellProps = {
  readonly ssrPath?: string;
  readonly queryClientOverride?: QueryClient;
  readonly helmetContext?: unknown;
  readonly children?: ReactNode;
};

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

export function AppPageShell({
  ssrPath,
  queryClientOverride,
  helmetContext,
  children,
}: AppPageShellProps) {
  const client = queryClientOverride ?? queryClient;

  return (
    <QueryClientProvider client={client}>
      <HelmetProvider context={helmetContext}>
        <WouterRouter ssrPath={ssrPath}>
          <GoogleAnalytics />
          <HotjarTracking />
          <SitemapLink />
          <Favicons />
          <PreloadResources />
          <StructuredData
            data={[
              buildOrganizationSchema(),
              buildPersonSchema(),
              buildWebSiteSchema(),
            ]}
            id="global-organization-schema"
          />
          <ScrollToTop />
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header />
          <main
            id="main-content"
            style={{ paddingTop: "var(--header-height, 136px)" }}
          >
            {children}
          </main>
          <Footer />
          <SupplementalContent />
          </WouterRouter>
        <Toaster />
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default AppPageShell;
