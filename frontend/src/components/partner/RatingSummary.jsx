/**
 * RatingSummary.jsx — Rating Score & Distribution Summary Component
 */

import { FiStar } from 'react-icons/fi'

export default function RatingSummary({ avgRating = 4.8, totalReviews = 124, distribution = null }) {
  const defaultDist = [
    { stars: 5, count: 92 },
    { stars: 4, count: 21 },
    { stars: 3, count: 7 },
    { stars: 2, count: 3 },
    { stars: 1, count: 1 },
  ]

  const distList = distribution || defaultDist
  const maxCount = Math.max(...distList.map((d) => d.count), 1)

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center gap-8">
      {/* Score Block */}
      <div className="text-center sm:border-r sm:border-gray-100 sm:pr-8 flex-shrink-0">
        <div className="text-5xl font-black text-gray-900 mb-1">{avgRating}</div>
        <div className="flex items-center justify-center gap-1 text-amber-400 text-lg mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <FiStar key={s} className="fill-current" />
          ))}
        </div>
        <p className="text-xs text-gray-400 font-semibold">{totalReviews} Customer Reviews</p>
      </div>

      {/* Progress Bars */}
      <div className="flex-grow w-full space-y-2">
        {distList.map((item) => {
          const pct = Math.round((item.count / maxCount) * 100)
          return (
            <div key={item.stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                {item.stars} <FiStar className="text-amber-400 fill-current text-[0.65rem]" />
              </span>
              <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right font-semibold text-gray-400">{item.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
