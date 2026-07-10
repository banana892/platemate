import { FiStar } from 'react-icons/fi'

export default function Rating({ value, count, size = 'sm', showCount = true }) {
  const fullStars = Math.floor(value)
  const hasHalf = value - fullStars >= 0.5

  const sizeClasses = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const textClasses = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`${sizeClasses[size]} ${
              i < fullStars
                ? 'text-amber-400 fill-amber-400'
                : i === fullStars && hasHalf
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className={`${textClasses[size]} text-gray-500 font-medium`}>
          {value} ({count})
        </span>
      )}
    </div>
  )
}
