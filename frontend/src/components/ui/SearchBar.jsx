import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiSearch, FiArrowRight } from 'react-icons/fi'

export default function SearchBar({ variant = 'hero' }) {
  const [location, setLocation] = useState('')
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const isHero = variant === 'hero'

  return (
    <form
      id="searchBar"
      onSubmit={handleSearch}
      className={`flex items-center bg-white transition-smooth ${
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
        <FiMapPin className="text-[#FF4F5A] text-lg shrink-0" />
        <input
          type="text"
          placeholder="Your location"
          id="locationInput"
          value={location}
          onChange={e => setLocation(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="border-none outline-none text-[0.95rem] w-full bg-transparent text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {/* Divider */}
      <div className={`${isHero ? 'hidden sm:block w-px h-[30px] bg-gray-200 mx-3 shrink-0' : 'w-px h-[30px] bg-gray-200 mx-3 shrink-0'}`} />

      {/* Search Query */}
      <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto">
        <FiSearch className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search for restaurant, cuisine or a dish"
          id="searchInput"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="border-none outline-none text-[0.95rem] w-full bg-transparent text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="searchBtn"
        className={`gradient-bg text-white flex items-center justify-center shrink-0 transition-smooth hover:scale-105 hover:shadow-glow ${
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
