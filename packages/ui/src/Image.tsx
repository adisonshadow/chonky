import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ChonkyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  lazyLoad?: boolean;
  optimizedSrc?: string;
  quality?: number;
  onOptimize?: (info: ImageOptimizeInfo) => void;
}

export interface ImageOptimizeInfo {
  originalSrc: string;
  optimizedSrc: string | null;
  width: number;
  height: number;
  format: string;
  originalSize?: number;
  optimizedSize?: number;
}

export function Image({
  src,
  fallbackSrc,
  lazyLoad = true,
  optimizedSrc,
  quality,
  onOptimize,
  alt = '',
  ...rest
}: ChonkyImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(optimizedSrc ?? src ?? '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setCurrentSrc(optimizedSrc ?? src ?? '');
    setIsLoaded(false);
    setHasError(false);
  }, [src, optimizedSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (onOptimize && imgRef.current) {
      onOptimize({
        originalSrc: src ?? '',
        optimizedSrc: optimizedSrc ?? null,
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
        format: detectFormat(currentSrc),
      });
    }
  }, [onOptimize, src, optimizedSrc, currentSrc]);

  const handleError = useCallback(() => {
    if (!hasError && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    }
  }, [hasError, fallbackSrc]);

  useEffect(() => {
    if (!lazyLoad || !imgRef.current) return;
    if (typeof IntersectionObserver === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazyLoad]);

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      loading={lazyLoad ? 'lazy' : undefined}
      data-chonky-image
      data-chonky-loaded={isLoaded}
      data-chonky-quality={quality}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );
}

function detectFormat(url: string): string {
  const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
  const formatMap: Record<string, string> = {
    jpg: 'jpeg',
    jpeg: 'jpeg',
    png: 'png',
    gif: 'gif',
    webp: 'webp',
    avif: 'avif',
    svg: 'svg+xml',
  };
  return formatMap[ext ?? ''] ?? 'unknown';
}
