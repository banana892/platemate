import React from 'react'

export const Switch = React.forwardRef(function Switch(
  { label, id, checked = false, onChange, disabled = false, className = '', containerClassName = '', ...props },
  ref
) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${containerClassName}`}
    >
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>}
      <div className="relative inline-block w-11 h-6 align-middle select-none">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          id={switchId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`block w-11 h-6 rounded-full transition-colors duration-200 ${
            checked ? 'bg-[#FF4F5A]' : 'bg-gray-300 dark:bg-slate-700'
          } ${className}`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
            checked ? 'transform translate-x-5' : ''
          }`}
        ></div>
      </div>
    </label>
  )
})

export default Switch
