import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiSearch, FiArrowRight, FiX } from 'react-icons/fi'

export function SearchBar({ variant = 'hero', value, onChange }) {
  const [location, setLocation] = useState('')
  const [internalQuery, setInternalQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const isControlled = value !== undefined
  const query = isControlled ? value : internalQuery

  const handleQueryChange = (e) => {
    const val = e.target.value
    if (isControlled) {
      onChange?.(val)
    } else {
      setInternalQuery(val)
    }
  }

  const handleClear = () => {
    if (isControlled) {
      onChange?.('')
    } else {
      setInternalQuery('')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query?.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const isHero = variant === 'hero'

  return (
    <form
      id="searchBar"
      onSubmit={handleSearch}
      role="search"
      aria-label="Search restaurants and food"
      className={`flex items-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 transition-all duration-300 ${
        isHero
          ? `rounded-full p-1.5 pl-6 w-full max-w-[680px] ${
              focused ? 'shadow-search-focus' : 'shadow-search'
            } animate-fade-up-delay-2 flex-col sm:flex-row gap-3 sm:gap-0`
          : `rounded-2xl p-1.5 pl-5 w-full shadow-card ${
              focused ? 'shadow-search-focus' : ''
            }`
      }`}
    >
      {/* Location */}
      <div className={`flex items-center gap-2.5 ${isHero ? 'w-full sm:w-auto sm:max-w-[200px]' : 'max-w-[180px]'}`}>
        <FiMapPin className="text-[#FF4F5A] text-lg shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Your location"
          id="locationInput"
          aria-label="Your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="border-none outline-none text-[0.95rem] w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Divider */}
      <div className={`${isHero ? 'hidden sm:block w-px h-[30px] bg-gray-200 dark:bg-slate-800 mx-3 shrink-0' : 'w-px h-[30px] bg-gray-200 dark:bg-slate-800 mx-3 shrink-0'}`} />

      {/* Search Query */}
      <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto relative">
        <FiSearch className="text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search for restaurant, cuisine or a dish"
          id="searchInput"
          aria-label="Search query"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="border-none outline-none text-[0.95rem] w-full bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-6"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 focus-ring"
            aria-label="Clear search query"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="searchBtn"
        aria-label="Execute search"
        className={`gradient-bg text-white flex items-center justify-center shrink-0 transition-smooth hover:scale-105 hover:shadow-glow focus-ring ${
          isHero
            ? 'w-full sm:w-12 h-12 rounded-xl sm:rounded-full'
            : 'w-10 h-10 rounded-full'
        }`}
      >
        <FiArrowRight className="text-lg" />
      </button>
    </form>
  )
}

export default SearchBar
