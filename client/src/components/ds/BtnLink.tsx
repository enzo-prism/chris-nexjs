import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type BtnVariant = "primary" | "gold" | "outline" | "outline-light" | "ghost";
export type BtnSize = "sm" | "md" | "lg";

type BtnLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  readonly href: string;
  readonly variant?: BtnVariant;
  readonly size?: BtnSize;
  readonly block?: boolean;
  readonly children: ReactNode;
};

// Literal class names so Tailwind keeps the @layer components rules.
const variantClass: Record<BtnVariant, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  outline: "btn-outline",
  "outline-light": "btn-outline-light",
  ghost: "btn-ghost",
};

export function btnClass(
  variant: BtnVariant = "primary",
  size: BtnSize = "md",
  block = false,
): string {
  return cn(
    "btn",
    variantClass[variant],
    size === "lg" && "btn-lg",
    size === "sm" && "btn-sm",
    block && "btn-block",
  );
}

const isExternal = (href: string) => /^(https?:|tel:|mailto:|sms:)/.test(href);

/** Pill call-to-action. Internal paths use next/link; tel:/http use <a>. */
export function BtnLink({
  href,
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...rest
}: BtnLinkProps) {
  const classes = cn(btnClass(variant, size, block), className);
  if (isExternal(href)) {
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : null)}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export default BtnLink;
