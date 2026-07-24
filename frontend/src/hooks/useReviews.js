/**
 * useReviews.js — Custom Hook for Partner Restaurant Reviews
 */

import { useState, useCallback } from 'react'
import analyticsService from '../services/analytics.service.js'

export function useReviews() {
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  const fetchReviews = useCallback(async (slugOrId = '') => {
    setLoadingReviews(true)
    try {
      const data = await analyticsService.getReviews(slugOrId)
      const list = Array.isArray(data) ? data : (data?.recentReviews || data?.reviews || [])
      setReviews(list)
      return list
    } catch (_err) {
      setReviews([])
      return []
    } finally {
      setLoadingReviews(false)
    }
  }, [])

  return {
    reviews,
    loadingReviews,
    fetchReviews,
  }
}

export default useReviews
