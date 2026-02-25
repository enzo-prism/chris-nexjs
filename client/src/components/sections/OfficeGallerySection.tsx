import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X, ImageIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '@/components/seo/OptimizedImage';

const OfficeGallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Gallery images using Imgur URLs from imageUrls.ts
  const images = [
    {
      src: 'https://i.imgur.com/BeX3mhS.png', // Top Left
      alt: 'Reception Area with Dentist',
      description: 'Our dentist standing near the reception desk, welcoming patients to our practice.'
    },
    {
      src: 'https://i.imgur.com/sW9DVZF.png', // Top Middle
      alt: 'Garden Courtyard View',
      description: 'A serene garden courtyard visible through glass windows, creating a calming environment.'
    },
    {
      src: 'https://i.imgur.com/gqotbUv.png', // Top Right
      alt: 'Courtyard from Operatory View',
      description: 'A unique perspective of our courtyard, viewed from inside the building.'
    },
    {
      src: 'https://i.imgur.com/hYHYbBq.png', // Middle Left
      alt: 'Exterior Hallway View',
      description: 'A glass-walled corridor overlooking the courtyard, with a clear view of interior rooms.'
    },
    {
      src: 'https://i.imgur.com/nGlhUdH.png', // Middle Center
      alt: 'Exterior Signage and Entryway',
      description: 'The front entrance with professional signage indicating our dental practice and beautiful landscaping.'
    },
    {
      src: 'https://i.imgur.com/AC5lGu3.png', // Middle Right
      alt: 'Operatory Room',
      description: 'Our dentist in a state-of-the-art operatory room with modern dental equipment for patient treatment.'
    },
    {
      src: 'https://i.imgur.com/qK5nPtS.png', // Bottom Left
      alt: 'Historical Photos',
      description: 'Displayed signed photos of our dentist, providing a personal touch to our practice.'
    },
    {
      src: 'https://i.imgur.com/bUkVVSo.png', // Bottom Center
      alt: 'Dental Operatory Equipment',
      description: 'Close-up of our advanced dental chairs and equipment within a treatment room.'
    },
    {
      src: 'https://i.imgur.com/rIGaK9S.png', // Bottom Right
      alt: 'Reception Desk',
      description: 'Our modern reception area with wood paneling and a welcoming front desk for patient check-in.'
    },
  ];

  const handleNext = () => {
    if (selectedImage === null) return;
    const nextIndex = (selectedImage + 1) % images.length;
    setSelectedImage(nextIndex);
  };

  const handlePrevious = () => {
    if (selectedImage === null) return;
    const prevIndex = (selectedImage - 1 + images.length) % images.length;
    setSelectedImage(prevIndex);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedImage === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          closeModal();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Add overflow hidden to body when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);
  
  // Touch event handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <>
      <section className="py-16 md:py-24 bg-gray-50" id="office-gallery">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with minimal styling */}
          <motion.div 
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Our Office
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Experience our modern, comfortable dental office designed with your relaxation and care in mind.
            </p>
          </motion.div>
          
          {/* Gallery grid with consistent spacing and minimal shadows */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {images.map((image, index) => (
              <motion.div 
                key={index} 
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                whileHover={{ y: -3 }}
                onClick={() => setSelectedImage(index)}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Image container sized to the photo */}
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={image.src}
                    alt={image.alt}
                    className="w-full aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                    priority={index < 4}
                  />
                  
                  {/* Subtle overlay with consistent branding */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal with cleaner styling */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Close button with better positioning */}
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10 transition-colors"
              onClick={closeModal}
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation buttons with consistent styling */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-4 md:px-8">
              <button 
                className="hidden sm:flex bg-white/10 hover:bg-white/20 p-3 rounded-full text-white/80 hover:text-white transition-colors"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <button 
                className="hidden sm:flex bg-white/10 hover:bg-white/20 p-3 rounded-full text-white/80 hover:text-white transition-colors"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Image and caption container with improved animation */}
            <motion.div 
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <OptimizedImage
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                className="max-h-[70vh] w-full object-contain mx-auto rounded-lg"
                priority
              />
              {/* Mobile instruction with subtle styling */}
              <p className="text-gray-400 text-xs text-center mt-6 sm:hidden">
                Swipe left or right to navigate
              </p>

              {/* Image counter with minimal styling */}
              <div className="text-gray-400 text-xs text-center mt-4 md:mt-6">
                {selectedImage + 1} / {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfficeGallerySection;
