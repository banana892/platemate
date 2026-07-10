import { useSelector, useDispatch } from 'react-redux'
import { setFilters, setSearchQuery, resetFilters } from '../../store/slices/restaurantSlice.js'
import RestaurantCard from '../../components/ui/RestaurantCard.jsx'
import SearchBar from '../../components/ui/SearchBar.jsx'
import { CardSkeleton } from '../../components/ui/Loading.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import { SORT_OPTIONS, CUISINE_FILTERS } from '../../utils/constants.js'
import { useState } from 'react'
import { FiFilter, FiX, FiSliders } from 'react-icons/fi'

const ITEMS_PER_PAGE = 8

export default function Restaurants() {
  const dispatch = useDispatch()
  const { filteredList, filters } = useSelector(state => state.restaurants)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE)
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleCuisineToggle = (cuisine) => {
    const current = filters.cuisine
    const updated = current.includes(cuisine)
      ? current.filter(c => c !== cuisine)
      : [...current, cuisine]
    dispatch(setFilters({ cuisine: updated }))
    setCurrentPage(1)
  }

  const handleSort = (sortBy) => {
    dispatch(setFilters({ sortBy }))
    setCurrentPage(1)
  }

  const handleReset = () => {
    dispatch(resetFilters())
    setCurrentPage(1)
  }

  const activeFilterCount = filters.cuisine.length + (filters.vegOnly ? 1 : 0) + (filters.rating ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#f8f9ff] pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-2">
            Restaurants Near You
          </h1>
          <p className="text-gray-500">{filteredList.length} restaurants found</p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar variant="inline" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl border transition-smooth text-sm font-medium ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#FF4F5A] text-[#FF4F5A] bg-[#FF4F5A]/5'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-[#FF4F5A] hover:text-[#FF4F5A]'
              }`}
            >
              <FiSliders />
              Filters
              {activeFilterCount > 0 && (
                <span className="gradient-bg text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={filters.sortBy}
              onChange={e => handleSort(e.target.value)}
              className="py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium outline-none transition-smooth focus:border-[#FF4F5A] cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 shadow-card mb-8 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={handleReset}
                className="text-sm text-[#FF4F5A] font-medium hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Cuisine Filters */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Cuisine</h4>
              <div className="flex flex-wrap gap-2">
                {CUISINE_FILTERS.map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => handleCuisineToggle(cuisine)}
                    className={`py-1.5 px-4 rounded-full text-sm font-medium transition-smooth ${
                      filters.cuisine.includes(cuisine)
                        ? 'gradient-bg text-white shadow-glow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => dispatch(setFilters({ vegOnly: !filters.vegOnly }))}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-smooth ${
                  filters.vegOnly
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-gray-200 text-gray-600 hover:border-green-500'
                }`}
              >
                🥬 Pure Veg
              </button>
              {[4.0, 3.5].map(r => (
                <button
                  key={r}
                  onClick={() => dispatch(setFilters({ rating: filters.rating === r ? null : r }))}
                  className={`py-2 px-4 rounded-xl text-sm font-medium border transition-smooth ${
                    filters.rating === r
                      ? 'border-[#FF4F5A] text-[#FF4F5A] bg-[#FF4F5A]/5'
                      : 'border-gray-200 text-gray-600 hover:border-[#FF4F5A]'
                  }`}
                >
                  ⭐ {r}+
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {filters.cuisine.map(c => (
              <span
                key={c}
                className="flex items-center gap-1 bg-[#FF4F5A]/10 text-[#FF4F5A] text-sm font-medium py-1 px-3 rounded-full"
              >
                {c}
                <button onClick={() => handleCuisineToggle(c)}>
                  <FiX className="text-xs" />
                </button>
              </span>
            ))}
            {filters.vegOnly && (
              <span className="flex items-center gap-1 bg-green-100 text-green-700 text-sm font-medium py-1 px-3 rounded-full">
                Pure Veg
                <button onClick={() => dispatch(setFilters({ vegOnly: false }))}>
                  <FiX className="text-xs" />
                </button>
              </span>
            )}
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-[#FF4F5A] ml-2">
              Clear all
            </button>
          </div>
        )}

        {/* Restaurant Grid */}
        {paginatedList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedList.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No restaurants found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={handleReset}
              className="gradient-bg text-white font-semibold py-2.5 px-6 rounded-xl transition-smooth hover:shadow-glow"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
