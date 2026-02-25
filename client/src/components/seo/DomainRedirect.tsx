import { useEffect } from 'react';

/**
 * Client-side redirect component to handle www vs non-www redirects
 * This serves as a fallback for cases where server-side redirects aren't working
 */
const DomainRedirect = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const currentUrl = window.location;
    const hostname = currentUrl.hostname;
    
    // If we're on the non-www version of the production domain, redirect to www
    if (hostname === 'chriswongdds.com' && !hostname.startsWith('www.')) {
      const newUrl = `https://www.${hostname}${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
      
      // Use replace to avoid creating a history entry for the redirect
      window.location.replace(newUrl);
    }
  }, []);

  // This component doesn't render anything
  return null;
};

export default DomainRedirect;