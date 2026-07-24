import React from 'react'

export function EmptyState({
  icon = '🍽️',
  title = 'No items found',
  description = 'Try adjusting your search filters or check back later.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="text-5xl mb-3 animate-bounce-slow">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-95 transition-all shadow-md focus-ring"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
