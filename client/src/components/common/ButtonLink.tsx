import * as React from "react";
import Link from "next/link";
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

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ href, className, variant, size, children, ...props }, ref) => (
    <Link
      ref={ref}
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  ),
);

ButtonLink.displayName = "ButtonLink";

export default ButtonLink;
