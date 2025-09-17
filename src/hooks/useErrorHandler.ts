import { useState, useCallback } from 'react'
import { captureError, captureMessage, isInitialized } from '../lib/sentry'

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

    // Capturar no Sentry
    if (typeof error === 'string') {
      captureMessage(error, 'error', { code, details });
    } else {
      captureError(error, { code, details });
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
export const setupGlobalErrorHandler = () => {
  const logGlobalError = (error: Error | string, code?: string, details?: any) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Global error logged:', { error, code, details })
      if (typeof error === 'object' && error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }

    // Capturar no Sentry se estiver inicializado
    if (isInitialized()) {
      if (typeof error === 'string') {
        captureMessage(error, 'error', { code, details });
      } else {
        captureError(error, { code, details });
      }
    }
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    logGlobalError(event.reason, 'UNHANDLED_PROMISE_REJECTION', {
      promise: event.promise
    })
  })

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('🚨 JavaScript Error:', event.error || event.message);
    logGlobalError(event.error || event.message, 'JAVASCRIPT_ERROR', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
}