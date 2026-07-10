import { FiChevronDown } from 'react-icons/fi'
import SearchBar from '../ui/SearchBar.jsx'
import { quickTags } from '../../data/collections.js'

export default function Hero() {
  const handleTagClick = (label) => {
    const input = document.getElementById('searchInput')
    if (input) {
      // Trigger react change
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      nativeInputValueSetter.call(input, label)
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.focus()
    }
  }

  return (
    <header id="hero" className="relative w-full min-h-screen flex flex-col overflow-hidden">
      {/* Background Image */}
      <img
        className="absolute inset-0 w-full h-full object-cover z-0 animate-hero-zoom"
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
        alt="Delicious food spread"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/70 to-[#1a1a2e]/85 z-[1]" />

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-[2] pt-28 pb-16 px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black text-white leading-[1.15] mb-4 animate-fade-up">
          Find Your Next <br />
          <span className="gradient-text">Favorite Meal</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-white/75 font-light mb-10 animate-fade-up-delay-1">
          Discover restaurants, cafes, and bars — order online or go out.
        </p>

        <SearchBar variant="hero" />

        {/* Quick Tags */}
        <div className="flex gap-2.5 flex-wrap justify-center mt-6 animate-fade-up-delay-3">
          {quickTags.map(tag => (
            <button
              key={tag.label}
              onClick={() => handleTagClick(tag.label)}
              className="bg-white/[0.12] backdrop-blur-sm text-white py-2 px-4.5 rounded-full text-sm font-medium cursor-pointer border border-white/15 transition-smooth hover:bg-white hover:text-[#FF4F5A] hover:-translate-y-0.5"
            >
              {tag.emoji} {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] text-white/50 text-center text-xs animate-bounce-slow">
        <span>Scroll to explore</span>
        <FiChevronDown className="mx-auto mt-1.5 text-base" />
      </div>
    </header>
  )
}
