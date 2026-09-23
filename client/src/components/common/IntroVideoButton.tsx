"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackGAEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// The dialog (and its Radix dependency) only loads once someone asks for the
// video, so the homepage keeps its small first-load bundle.
const VideoModal = dynamic(() => import("@/components/common/VideoModal"), {
  ssr: false,
});

export const MEET_DR_WONG_VIDEO_URL = "/videos/meet-dr-wong.mp4";
export const MEET_DR_WONG_POSTER_URL = "/images/about/meet-dr-wong-poster.webp";

type IntroVideoButtonProps = {
  readonly label?: string;
  readonly context: string;
  readonly className?: string;
};

const IntroVideoButton = ({
  label = "Watch Dr. Wong’s 1-minute intro",
  context,
  className,
}: IntroVideoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setIsOpen(true);
          trackGAEvent("intro_video_open", { cta_context: context });
        }}
        className={cn(
          "ui-focus-premium inline-flex min-h-11 items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg backdrop-blur transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 motion-reduce:transform-none",
          className,
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
          <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
        </span>
        {label}
      </Button>
      {isOpen ? (
        <VideoModal
          isOpen
          onClose={() => setIsOpen(false)}
          videoUrl={MEET_DR_WONG_VIDEO_URL}
          poster={MEET_DR_WONG_POSTER_URL}
        />
      ) : null}
    </>
  );
};

export default IntroVideoButton;
