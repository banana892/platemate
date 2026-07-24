import React from 'react'

export const Checkbox = React.forwardRef(function Checkbox(
  { label, id, checked, onChange, disabled = false, className = '', containerClassName = '', ...props },
  ref
) {
  const checkboxId = id || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${containerClassName}`}
    >
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-[#FF4F5A] focus:ring-[#FF4F5A] accent-[#FF4F5A] transition-all cursor-pointer ${className}`}
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  )
})

export default Checkbox
