import { Heart, Star, Users, type LucideIcon } from "lucide-react";
import { FeatureIcon } from "@/components/common/FeatureIcon";

const FeaturesSection = () => {
  const features: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: Star,
      title: "Exceptional Results",
      description: "Our patients consistently achieve outstanding outcomes through our personalized care approach and attention to detail.",
    },
    {
      icon: Heart,
      title: "Patient-First Experience",
      description: "Every aspect of your visit is designed with your comfort and satisfaction in mind, from scheduling to treatment.",
    },
    {
      icon: Users,
      title: "Community-Loved Team",
      description: "Our dedicated team has earned the trust and affection of the local community through years of compassionate service.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 text-balance mb-4">
            Why Choose Dr. Wong
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Discover a dental practice committed to exceptional service, outstanding results, and a patient experience that has earned the trust of our community
          </p>
        </div>

        {/* Features grid with clean, minimal styling */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-reveal group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow md:p-8"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <FeatureIcon
                icon={feature.icon}
                size="lg"
                className="mb-5 transition-transform duration-300 group-hover:-translate-y-0.5"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
