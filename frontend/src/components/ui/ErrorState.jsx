import React from 'react'

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center text-xl font-bold mb-3">
        ⚠️
      </div>
      <h3 className="text-base font-bold text-red-900 dark:text-red-200 mb-1">{title}</h3>
      <p className="text-xs text-red-600 dark:text-red-300 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-700 transition-all shadow-sm focus-ring"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorState
