import { useSelector, useDispatch } from 'react-redux'
import { addItem, removeItem, updateQuantity, clearCart, selectCartItems, selectCartCount, selectCartSubtotal } from '../store/slices/cartSlice.js'
import { DELIVERY_FEE, TAX_RATE } from '../utils/constants.js'
import toast from 'react-hot-toast'

export function useCart() {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const count = useSelector(selectCartCount)
  const subtotal = useSelector(selectCartSubtotal)
  const restaurantId = useSelector(state => state.cart.restaurantId)
  const restaurantName = useSelector(state => state.cart.restaurantName)

  const tax = Math.round(subtotal * TAX_RATE)
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0
  const total = subtotal + tax + deliveryFee

  const handleAddItem = (item, restaurant) => {
    if (restaurantId && restaurantId !== restaurant.id) {
      if (!window.confirm(`Your cart contains items from ${restaurantName}. Do you want to clear the cart and add items from ${restaurant.name}?`)) {
        return
      }
    }
    dispatch(addItem({ item, restaurant }))
    toast.success(`${item.name} added to cart`)
  }

  const handleRemoveItem = (itemId, itemName) => {
    dispatch(removeItem(itemId))
    toast.success(`${itemName} removed from cart`)
  }

  const handleUpdateQuantity = (itemId, quantity) => {
    dispatch(updateQuantity({ itemId, quantity }))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    toast.success('Cart cleared')
  }

  return {
    items,
    count,
    subtotal,
    tax,
    deliveryFee,
    total,
    restaurantId,
    restaurantName,
    addItem: handleAddItem,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
  }
}
