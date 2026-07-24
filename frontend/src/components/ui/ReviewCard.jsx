import { FiStar } from 'react-icons/fi'

import { formatRelativeTime } from '../../utils/formatters.js'

export default function ReviewCard({ review }) {
  const { userName, userAvatar, rating, text, date, likes } = review

  return (
    <div className="bg-white rounded-xl p-5 shadow-card transition-smooth hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
          {userAvatar || userName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{userName}</h4>
          <span className="text-xs text-gray-400">{formatRelativeTime(date)}</span>
        </div>
        <div className="bg-green-600 text-white text-xs font-bold py-0.5 px-2 rounded flex items-center gap-0.5 shrink-0">
          <FiStar className="text-[10px] fill-current" />
          {rating}
        </div>
      </div>

      {/* Text */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{text}</p>

      {/* Footer */}
      {likes !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
          <span>👍</span>
          <span>{likes} found this helpful</span>
        </div>
      )}
    </div>
  )
}
