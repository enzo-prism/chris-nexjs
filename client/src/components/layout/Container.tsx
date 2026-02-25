import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ContainerSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "xl", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        sizeClasses[size],
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
);

Container.displayName = "Container";

export default Container;

