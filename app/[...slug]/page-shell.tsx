"use client";

import { type ReactNode } from "react";
import { AppPageShell } from "../../client/src/AppPageShell";

export default function RouteShell({
  ssrPath,
  enableQueryClient,
  enableHelmet,
  children,
}: {
  ssrPath: string;
  enableQueryClient?: boolean;
  enableHelmet?: boolean;
  children: ReactNode;
}) {
  return (
    <AppPageShell
      ssrPath={ssrPath}
      enableQueryClient={enableQueryClient}
      enableHelmet={enableHelmet}
    >
      {children}
    </AppPageShell>
  );
}
