import { useState, useEffect, useRef } from 'react';
import CustomGoogleReviews from './CustomGoogleReviews';

interface GoogleReviewsWidgetProps {
  className?: string;
}

/**
 * Google Reviews Widget component that embeds the Elfsight Google Reviews widget
 * This component handles the proper loading of the Elfsight script with error handling
 * and provides a fallback UI in case the widget fails to load
 */
const GoogleReviewsWidget = ({ className = '' }: GoogleReviewsWidgetProps) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // We're deliberately bypassing the Elfsight widget due to runtime errors
  // and using our custom component directly
  return <CustomGoogleReviews className={className} />;
  
  /* Commented out due to runtime errors with the Elfsight widget
  useEffect(() => {
    // Create script element for Elfsight platform
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    script.defer = true;
    
    // Error handling for script load failure
    script.onerror = () => {
      console.error('Failed to load Elfsight widget script');
      setHasError(true);
      setIsLoading(false);
    };
    
    // Set loading state to false once script has loaded
    script.onload = () => {
      setIsLoading(false);
    };
    
    // Check if script is already in the document
    const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
    
    if (!existingScript) {
      // Add the script if it doesn't exist
      document.body.appendChild(script);
    } else {
      // Script already exists, so we're not loading it again
      setIsLoading(false);
      
      // Try to reinitialize if ElfSight is available
      try {
        const w = window as any;
        if (w.ElfSight && typeof w.ElfSight.reinit === 'function') {
          w.ElfSight.reinit();
        }
      } catch (error) {
        console.error('Error reinitializing Elfsight widget:', error);
        setHasError(true);
      }
    }
    
    // Set a timeout to show fallback if widget takes too long to load
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Elfsight widget took too long to load');
        setIsLoading(false);
        setHasError(true);
      }
    }, 5000);
    
    // Error handling for runtime errors
    const handleError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('Elfsight') || 
        event.message.includes('ResizeObserver') ||
        event.filename?.includes('platform.js')
      )) {
        console.error('Caught Elfsight error:', event.message);
        setHasError(true);
      }
    };
    
    window.addEventListener('error', handleError);
    
    // Handle unhandled promise rejections related to the widget
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason.toString === 'function') {
        const reasonString = event.reason.toString();
        if (reasonString.includes('Elfsight') || reasonString.includes('ResizeObserver')) {
          console.error('Caught Elfsight promise rejection:', reasonString);
          setHasError(true);
        }
      }
    };
    
    window.addEventListener('unhandledrejection', handleRejection);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      clearTimeout(timeoutId);
    };
  }, [isLoading]);
  
  // Fallback UI for when the widget has an error
  if (hasError) {
    return <CustomGoogleReviews className={className} />;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`loading-container ${className} p-8 flex justify-center`}>
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }
  
  // Actual Elfsight widget
  return (
    <div className={`elfsight-google-reviews-container ${className}`} ref={widgetRef}>
      <div 
        className="elfsight-app-97536d24-590e-4a39-ae4c-c3fb469042f8" 
        data-elfsight-app-lazy
      ></div>
    </div>
  );
  */
};

export default GoogleReviewsWidget;