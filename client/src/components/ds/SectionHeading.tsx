import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  readonly id?: string;
  readonly eyebrow?: ReactNode;
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  readonly align?: "left" | "center";
  readonly as?: "h1" | "h2" | "h3";
  readonly size?: "section" | "display";
  readonly className?: string;
  readonly children?: ReactNode;
};

/** Eyebrow + serif heading (italic words render gold) + optional lead. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = "left",
  as: Heading = "h2",
  size = "section",
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className={cn("eyebrow", align === "center" && "justify-center")}>{eyebrow}</p>
      ) : null}
      <Heading
        id={id}
        className={cn(
          size === "display"
            ? "h-display text-[2.6rem] sm:text-[3.4rem] lg:text-[4.2rem]"
            : "h-section",
          eyebrow ? "mt-4" : null,
          "text-balance",
        )}
      >
        {title}
      </Heading>
      {lead ? <p className={cn("lead mt-5", align === "center" && "mx-auto")}>{lead}</p> : null}
      {children}
    </div>
  );
}

export default SectionHeading;
