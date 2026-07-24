/**
 * ReviewCard.jsx — Customer Review Card Component
 */

import { FiStar, FiCalendar, FiMessageSquare } from 'react-icons/fi'

export default function ReviewCard({ review }) {
  if (!review) return null

  const customerName = review.user?.name || review.customerName || 'Anonymous Customer'
  const rating = review.rating || 5
  const comment = review.comment || review.reviewText || 'Great food and fast delivery!'
  const dateStr = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-smooth space-y-3">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            {customerName[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{customerName}</h4>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiCalendar className="text-gray-300 text-[0.65rem]" />
              <span>{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 text-xs font-bold">
          <FiStar className="fill-current text-amber-500 text-xs" />
          <span>{rating}.0</span>
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-700 leading-relaxed font-normal bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
        "{comment}"
      </p>

      {/* Response Placeholder */}
      {review.reply && (
        <div className="ml-4 pl-4 border-l-2 border-orange-400 space-y-1 text-xs pt-1">
          <div className="flex items-center gap-1.5 font-bold text-orange-600">
            <FiMessageSquare />
            <span>Owner Response:</span>
          </div>
          <p className="text-gray-600 italic">{review.reply}</p>
        </div>
      )}
    </div>
  )
}
