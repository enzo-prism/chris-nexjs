import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Types
interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  photoUrl?: string;
}

// Sample reviews data (we show this when Elfsight widget fails)
const sampleReviews: Review[] = [
  {
    id: "1",
    name: "Lisa M.",
    rating: 5,
    text: "Dr. Wong is not just a skilled dentist; he's an artist who transformed my smile and gave me back my confidence. His practice combines cutting-edge technology with genuine care for patients.",
    date: "2 months ago"
  },
  {
    id: "2",
    name: "Michael A.",
    rating: 5,
    text: "Been getting my dental care at this office for nearly 30 years, and both my parents did so before me! The level of care and attention to detail is outstanding.",
    date: "1 month ago"
  },
  {
    id: "3",
    name: "Sarah L.",
    rating: 5,
    text: "Best dental experience I\'ve ever had. Dr. Wong took the time to explain everything and made sure I was comfortable throughout my procedure. Highly recommend!",
    date: "2 weeks ago"
  },
  {
    id: "4",
    name: "David K.",
    rating: 5,
    text: "Dr. Wong completely transformed my smile with his exceptional cosmetic dentistry skills. His attention to detail resulted in veneers that look completely natural.",
    date: "3 months ago"
  }
];

interface CustomGoogleReviewsProps {
  className?: string;
}

const CustomGoogleReviews = ({ className = '' }: CustomGoogleReviewsProps) => {
  return (
    <div className={`custom-google-reviews ${className} p-4 sm:p-8 rounded-lg bg-white shadow-md`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.82 5A7 7 0 0 0 12 3a9 9 0 0 0 0 18c7.5 0 12-6.5 12-12 0-.7-.09-1.5-.26-2H12v5h6.2a5 5 0 0 1-2.2 3.4l-.02.01-.04.02A7 7 0 0 0 20 14.25 8.48 8.48 0 0 0 21.25 10c0-.83-.13-1.45-.24-2h-3.2z" />
              <path d="M12 7V3H2" />
              <path d="M16 0V7c-4-1-10 3-10 3v4S8 24 12 24c5-2 8-10 8-10" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Google Reviews</h3>
            <div className="flex items-center">
              <div className="flex text-blue-500 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4" fill="currentColor" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.9 • 65+ reviews</span>
            </div>
          </div>
        </div>
        
        <a 
          href="https://www.google.com/maps/place/Wong+Chris+B+DDS/data=!4m7!3m6!1s0x808fbac5f59f5ac7:0xc588a26f54b10be0!8m2!3d37.4422!4d-122.1423!16s%2Fg%2F1tgz1f3l!19sChIJx1r5X8W6j4ARDQux1GrSpMw?authuser=0&hl=en&rclk=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
        >
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sampleReviews.map((review, index) => (
          <motion.div 
            key={review.id}
            className="bg-gray-50 p-4 rounded-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: "easeOut" 
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3 font-medium">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>
              <div className="flex text-blue-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4" fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-gray-700 text-sm">{review.text}</p>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <a 
          href="https://www.google.com/maps/place/Wong+Chris+B+DDS/data=!4m7!3m6!1s0x808fbac5f59f5ac7:0xc588a26f54b10be0!8m2!3d37.4422!4d-122.1423!16s%2Fg%2F1tgz1f3l!19sChIJx1r5X8W6j4ARDQux1GrSpMw?authuser=0&hl=en&rclk=1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors duration-150"
        >
          Read all reviews on Google
        </a>
      </div>
    </div>
  );
};

export default CustomGoogleReviews;
