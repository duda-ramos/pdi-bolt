import { useState, useCallback } from 'react'

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
  timestamp: Date
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([])

  const logError = useCallback((error: Error | string, code?: string, details?: any) => {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code,
      details,
      timestamp: new Date()
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorInfo)
      if (typeof error === 'object' && error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }

    // Add to error list
    setErrors(prev => [errorInfo, ...prev.slice(0, 9)]) // Keep last 10 errors

    // In production, you could send to error tracking service
    if (import.meta.env.PROD) {
      // Example: sendToErrorTracking(errorInfo)
    }
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const removeError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index))
  }, [])

  return {
    errors,
    logError,
    clearErrors,
    removeError
  }
}

// Global error handler for unhandled errors
export const setupGlobalErrorHandler = (logError: (error: Error | string, code?: string, details?: any) => void) => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'UNHANDLED_PROMISE_REJECTION', {
      promise: event.promise
    })
  })

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, 'JAVASCRIPT_ERROR', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}