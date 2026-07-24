import React from 'react'

export const Input = React.forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    helperText,
    leftIcon,
    rightIcon,
    onClear,
    value,
    className = '',
    containerClassName = '',
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus-ring disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon || onClear ? 'pr-10' : ''} ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 focus:border-[#FF4F5A]'
          } ${className}`}
          {...props}
        />
        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none p-1 rounded-full"
            aria-label="Clear input"
          >
            ✕
          </button>
        )}
        {!onClear && rightIcon && (
          <div className="absolute right-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-red-500 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
