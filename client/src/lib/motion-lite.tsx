"use client";

import type { HTMLAttributes, ReactNode } from "react";

type MotionDivProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  whileInView?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  viewport?: unknown;
  layoutId?: string;
  [key: string]: unknown;
};

const MotionDiv = ({
  children,
  initial,
  animate,
  exit,
  transition,
  whileInView,
  whileHover,
  whileTap,
  viewport,
  layoutId,
  ...rest
}: MotionDivProps) => {
  return <div {...(rest as HTMLAttributes<HTMLDivElement>)}>{children}</div>;
};

export const motion = {
  div: MotionDiv,
} as const;

export function AnimatePresence({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
