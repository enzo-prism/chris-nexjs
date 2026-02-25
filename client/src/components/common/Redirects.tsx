import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * This component handles redirects for legacy URLs or specific paths
 * that should be redirected to the homepage or other pages
 */
const Redirects = () => {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // More targeted redirect logic
    if (location.startsWith('/post/')) {
      // Blog post URLs should go to blog detail page
      const blogSlug = location.replace('/post/', '');
      console.log(`Redirecting from ${location} to /blog/${blogSlug}`);
      setLocation(`/blog/${blogSlug}`);
      return;
    }
    
    // Specific redirects for different URL patterns
    if (location === '/dr-kris-hamamoto' || location === '/dr-chris-wong') {
      console.log(`Redirecting from ${location} to /about`);
      setLocation('/about');
      return;
    }
    
    if (location === '/about-us') {
      console.log(`Redirecting from ${location} to /about`);
      setLocation('/about');
      return;
    }
    
    if (location === '/our-services' || location === '/general-dentistry') {
      console.log(`Redirecting from ${location} to /services`);
      setLocation('/services');
      return;
    }
    
    // In the image, we don't need this as the URL matches our existing route
    // but keeping it for completeness in case the URL structure changes
    if (location === '/testimonials') {
      console.log(`URL ${location} already exists - no redirect needed`);
      // No redirect needed as this path exists
      return;
    }
    
    if (location.startsWith('/services/')) {
      // Service detail URLs should go to services page with anchor
      const serviceSlug = location.replace('/services/', '');
      console.log(`Redirecting from ${location} to /services#${serviceSlug}`);
      setLocation(`/services#${serviceSlug}`);
      return;
    }
    
    // Handle '/blog' URL (just for clarity, though this path already exists)
    if (location === '/blog') {
      console.log(`URL ${location} already exists - no redirect needed`);
      // No redirect needed as this path exists
      return;
    }
    
    // These are URLs from the screenshot that need redirection
    const legacyUrls = [
      '/post/dental-implants-palo-alto',
      '/post/palo-alto-dental-implants-vs-dentures',
      '/post/ai-powered-dental-tools-patient-care-2024',
      '/post/finding-right-dentist-palo-alto',
      '/post/what-to-do-if-you-lose-a-filling',
      '/post/dental-checkups-palo-alto',
      '/post/teledentistry-virtual-dental-consultations-palo-alto'
    ];
    
    // If we still have URLs that haven't been caught by the rules above
    if (legacyUrls.includes(location)) {
      console.log(`Redirecting legacy URL ${location} to /blog`);
      setLocation('/blog');
      return;
    }
    
  }, [location, setLocation]);

  return null; // This component doesn't render anything
};

export default Redirects;
