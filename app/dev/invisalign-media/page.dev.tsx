import type { Metadata } from "next";
import type { JSX } from "react";

import { InvisalignMediaSection } from "@/components/invisalign/InvisalignMediaSection";
import { getInvisalignMediaFixtures } from "../../../scripts/invisalign-media.fixtures";

export const metadata: Metadata = {
  title: "Invisalign media preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DevInvisalignMediaPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ videos?: string; graphics?: string }>;
}): Promise<JSX.Element> {
  const params = await searchParams;
  const videoCount = params.videos === "1" ? 1 : 2;
  const graphicCount = params.graphics === "3" ? 3 : 4;
  const { videos, graphics } = getInvisalignMediaFixtures({
    videoCount,
    graphicCount,
  });

  return (
    <main className="min-h-screen bg-white">
      <InvisalignMediaSection videos={videos} graphics={graphics} />
    </main>
  );
}
