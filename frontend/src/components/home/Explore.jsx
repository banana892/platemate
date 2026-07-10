import { popularCuisines, topChains, cities } from '../../data/collections.js'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver.js'

function ExploreBlock({ title, items, type = 'tags' }) {
  const [ref, isVisible] = useIntersectionObserver()

  return (
    <div
      ref={ref}
      className={`mb-10 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <h4 className="text-lg font-bold text-[#1a1a2e] mb-4">{title}</h4>
      {type === 'tags' ? (
        <div className="flex flex-wrap gap-2.5">
          {items.map(item => (
            <a
              key={item}
              href="#"
              className="py-2 px-5 border-[1.5px] border-gray-200 rounded-full text-sm text-gray-500 transition-smooth hover:border-[#FF4F5A] hover:text-[#FF4F5A] hover:bg-[#FF4F5A]/[0.04] hover:-translate-y-0.5"
            >
              {item}
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap">
          {items.map(item => (
            <a
              key={item}
              href="#"
              className="w-44 py-2.5 text-[0.92rem] text-gray-500 transition-smooth hover:text-[#FF4F5A]"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Explore() {
  const [headerRef, headerVisible] = useIntersectionObserver()

  return (
    <section className="py-20 bg-white" id="explore">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2
          ref={headerRef}
          className={`text-3xl font-extrabold text-[#1a1a2e] mb-10 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Explore options near you
        </h2>

        <ExploreBlock title="Popular Cuisines" items={popularCuisines} type="tags" />
        <ExploreBlock title="Top Restaurant Chains" items={topChains} type="grid" />
        <ExploreBlock title="Cities We Deliver To" items={cities} type="grid" />
      </div>
    </section>
  )
}
