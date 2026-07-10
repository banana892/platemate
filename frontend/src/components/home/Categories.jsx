import { Link } from 'react-router-dom'
import { categories } from '../../data/collections.js'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver.js'

function CategoryCard({ category, index }) {
  const [ref, isVisible] = useIntersectionObserver()

  return (
    <Link
      ref={ref}
      to={category.link}
      className={`group rounded-2xl overflow-hidden bg-white shadow-card cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold mb-1">{category.name}</h3>
        <p className="text-sm text-gray-500">{category.description}</p>
      </div>
    </Link>
  )
}

export default function Categories() {
  const [headerRef, headerVisible] = useIntersectionObserver()

  return (
    <section className="py-20 bg-[#f8f9ff]" id="categories">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`mb-12 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-2">
            What are you looking for?
          </h2>
          <p className="text-base text-gray-500">Explore top categories around you</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
