import Hero from '../components/home/Hero.jsx'
import Categories from '../components/home/Categories.jsx'
import Collections from '../components/home/Collections.jsx'
import Localities from '../components/home/Localities.jsx'
import AppDownload from '../components/home/AppDownload.jsx'
import Explore from '../components/home/Explore.jsx'
import OfferBanner from '../components/ui/OfferBanner.jsx'
import RestaurantCard from '../components/ui/RestaurantCard.jsx'
import { restaurants } from '../data/restaurants.js'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js'
import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function PopularRestaurants() {
  const [ref, isVisible] = useIntersectionObserver()
  const topRestaurants = restaurants.filter(r => r.isOpen).slice(0, 8)

  return (
    <section className="py-20 bg-[#f8f9ff]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          ref={ref}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-3 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-2">
              Popular Restaurants
            </h2>
            <p className="text-base text-gray-500">Top picks for you</p>
          </div>
          <Link
            to="/restaurants"
            className="text-[#FF4F5A] font-semibold text-sm flex items-center gap-1.5 whitespace-nowrap transition-smooth hover:gap-3"
          >
            See all <FiArrowRight />
          </Link>
        </div>

        {/* Offer Banner */}
        <div className="mb-10">
          <OfferBanner
            title="🎉 60% OFF on your first order!"
            description="Use code WELCOME60 and get up to ₹120 off on your first PlateMate order."
            code="WELCOME60"
            expiry="31 Dec 2026"
          />
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 gradient-bg text-white font-semibold text-base py-3.5 px-8 rounded-xl transition-smooth hover:shadow-glow hover:-translate-y-0.5"
          >
            View All Restaurants <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <PopularRestaurants />
      <Collections />
      <Localities />
      <AppDownload />
      <Explore />
    </main>
  )
}
