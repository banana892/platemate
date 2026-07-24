import React from 'react'

export function Skeleton({ className = '', variant = 'text', count = 1 }) {
  const baseStyle = 'animate-shimmer bg-gray-200 dark:bg-slate-800 rounded-lg'

  const variants = {
    text: 'h-4 w-full',
    circular: 'w-10 h-10 rounded-full',
    rectangular: 'w-full h-32',
    card: 'w-full h-48 rounded-2xl',
    metric: 'w-full h-28 rounded-2xl',
    avatar: 'w-12 h-12 rounded-full',
  }

  const items = Array.from({ length: count })

  return (
    <div className="w-full space-y-3" role="status" aria-live="polite" aria-label="Loading content...">
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`${baseStyle} ${variants[variant] || ''} ${className}`}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Skeleton
