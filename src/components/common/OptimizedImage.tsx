import React, { useState, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  fallbackSrc,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const imageProps = {
    src: hasError && fallbackSrc ? fallbackSrc : src,
    alt,
    className: `transition-opacity duration-300 ${className} ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' as const : loading,
    decoding: 'async' as const,
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div className="relative">
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      <img {...imageProps} />
    </div>
  );
};

export default OptimizedImage;