import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination Navigation">
      {/* Prev */}
      <button
        type="button"
        aria-label="Go to previous page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-card transition-smooth hover:text-[#FF4F5A] focus-ring disabled:opacity-40 disabled:hover:text-gray-600 disabled:cursor-not-allowed"
      >
        <FiChevronLeft aria-hidden="true" />
      </button>

      {/* Pages */}
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-gray-500 select-none">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-smooth focus-ring ${
              currentPage === page
                ? 'gradient-bg text-white shadow-glow'
                : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-card hover:text-[#FF4F5A]'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        aria-label="Go to next page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-card transition-smooth hover:text-[#FF4F5A] focus-ring disabled:opacity-40 disabled:hover:text-gray-600 disabled:cursor-not-allowed"
      >
        <FiChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}

export default Pagination
