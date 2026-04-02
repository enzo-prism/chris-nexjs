"use client";

import { type ReactNode } from "react";
import { AppPageShell } from "../../client/src/AppPageShell";
import type { ChromeVariant } from "../../client/src/lib/chrome";

export default function RouteShell({
  ssrPath,
  enableQueryClient,
  enableHelmet,
  chromeVariant,
  children,
}: {
  ssrPath: string;
  enableQueryClient?: boolean;
  enableHelmet?: boolean;
  chromeVariant?: ChromeVariant;
  children: ReactNode;
}) {
  return (
    <AppPageShell
      ssrPath={ssrPath}
      enableQueryClient={enableQueryClient}
      enableHelmet={enableHelmet}
      chromeVariant={chromeVariant}
    >
      {children}
    </AppPageShell>
  );
}
