import React from 'react'
import { AlertCircle, X, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'error' | 'warning'
  className?: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
  variant = 'error',
  className = ''
}) => {
  const variantClasses = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  }

  const iconColor = {
    error: 'text-red-500',
    warning: 'text-yellow-500'
  }

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <AlertCircle className={`w-5 h-5 ${iconColor[variant]} mt-0.5 flex-shrink-0`} />
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center space-x-1 text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tentar Novamente</span>
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors"
                >
                  Dispensar
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-2 ${iconColor[variant]} hover:opacity-75 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage