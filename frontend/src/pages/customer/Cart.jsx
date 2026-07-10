import { useCart } from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatters.js'
import { Link } from 'react-router-dom'
import { FiPlus, FiMinus, FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi'

export default function Cart() {
  const { items, count, subtotal, tax, deliveryFee, total, restaurantName, removeItem, updateQuantity, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] pt-20">
        <div className="text-center">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
          <Link to="/restaurants" className="inline-flex items-center gap-2 gradient-bg text-white font-semibold py-3 px-8 rounded-xl transition-smooth hover:shadow-glow">
            Browse Restaurants <FiArrowRight />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] pt-24 pb-16">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a1a2e] mb-1">Your Cart</h1>
            <p className="text-gray-500 text-sm">From <strong className="text-gray-700">{restaurantName}</strong> • {count} items</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-500 font-medium hover:underline flex items-center gap-1">
            <FiTrash2 className="text-xs" /> Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Items */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-5 shadow-card">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm font-bold text-gray-700">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-200 transition-smooth"><FiMinus className="text-xs" /></button>
                  <span className="px-3 text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-200 transition-smooth"><FiPlus className="text-xs" /></button>
                </div>
                <p className="text-sm font-bold text-gray-900 w-16 text-right shrink-0">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-card sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bill Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Item Total</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span className="font-medium">{formatCurrency(deliveryFee)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Taxes</span><span className="font-medium">{formatCurrency(tax)}</span></div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base">
                  <span className="font-bold text-gray-900">To Pay</span>
                  <span className="font-extrabold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="mt-6 w-full gradient-bg text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-smooth hover:shadow-glow">
                <FiShoppingBag /> Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
