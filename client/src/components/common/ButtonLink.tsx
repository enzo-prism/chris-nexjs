import * as React from "react";
import { Link } from "wouter";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> &
  VariantProps<typeof buttonVariants> & {
    readonly href: string;
  };

export default function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  ...props
}: ButtonLinkProps): JSX.Element {
  return (
    <Link href={href} asChild>
      <a className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </a>
    </Link>
  );
}
