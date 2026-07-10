import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { restaurants } from '../../data/restaurants.js'
import { getMenuByRestaurant, getMenuCategories } from '../../data/menuItems.js'
import FoodCard from '../../components/ui/FoodCard.jsx'
import { useCart } from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatters.js'
import { getRatingColor } from '../../utils/helpers.js'
import { FiClock, FiMapPin, FiStar, FiHeart } from 'react-icons/fi'

export default function RestaurantDetails() {
  const { slug } = useParams()
  const restaurant = restaurants.find(r => r.slug === slug)
  const [activeCategory, setActiveCategory] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)
  const { items: cartItems, addItem, updateQuantity } = useCart()

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h2>
        </div>
      </div>
    )
  }

  const menuItems = getMenuByRestaurant(restaurant.id)
  const menuCategories = getMenuCategories(restaurant.id)
  const displayCat = activeCategory || menuCategories[0]
  const filtered = displayCat ? menuItems.filter(i => i.category === displayCat) : menuItems
  const getQty = (id) => cartItems.find(i => i.id === id)?.quantity || 0

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      {/* Cover */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/90 via-[#1a1a2e]/30 to-transparent" />
        <button onClick={() => setWishlisted(v => !v)} className={`absolute top-24 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${wishlisted ? 'bg-[#FF4F5A] text-white' : 'bg-white/80 text-gray-700'}`}>
          <FiHeart className={wishlisted ? 'fill-current' : ''} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-[1200px] mx-auto">
            <h1 className="text-3xl font-extrabold text-white mb-1">{restaurant.name}</h1>
            <p className="text-white/70 text-sm mb-3">{restaurant.cuisines.join(', ')}</p>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className={`${getRatingColor(restaurant.rating)} text-white font-bold py-1 px-2.5 rounded-md flex items-center gap-1`}><FiStar className="text-xs" />{restaurant.rating}</span>
              <span className="flex items-center gap-1"><FiClock className="text-xs" />{restaurant.deliveryTime} mins</span>
              <span>{formatCurrency(restaurant.priceForTwo)} for two</span>
              <span className="flex items-center gap-1"><FiMapPin className="text-xs" />{restaurant.address}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {restaurant.offer && (
          <div className="gradient-bg text-white rounded-xl py-3 px-5 mb-8 flex items-center gap-3 text-sm font-medium">
            <span>🎉</span><span>{restaurant.offer}</span>
            {restaurant.offerCode && <span className="bg-white/20 rounded-md py-0.5 px-2 text-xs font-bold ml-auto">{restaurant.offerCode}</span>}
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {menuCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`py-2 px-5 rounded-full text-sm font-medium whitespace-nowrap transition-smooth ${displayCat === cat ? 'gradient-bg text-white shadow-glow' : 'bg-white text-gray-600 shadow-card hover:text-[#FF4F5A]'}`}>{cat}</button>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-card">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{displayCat || 'Menu'}</h2>
          <p className="text-sm text-gray-400 mb-4">{filtered.length} items</p>
          {filtered.map(item => (
            <FoodCard key={item.id} item={item} quantity={getQty(item.id)} onAdd={(fi) => addItem(fi, restaurant)} onUpdateQuantity={updateQuantity} />
          ))}
        </div>
      </div>
    </div>
  )
}
