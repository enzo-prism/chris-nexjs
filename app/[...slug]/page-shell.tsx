"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AppPageShell } from "../../client/src/AppPageShell";

const LegacyAppShell = dynamic(
  () => import("../../client/src/App").then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function RouteShell({
  ssrPath,
  enableQueryClient,
  enableHelmet,
  children,
}: {
  ssrPath: string;
  enableQueryClient?: boolean;
  enableHelmet?: boolean;
  children?: ReactNode;
}) {
  if (children) {
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

  return <LegacyAppShell ssrPath={ssrPath} />;
}
