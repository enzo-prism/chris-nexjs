import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceIcon, type ServiceIconName } from "@/components/ds/ServiceIcon";
import { allServices } from "@/data/siteNav";

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

const iconFor = (href: string): ServiceIconName =>
  allServices.find((s) => s.href === href)?.icon ?? "tooth";

/** Sibling-service cards (internal links; next/link for real navigation). */
const RelatedServices = ({
  items,
  title = "Related services",
  subtitle = "Explore other dental services in Palo Alto.",
  className,
}: RelatedServicesProps) => {
  if (!items?.length) return null;

  return (
    <section className={cn("bg-white py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Keep exploring</p>
          <h2 className="h-section mt-4">{title}</h2>
          {subtitle ? <p className="lead mt-4">{subtitle}</p> : null}
        </div>

        <div className="reveal-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="card card-lift group flex flex-col gap-4 p-6 outline-none">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-evergreen-50 text-evergreen-700 transition-colors group-hover:bg-evergreen-800 group-hover:text-gold-300">
                <ServiceIcon name={iconFor(item.href)} className="h-7 w-7" />
              </span>
              <span>
                <span className="block font-heading text-xl font-medium text-ink">{item.anchorText}</span>
                {item.description ? (
                  <span className="mt-1.5 block text-[15px] leading-6 text-ink-muted">{item.description}</span>
                ) : null}
              </span>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-evergreen-700">
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;
