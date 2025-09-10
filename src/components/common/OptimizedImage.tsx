import React, { useState, useRef, useEffect } from 'react'
import { getOptimizedPexelsUrl, generateSrcSet, createLazyLoadObserver } from '../../utils/imageOptimization'
import LoadingSpinner from './LoadingSpinner'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  lazy?: boolean
  quality?: number
  sizes?: string
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  quality = 80,
  sizes = '100vw',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (lazy && imgRef.current && !shouldLoad) {
      observerRef.current = createLazyLoadObserver(() => {
        setShouldLoad(true)
        if (observerRef.current && imgRef.current) {
          observerRef.current.unobserve(imgRef.current)
        }
      })
      
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [lazy, shouldLoad])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setIsError(true)
    onError?.()
  }

  // Generate optimized URLs
  const optimizedSrc = getOptimizedPexelsUrl(src, { width, height, quality })
  const srcSet = generateSrcSet(src, [320, 640, 960, 1280, 1920])

  if (isError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Erro ao carregar imagem</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      {shouldLoad && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
      
      {lazy && !shouldLoad && (
        <div 
          className={`bg-gray-200 ${className}`}
          style={{ width, height }}
        />
      )}
    </div>
  )
}

export default OptimizedImage