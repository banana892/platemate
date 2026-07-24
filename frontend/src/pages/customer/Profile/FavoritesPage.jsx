/**
 * FavoritesPage.jsx — Customer Favorites Page (/profile/favorites)
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHeart, FiStar, FiTrash2, FiMapPin } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import favoriteService from '../../../services/favorite.service.js'
import Skeleton from '../../../components/ui/Skeleton.jsx'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const data = await favoriteService.getFavorites()
      setFavorites(Array.isArray(data) ? data : data?.data || [])
    } catch (_err) {
      toast.error('Failed to load favorite restaurants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  const handleRemoveFavorite = async (restaurantId, name) => {
    try {
      await favoriteService.removeFavorite(restaurantId)
      setFavorites((prev) => prev.filter((item) => (item.restaurantId || item.id) !== restaurantId))
      toast.success(`Removed ${name || 'restaurant'} from favorites`)
    } catch {
      toast.error('Failed to remove favorite')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Favorite Restaurants</h2>
          <p className="text-sm text-gray-500">Quick access to the places you love</p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-44" count={4} />
        </div>
      )}

      {/* Empty State */}
      {!loading && favorites.length === 0 && (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF4F5A] mx-auto flex items-center justify-center text-3xl mb-4">
            <FiHeart />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Favorites Saved</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Save your top favorite restaurants to easily reorder your favorite meals anytime.
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth cursor-pointer"
          >
            <span>Explore Restaurants</span>
          </Link>
        </div>
      )}

      {/* Favorites Grid */}
      {!loading && favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const rest = fav.restaurant || fav
            const restId = fav.restaurantId || rest.id
            return (
              <div
                key={fav.id || restId}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-card transition-smooth flex flex-col justify-between group"
              >
                <div className="flex gap-4">
                  {rest.image ? (
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl gradient-bg text-white font-bold flex items-center justify-center text-2xl">
                      {rest.name?.[0] || 'R'}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-[#FF4F5A] transition-smooth">
                        {rest.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(restId, rest.name)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-smooth cursor-pointer"
                        title="Remove from favorites"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {rest.cuisines ? rest.cuisines.join(', ') : rest.cuisine || 'Multi-Cuisine'}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-600">
                      <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                        <FiStar className="text-xs fill-amber-500" />
                        {rest.rating || 4.5}
                      </span>
                      {rest.city && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <FiMapPin className="text-xs" />
                          {rest.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-end">
                  <Link
                    to={`/restaurant/${rest.slug || restId}`}
                    className="text-xs font-bold text-[#FF4F5A] hover:text-[#E8434D] transition-smooth"
                  >
                    View Menu & Order →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
