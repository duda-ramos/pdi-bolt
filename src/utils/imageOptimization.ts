// Image optimization utilities

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  lazy?: boolean
}

// Generate optimized image URL for Pexels
export const getOptimizedPexelsUrl = (
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string => {
  const { width, height, quality = 80 } = options
  
  // Extract photo ID from Pexels URL
  const photoIdMatch = originalUrl.match(/photos\/(\d+)/)
  if (!photoIdMatch) return originalUrl
  
  const photoId = photoIdMatch[1]
  let optimizedUrl = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg`
  
  const params = new URLSearchParams()
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  params.append('auto', 'compress')
  params.append('cs', 'tinysrgb')
  
  if (params.toString()) {
    optimizedUrl += `?${params.toString()}`
  }
  
  return optimizedUrl
}

// Generate responsive image srcSet
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${getOptimizedPexelsUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ')
}

// Lazy loading intersection observer
export const createLazyLoadObserver = (
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry)
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1
    }
  )
}

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// Image compression utility (for user uploads)
export const compressImage = (
  file: File, 
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Check if WebP is supported
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}