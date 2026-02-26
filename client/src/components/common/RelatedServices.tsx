import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export type RelatedServiceLink = {
  href: string;
  anchorText: string;
  description?: string;
};

interface RelatedServicesProps {
  items: RelatedServiceLink[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const RelatedServices = ({
  items,
  title = "Related services",
  subtitle = "Explore other dental services in Palo Alto.",
  className,
}: RelatedServicesProps) => {
  if (!items?.length) return null;

  return (
    <section className={cn("py-16 bg-white", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-heading text-[#333333] mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[#333333] max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-[color,background-color,box-shadow] hover:border-primary/30 hover:bg-white hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary">
                {item.anchorText}
              </h3>
              {item.description && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              )}
              <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                Learn more
                <ArrowRight
                  className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;
