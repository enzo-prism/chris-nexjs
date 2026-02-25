import { useState, type CSSProperties, type SyntheticEvent } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  fit?: "cover" | "contain";
  style?: CSSProperties;
  useIntrinsicAspect?: boolean;
  objectPosition?: string;
  fetchPriority?: "high" | "low" | "auto";
}

const OptimizedImage = ({ 
  src, 
  alt, 
  srcSet,
  sizes,
  className = '', 
  width, 
  height, 
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  fit = "cover",
  style,
  useIntrinsicAspect = false,
  objectPosition = "center",
  fetchPriority
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (useIntrinsicAspect) {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      if (naturalWidth && naturalHeight) {
        setAspectRatio(naturalWidth / naturalHeight);
      }
    }
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  const wrapperStyle: CSSProperties = {
    ...style,
    ...(useIntrinsicAspect && aspectRatio ? { aspectRatio: `${aspectRatio}` } : {}),
    ...(useIntrinsicAspect && !aspectRatio ? { minHeight: 200 } : {}),
  };

  const objectClass =
    fit === "contain" ? "object-contain" : "object-cover";
  const heightClass =
    useIntrinsicAspect ? "h-full" : fit === "contain" ? "h-auto" : "h-full";

  return (
    <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          width={width ?? 1200}
          height={height ?? 900}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          style={{ objectPosition }}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        width={width ?? 1200}
        height={height ?? 900}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...(fetchPriority ? ({ fetchpriority: fetchPriority } as any) : {})}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full ${heightClass} ${objectClass} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectPosition }}
      />
    </div>
  );
};

export default OptimizedImage;
