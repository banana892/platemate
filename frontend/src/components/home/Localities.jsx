import { FiChevronRight } from 'react-icons/fi'
import { localities } from '../../data/collections.js'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver.js'

function LocalityCard({ locality, index }) {
  const [ref, isVisible] = useIntersectionObserver()

  return (
    <div
      ref={ref}
      className={`group flex justify-between items-center bg-white py-5 px-6 rounded-xl shadow-card cursor-pointer transition-all duration-500 border border-transparent hover:border-[#FF4F5A] hover:-translate-y-1 hover:shadow-card-hover ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <span className="text-[1.05rem] font-semibold text-[#1a1a2e]">{locality.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-[0.82rem] text-gray-500">{locality.count} places</span>
        <FiChevronRight className="text-sm text-gray-500 transition-all duration-300 group-hover:text-[#FF4F5A] group-hover:translate-x-1" />
      </div>
    </div>
  )
}

export default function Localities() {
  const [headerRef, headerVisible] = useIntersectionObserver()

  return (
    <section className="py-20 bg-[#f8f9ff]" id="localities">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-2">
            Popular Localities
          </h2>
          <p className="text-base text-gray-500">
            In and around <strong>Delhi NCR</strong>
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localities.map((loc, i) => (
            <LocalityCard key={loc.name} locality={loc} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
