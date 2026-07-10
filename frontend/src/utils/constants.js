// PlateMate Constants

export const BRAND = {
  name: 'PlateMate',
  tagline: 'Discover great food, everywhere.',
  description: 'Discover restaurants, cafes, and bars — order online or go out.',
}

export const NAV_LINKS = [
  { label: 'Explore', href: '/#categories' },
  { label: 'Collections', href: '/#collections' },
  { label: 'Near Me', href: '/#localities' },
]

export const DELIVERY_FEE = 49
export const TAX_RATE = 0.05
export const MIN_ORDER_AMOUNT = 149

export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'delivery_time', label: 'Delivery Time' },
  { value: 'cost_low', label: 'Cost: Low to High' },
  { value: 'cost_high', label: 'Cost: High to Low' },
]

export const CUISINE_FILTERS = [
  'North Indian', 'South Indian', 'Chinese', 'Italian',
  'Mexican', 'Continental', 'Street Food', 'Desserts',
  'Biryani', 'Mughlai', 'Bakery', 'Beverages',
]

export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PLACED]: 'Order Placed',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
}

export const USER_ROLES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DELIVERY: 'delivery',
  ADMIN: 'admin',
}
