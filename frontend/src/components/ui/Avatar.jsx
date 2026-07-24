import React, { useState } from 'react'

export function Avatar({ src, name = 'User', size = 'md', isOnline = false, className = '' }) {
  const [imgError, setImgError] = useState(false)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className={`relative inline-block ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          loading="lazy"
          className={`${sizes[size] || sizes.md} rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full gradient-bg text-white font-bold flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm`}
        >
          {initials}
        </div>
      )}
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
          title="Online"
        />
      )}
    </div>
  )
}

export default Avatar
