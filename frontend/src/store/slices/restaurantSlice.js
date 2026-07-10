import { createSlice } from '@reduxjs/toolkit'
import { restaurants as mockRestaurants } from '../../data/restaurants.js'

const initialState = {
  list: mockRestaurants,
  filteredList: mockRestaurants,
  currentRestaurant: null,
  filters: {
    cuisine: [],
    rating: null,
    priceRange: null,
    deliveryTime: null,
    vegOnly: false,
    sortBy: 'popularity',
  },
  searchQuery: '',
  isLoading: false,
}

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setRestaurants(state, action) {
      state.list = action.payload
      state.filteredList = action.payload
    },
    setCurrentRestaurant(state, action) {
      state.currentRestaurant = action.payload
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredList = applyFilters(state.list, state.filters, state.searchQuery)
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
      state.filteredList = applyFilters(state.list, state.filters, state.searchQuery)
    },
    resetFilters(state) {
      state.filters = initialState.filters
      state.searchQuery = ''
      state.filteredList = state.list
    },
    setLoading(state, action) {
      state.isLoading = action.payload
    },
  },
})

function applyFilters(restaurants, filters, searchQuery) {
  let result = [...restaurants]

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisines.some(c => c.toLowerCase().includes(q)) ||
      r.address.toLowerCase().includes(q)
    )
  }

  if (filters.cuisine.length > 0) {
    result = result.filter(r =>
      r.cuisines.some(c => filters.cuisine.includes(c))
    )
  }

  if (filters.rating) {
    result = result.filter(r => r.rating >= filters.rating)
  }

  if (filters.vegOnly) {
    result = result.filter(r => r.isVeg)
  }

  if (filters.deliveryTime) {
    result = result.filter(r => r.deliveryTime <= filters.deliveryTime)
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    result = result.filter(r => r.priceForTwo >= min && r.priceForTwo <= max)
  }

  // Sort
  switch (filters.sortBy) {
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'delivery_time':
      result.sort((a, b) => a.deliveryTime - b.deliveryTime)
      break
    case 'cost_low':
      result.sort((a, b) => a.priceForTwo - b.priceForTwo)
      break
    case 'cost_high':
      result.sort((a, b) => b.priceForTwo - a.priceForTwo)
      break
    default:
      result.sort((a, b) => b.ratingCount - a.ratingCount)
  }

  return result
}

export const { setRestaurants, setCurrentRestaurant, setFilters, setSearchQuery, resetFilters, setLoading } = restaurantSlice.actions
export default restaurantSlice.reducer
