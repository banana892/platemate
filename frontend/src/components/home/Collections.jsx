import { FiArrowRight } from 'react-icons/fi'
import { collections } from '../../data/collections.js'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver.js'

function CollectionCard({ collection, index }) {
  const [ref, isVisible] = useIntersectionObserver()

  return (
    <div
      ref={ref}
      className={`group relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <img
        src={collection.image}
        alt={collection.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-5">
        <h3 className="text-white text-xl font-bold">{collection.name}</h3>
        <span className="text-white/80 text-sm mt-1 flex items-center gap-1">
          {collection.count} Places
          <FiArrowRight className="transition-all duration-300 group-hover:ml-2" />
        </span>
      </div>
    </div>
  )
}

export default function Collections() {
  const [headerRef, headerVisible] = useIntersectionObserver()

  return (
    <section className="py-20 bg-white" id="collections">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-3 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-2">
              Curated Collections
            </h2>
            <p className="text-base text-gray-500">
              Handpicked restaurants, cafes, pubs based on trends
            </p>
          </div>
          <a
            href="#"
            className="text-[#FF4F5A] font-semibold text-sm flex items-center gap-1.5 whitespace-nowrap transition-smooth hover:gap-3"
          >
            All collections <FiArrowRight />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.map((col, i) => (
            <CollectionCard key={col.id} collection={col} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
