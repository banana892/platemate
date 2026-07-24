/**
 * ReviewsPage.jsx — Restaurant Reviews & Customer Ratings Page (/partner/reviews)
 */

import { useEffect, useState, useMemo } from 'react'
import RatingSummary from '../../../components/partner/RatingSummary.jsx'
import ReviewCard from '../../../components/partner/ReviewCard.jsx'
import FilterBar from '../../../components/partner/FilterBar.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useReviews from '../../../hooks/useReviews.js'
import useRestaurant from '../../../hooks/useRestaurant.js'

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'NEWEST' },
  { label: 'Highest Rating', value: 'HIGHEST' },
  { label: 'Lowest Rating', value: 'LOWEST' },
]

export default function ReviewsPage() {
  const { restaurant } = useRestaurant()
  const { reviews = [], loadingReviews, fetchReviews } = useReviews()
  const [sortFilter, setSortFilter] = useState('NEWEST')

  useEffect(() => {
    fetchReviews(restaurant?.slug || restaurant?.id || '').catch(() => {})
  }, [fetchReviews, restaurant])

  const sortedReviews = useMemo(() => {
    const list = [...(reviews || [])]
    if (sortFilter === 'HIGHEST') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    if (sortFilter === 'LOWEST') {
      return list.sort((a, b) => (a.rating || 0) - (b.rating || 0))
    }
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [reviews, sortFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-extrabold text-gray-900">Customer Reviews & Ratings</h2>
        <p className="text-sm text-gray-500">Monitor customer feedback, ratings distribution, and store reviews</p>
      </div>

      {/* Rating Summary Breakdown */}
      <RatingSummary
        avgRating={restaurant?.rating || restaurant?.avgRating || 4.8}
        totalReviews={reviews?.length || 0}
      />

      {/* Toolbar Filter */}
      <div className="flex justify-between items-center pt-4">
        <h3 className="text-lg font-bold text-gray-900">Customer Feedback</h3>
        <FilterBar options={SORT_OPTIONS} selected={sortFilter} onSelect={setSortFilter} />
      </div>

      {/* Loading Skeleton */}
      {loadingReviews && (
        <Skeleton variant="card" className="h-36" count={3} />
      )}

      {/* Reviews List */}
      {!loadingReviews && sortedReviews.length === 0 && (
        <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm font-bold text-gray-700">No Reviews Available</p>
          <p className="text-xs text-gray-400">Customer reviews for your food deliveries will be displayed here.</p>
        </div>
      )}

      {!loadingReviews && sortedReviews.length > 0 && (
        <div className="space-y-4">
          {sortedReviews.map((rev, idx) => (
            <ReviewCard key={rev.id || idx} review={rev} />
          ))}
        </div>
      )}
    </div>
  )
}
