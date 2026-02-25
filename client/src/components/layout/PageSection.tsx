import { cn } from "@/lib/utils";

type SpacingPreset = "none" | "sm" | "md" | "lg";

const spacingClasses: Record<SpacingPreset, string> = {
  none: "",
  sm: "py-10 sm:py-14 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
};

export type PageSectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: keyof HTMLElementTagNameMap;
  spacing?: SpacingPreset;
};

const PageSection = ({
  as: Component = "section",
  spacing = "md",
  className,
  ...props
}: PageSectionProps) => {
  const Tag = Component as unknown as React.ElementType;
  return (
    <Tag
      className={cn(spacingClasses[spacing], className)}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    />
  );
};

export default PageSection;
