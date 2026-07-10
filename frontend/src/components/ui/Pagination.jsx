import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
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
    <nav className="flex items-center justify-center gap-2 mt-10">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 bg-white shadow-card transition-smooth hover:text-[#FF4F5A] hover:shadow-card-hover disabled:opacity-40 disabled:hover:text-gray-600 disabled:cursor-not-allowed"
      >
        <FiChevronLeft />
      </button>

      {/* Pages */}
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-smooth ${
              currentPage === page
                ? 'gradient-bg text-white shadow-glow'
                : 'text-gray-600 bg-white shadow-card hover:text-[#FF4F5A] hover:shadow-card-hover'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 bg-white shadow-card transition-smooth hover:text-[#FF4F5A] hover:shadow-card-hover disabled:opacity-40 disabled:hover:text-gray-600 disabled:cursor-not-allowed"
      >
        <FiChevronRight />
      </button>
    </nav>
  )
}
