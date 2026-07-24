import React from 'react'

export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    id,
    error,
    helperText,
    rows = 4,
    className = '',
    containerClassName = '',
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus-ring disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 focus:border-[#FF4F5A]'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Textarea
