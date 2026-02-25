import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Testimonial } from "@shared/schema";
import { motion } from "framer-motion";

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
  disableAnimation?: boolean;
}

const TestimonialCard = ({ testimonial, index = 0, disableAnimation = false }: TestimonialCardProps) => {
  const { name, rating, text, image } = testimonial;
  const gradients = [
    "from-[#EEF5FF] to-white",
    "from-[#F3F7FF] to-white",
    "from-[#F5F9FF] to-white",
    "from-[#EFF6FF] to-white",
  ];
  const gradientClass = gradients[index % gradients.length];
  const hasImage = Boolean(image && image.trim().length > 0);

  const content = (
    <Card className="h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} aria-hidden="true" />
      <div className="absolute -top-8 -right-8 text-primary/5">
        <Quote className="w-28 h-28" strokeWidth={1} />
      </div>

      <CardContent className="p-6 sm:p-7 relative z-10">
        <div className="flex items-center justify-end mb-4 text-blue-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 ml-0.5"
              fill={i < rating ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          ))}
        </div>

        <p className="text-gray-700 mb-6 text-sm sm:text-base leading-relaxed">
          "{text}"
        </p>

        <div className="flex items-center">
          {hasImage ? (
            <img
              src={image}
              alt={name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover mr-3 border border-white/60 shadow-sm"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full mr-3 flex items-center justify-center font-medium text-white bg-gradient-to-br from-primary to-primary/70 shadow-sm uppercase"
              aria-label={`Avatar for ${name}`}
            >
              {name.charAt(0)}
            </div>
          )}
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{name}</h4>
        </div>
      </CardContent>
    </Card>
  );

  if (disableAnimation) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {content}
    </motion.div>
  );
};

export default TestimonialCard;
