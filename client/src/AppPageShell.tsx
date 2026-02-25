"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import { HelmetProvider } from "@/lib/helmet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import SupplementalContent from "@/components/common/SupplementalContent";
import StructuredData from "@/components/seo/StructuredData";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  buildOrganizationSchema,
  buildPersonSchema,
  buildWebSiteSchema,
} from "@/lib/structuredData";

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
  readonly children?: ReactNode;
};

export function AppPageShell({
  ssrPath,
  queryClientOverride,
  helmetContext,
  enableQueryClient = true,
  enableHelmet = true,
  children,
}: AppPageShellProps) {
  const client = queryClientOverride ?? queryClient;

  const shellContent = (
    <WouterRouter ssrPath={ssrPath}>
      <GoogleAnalytics />
      <HotjarTracking />
      <StructuredData
        data={[
          buildOrganizationSchema(),
          buildPersonSchema(),
          buildWebSiteSchema(),
        ]}
        id="global-organization-schema"
      />
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
