import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  className?: string;
  wrapperClassName?: string;
}

const DEFAULT_FALLBACK = 'https://images.pexels.com/photos/11112057/pexels-photo-11112057.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function LazyImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  aspectRatio,
  className = '',
  wrapperClassName = '',
  loading = 'lazy',
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const currentSrc = error ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden bg-[#F2ECE4] dark:bg-[#1E171C] ${aspectRatio || ''} ${wrapperClassName}`}>
      {/* Shimmer skeleton before image is loaded */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 dark:from-[#241A22] dark:via-[#332530] dark:to-[#241A22] animate-pulse" />
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) setError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'
        } ${className}`}
        {...props}
      />
    </div>
  );
}
