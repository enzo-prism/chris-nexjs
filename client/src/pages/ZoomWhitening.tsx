import { Sparkles, Clock, Shield, Smile, ArrowRight, CheckCircle, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import MetaTags from "@/components/common/MetaTags";
import StructuredData from "@/components/seo/StructuredData";
import OptimizedImage from "@/components/seo/OptimizedImage";
import { pageTitles, pageDescriptions } from "@/lib/metaContent";
import { buildBreadcrumbSchema, buildServiceSchema } from "@/lib/structuredData";
import { getTestimonialsByNames } from "@/lib/testimonials";
import { motion } from "framer-motion";
import PageBreadcrumbs from "@/components/common/PageBreadcrumbs";
import RelatedServices, {
  type RelatedServiceLink,
} from "@/components/common/RelatedServices";

const ZoomWhitening = () => {
  const whiteningPerks = [
    {
      title: "Visible in one visit",
      description: "Up to eight shades brighter in a single 90-minute appointment.",
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
    {
      title: "Minimized sensitivity",
      description: "Protective gel, desensitizing agents, and careful light settings keep you comfortable.",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      title: "Even, natural results",
      description: "Customized shade goals to brighten without looking artificial.",
      icon: <Smile className="h-6 w-6 text-primary" />,
    },
  ];

  const treatmentSteps = [
    { title: "Shade goal & exam", description: "We confirm your whitening goals, check for decay or cracks, and take baseline photos." },
    { title: "Prep & protection", description: "We isolate gums and lips, then apply a protective gel to keep soft tissue safe." },
    { title: "ZOOM light sessions", description: "Three to four 15-minute cycles with ZOOM whitening gel and controlled light activation." },
    { title: "Fluoride & post-care", description: "Sensitivity care, custom shade check, and at-home guidance to keep results bright." },
  ];

  const whiteningTestimonials = getTestimonialsByNames([
    "Kat Vasilakos",
    "Kevin Zhang",
    "Ashley Chung",
  ]);

  const serviceSchema = buildServiceSchema({
    name: "ZOOM! Teeth Whitening",
    description: "Fast in-office ZOOM! whitening in Palo Alto to lift deep stains and brighten smiles with minimal sensitivity.",
    slug: "/zoom-whitening",
    serviceType: "Teeth Whitening",
  });

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "ZOOM Whitening", path: "/zoom-whitening" },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbItems);

  const relatedServices: RelatedServiceLink[] = [
    {
      href: "/teeth-whitening-palo-alto",
      anchorText: "Teeth whitening in Palo Alto",
      description: "Compare in‑office whitening and custom take‑home trays.",
    },
    {
      href: "/dental-veneers",
      anchorText: "Dental veneers in Palo Alto",
      description: "Cover deep discoloration or reshape teeth for a new smile.",
    },
    {
      href: "/invisalign",
      anchorText: "Invisalign in Palo Alto",
      description: "Straighten teeth before finishing with whitening.",
    },
    {
      href: "/dental-implants",
      anchorText: "Dental implants",
      description: "Restore missing teeth as part of a full smile plan.",
    },
    {
      href: "/services",
      anchorText: "Explore all services",
    },
  ];

  const schemaNodes = [serviceSchema];

  if (breadcrumbSchema) schemaNodes.push(breadcrumbSchema);
  return (
    <>
      <MetaTags 
        title={pageTitles.zoomWhitening}
        description={pageDescriptions.zoomWhitening}
      />
      <StructuredData data={schemaNodes} />
      <PageBreadcrumbs items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b1f3a] pt-28 pb-16 md:pb-24">
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0b1f3a] via-[#123a6b] to-[#163b68]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#1f4d89_0%,transparent_55%),radial-gradient(circle_at_top_right,#0b2445_0%,transparent_45%)] opacity-80"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-white"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur mb-4">
                <Sun className="h-4 w-4" />
                In-office ZOOM! Whitening
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading leading-tight mb-4">
                Brighter teeth in one visit with ZOOM! Whitening in Palo Alto
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed mb-6 max-w-xl">
                Lift deep stains, coffee discoloration, and dullness with Dr. Wong&apos;s fast, gentle ZOOM! treatment—designed for noticeably whiter teeth with minimal sensitivity.
              </p>
              <p className="text-sm text-blue-100/80 leading-relaxed mb-6 max-w-xl">
                Looking for broader{" "}
                <Link
                  href="/teeth-whitening-palo-alto"
                  className="font-semibold text-white underline underline-offset-4 hover:text-blue-100 transition-colors"
                >
                  teeth whitening options in Palo Alto
                </Link>
                ? Compare in‑office whitening and custom take‑home trays.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link href="/schedule#appointment">
                  <Button className="bg-white text-[#0b1f3a] hover:bg-blue-50 font-semibold px-6 py-6 h-auto rounded-full flex items-center gap-2 shadow-lg shadow-black/20">
                    Book whitening visit
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-white/60 text-white hover:text-white hover:border-white/80 bg-white/10 hover:bg-white/20"
                  >
                    Ask a question
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 shadow-sm backdrop-blur">
                  <CheckCircle className="h-4 w-4 text-blue-100" />
                  Same-day results
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 shadow-sm backdrop-blur">
                  <CheckCircle className="h-4 w-4 text-blue-100" />
                  Minimal downtime
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-2 shadow-sm backdrop-blur">
                  <CheckCircle className="h-4 w-4 text-blue-100" />
                  Sensitivity-managed
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-3xl bg-white/10 blur-3xl" aria-hidden />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                <OptimizedImage
                  src="https://res.cloudinary.com/dhqpqfw6w/image/upload/v1766936713/zoom-whitening_bizgsh.webp"
                  alt="ZOOM whitening treatment result"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Why patients choose ZOOM! Whitening with Dr. Wong
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fast, controlled whitening with safeguards to keep teeth healthy and sensitivity low.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {whiteningPerks.map((perk, index) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {perk.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{perk.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">What to expect during your visit</h2>
              <p className="text-gray-600 mb-6">
                Every whitening appointment starts with a quick health check to ensure your gums, enamel, and restorations are ready for treatment.
              </p>
              <div className="space-y-4">
                {treatmentSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-sm text-gray-600">
                Pro tip: avoid coffee, tea, or red wine for 48 hours after treatment to lock in your shade.
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Ideal for
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  Surface and deeper stains from coffee, tea, wine, or aging
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  Events and photos when you want same-day brightness
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                  Patients who want professional oversight vs. DIY kits
                </li>
              </ul>
              <div className="mt-6 bg-[#F5F9FC] border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  If you have veneers, crowns, or bonding on front teeth, we&apos;ll review options to match or refresh your shade.
                </p>
              </div>
              <div className="mt-6">
                <Link href="/schedule#appointment">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">
                    Schedule ZOOM! whitening
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-3">
              Patients love their brighter smiles
            </h2>
            <p className="text-gray-600">Real feedback from patients who trust Dr. Wong for cosmetic care.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {whiteningTestimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-blue-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className={`h-4 w-4 ${i < testimonial.rating ? "fill-current" : ""}`} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">“{testimonial.text}”</p>
                <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedServices
        items={relatedServices}
        title="Related services"
        subtitle="Pair whitening with these popular treatments."
        className="bg-[#F5F9FC]"
      />

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
            Ready for a brighter smile?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            Book your ZOOM! teeth whitening visit in Palo Alto. We&apos;ll confirm you&apos;re a good candidate and set a shade goal that looks natural on you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule#appointment">
              <Button className="bg-primary text-white hover:bg-primary/90 px-6 py-3 font-semibold shadow-sm">
                Schedule now
              </Button>
            </Link>
            <Link href="/services">
              <Button className="bg-white/10 text-white border border-white/70 hover:bg-white/20 px-6 py-3 font-semibold">
                Explore other services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ZoomWhitening;
