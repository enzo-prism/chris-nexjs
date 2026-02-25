import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type BreadcrumbTrailItem = {
  name: string;
  path: string;
};

interface PageBreadcrumbsProps {
  items: BreadcrumbTrailItem[];
  className?: string;
  containerClassName?: string;
}

const PageBreadcrumbs = ({
  items,
  className,
  containerClassName,
}: PageBreadcrumbsProps) => {
  if (!items || items.length < 2) return null;

  return (
    <div
      className={cn(
        "bg-[#F5F9FC] border-b border-slate-200",
        containerClassName,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumb className={cn("text-sm", className)}>
          <BreadcrumbList className="text-slate-500">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <React.Fragment key={`${item.path}-${index}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-slate-900">
                        {item.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={item.path}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        {item.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="text-slate-300" />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default PageBreadcrumbs;
