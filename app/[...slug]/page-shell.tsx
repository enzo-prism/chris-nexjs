"use client";

import { type ReactNode } from "react";
import { AppShell } from "../../client/src/App";
import { AppPageShell } from "../../client/src/AppPageShell";

export default function RouteShell({
  ssrPath,
  children,
}: {
  ssrPath: string;
  children?: ReactNode;
}) {
  if (children) {
    return (
      <AppPageShell ssrPath={ssrPath}>
        {children}
      </AppPageShell>
    );
  }

  return <AppShell ssrPath={ssrPath} />;
}
