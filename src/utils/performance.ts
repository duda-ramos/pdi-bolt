// Performance monitoring utilities

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  type: 'timing' | 'counter' | 'gauge'
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    this.setupObservers()
  }

  private setupObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart, 'timing')
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, 'timing')
              this.recordMetric('first_paint', navEntry.loadEventEnd - navEntry.fetchStart, 'timing')
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error)
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('largest_contentful_paint', entry.startTime, 'timing')
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (error) {
        console.warn('LCP observer not supported:', error)
      }

      // Observe cumulative layout shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.recordMetric('cumulative_layout_shift', clsValue, 'gauge')
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (error) {
        console.warn('CLS observer not supported:', error)
      }
    }
  }

  recordMetric(name: string, value: number, type: PerformanceMetric['type'] = 'gauge') {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      type
    }

    this.metrics.push(metric)

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`Performance metric: ${name} = ${value}${type === 'timing' ? 'ms' : ''}`)
    }

    // In production, send to analytics service
    if (import.meta.env.PROD) {
      // Example: sendToAnalytics(metric)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  clearMetrics() {
    this.metrics = []
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions
export const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    performanceMonitor.recordMetric(name, duration, 'timing')
    return result
  } catch (error) {
    const duration = performance.now() - start
    performanceMonitor.recordMetric(`${name}_error`, duration, 'timing')
    throw error
  }
}

export const measureSync = <T>(name: string, fn: () => T): T => {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    performanceMonitor.recordMetric(name, duration, 'timing')
    return result
  } catch (error) {
    const duration = performance.now() - start
    performanceMonitor.recordMetric(`${name}_error`, duration, 'timing')
    throw error
  }
}

// React hook for performance monitoring
export const usePerformanceMetric = (name: string) => {
  const recordMetric = (value: number, type: PerformanceMetric['type'] = 'gauge') => {
    performanceMonitor.recordMetric(name, value, type)
  }

  return { recordMetric }
}