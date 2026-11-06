import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ds/Section";
import { SectionHeading } from "@/components/ds/SectionHeading";

const guides = [
  {
    href: "/blog/how-long-does-invisalign-take",
    title: "How long does Invisalign take?",
    detail: "Understand the stages, check-ins, and factors that can change your timeline.",
    serviceHref: "/invisalign",
    serviceLabel: "Invisalign at our office",
  },
  {
    href: "/blog/cosmetic-bonding-vs-veneer-for-one-chipped-front-tooth-palo-alto",
    title: "Bonding or a veneer for a chipped tooth?",
    detail: "Compare the options before deciding how to repair one front tooth.",
    serviceHref: "/dental-veneers",
    serviceLabel: "Veneer options",
  },
  {
    href: "/blog/crown-vs-filling-palo-alto",
    title: "Does your tooth need a filling or a crown?",
    detail: "See what an exam can tell you about protecting the tooth you have.",
    serviceHref: "/crowns-palo-alto",
    serviceLabel: "Dental crowns",
  },
  {
    href: "/blog/dental-implants-vs-bridge-palo-alto",
    title: "An implant or a bridge for a missing tooth?",
    detail: "Compare the treatment steps and questions to bring to your consultation.",
    serviceHref: "/dental-implants",
    serviceLabel: "Implant planning and restoration",
  },
] as const;

/** Editorial paths from the homepage/service hub, available without JavaScript. */
export function PatientDecisionGuides({ id }: { readonly id: string }) {
  return (
    <Section id={id} tone="white" spacing="tight" labelledBy={`${id}-title`}>
      <SectionHeading
        id={`${id}-title`}
        eyebrow="Before you decide"
        title={<>Answers to help you <em>choose your next step</em></>}
        lead="Explore your options, then bring your questions to an exam with Dr. Wong."
      />
      <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <li key={guide.href} className="border-t border-cream-300 pt-5">
            <h3 className="font-heading text-xl font-medium leading-snug text-ink">
              <Link href={guide.href} className="link-rooted inline-flex min-h-11 items-start gap-2">
                {guide.title}<ArrowRight className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
            </h3>
            <p className="mt-3 text-[15px] leading-6 text-ink-soft">{guide.detail}</p>
            <Link href={guide.serviceHref} className="link-rooted mt-2 inline-flex min-h-11 items-center text-sm">
              {guide.serviceLabel}
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
