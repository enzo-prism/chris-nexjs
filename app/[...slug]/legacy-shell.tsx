"use client";

import dynamic from "next/dynamic";

const LegacyAppShell = dynamic(
  () => import("../../client/src/App").then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function LegacyShell({ ssrPath }: { ssrPath: string }) {
  return <LegacyAppShell ssrPath={ssrPath} />;
}
