import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ArrowRight } from 'lucide-react';
import ButtonLink from "@/components/common/ButtonLink";
import GalleryTile from "@/components/gallery/GalleryTile";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { galleryItems } from "@/data/galleryMedia";

const OfficeGallerySection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Curate a subset of items for the about page - focus on 'Our Space'
  const featuredItems = galleryItems
    .filter(item => item.category === "Our Space")
    .slice(0, 6);

  return (
    <>
      <section className="py-20 sm:py-32 bg-slate-50/50" id="office-gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-16">
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 ring-1 ring-inset ring-blue-600/10 mb-6">
                <Camera className="h-3.5 w-3.5" />
                Our Environment
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                Designed for your <span className="text-blue-600">Comfort</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                We've created a modern, tranquil space where you can feel at ease. 
                Experience a dental visit that feels like a breath of fresh air.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <ButtonLink 
                href="/gallery" 
                variant="outline" 
                className="rounded-full group px-8 h-12 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
              >
                Explore Full Gallery
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
            </motion.div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {featuredItems.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <GalleryTile
                  item={item}
                  onOpen={() => {
                    const originalIndex = galleryItems.findIndex(gi => gi.id === item.id);
                    setActiveIndex(originalIndex);
                  }}
                  className="aspect-[4/3]"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <GalleryLightbox
        items={galleryItems}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onChange={setActiveIndex}
      />
    </>
  );
};

export default OfficeGallerySection;
