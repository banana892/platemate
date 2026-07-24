import React from 'react'

export function LoadingSpinner({ size = 'md', label = 'Loading...', className = '', center = true }) {
  const sizes = {
    sm: 'h-4 w-4 stroke-[3]',
    md: 'h-8 w-8 stroke-[3]',
    lg: 'h-12 w-12 stroke-[3]',
    xl: 'h-16 w-16 stroke-[2]',
  }

  const content = (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <svg
        className={`animate-spin text-[#FF4F5A] ${sizes[size] || sizes.md}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )

  if (center) {
    return <div className="min-h-[200px] w-full flex items-center justify-center p-6">{content}</div>
  }

  return content
}

export default LoadingSpinner
