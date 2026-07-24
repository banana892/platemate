/**
 * Checkout.jsx — Customer Checkout Page (/checkout)
 *
 * Presents a complete pre-order review:
 *  - Cart item summary (read-only)
 *  - Delivery address selection (fetched from profile)
 *  - Order notes
 *  - Bill breakdown
 *  - Place Order CTA → POST /api/orders
 *
 * On success: clears cart, navigates to /profile/orders with a success toast.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiMapPin,
  FiShoppingBag,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
  FiPlus,
  FiTrash2,
  FiStar,
} from 'react-icons/fi'

import { useCart } from '../../hooks/useCart.js'
import useAddresses from '../../hooks/useAddresses.js'
import usePayment from '../../hooks/usePayment.js'
import AddressMapModal from '../../components/common/AddressMapModal.jsx'
import { formatCurrency } from '../../utils/formatters.js'

export default function Checkout() {
  const navigate = useNavigate()

  const { items, subtotal, tax, deliveryFee, total, restaurantName } = useCart()
  const {
    addresses,
    selectedAddressId,
    defaultAddress,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    setSelectedAddress,
    loading: addressLoading,
  } = useAddresses()
  const { initiatePayment, paymentStatus, isProcessing } = usePayment()

  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items.length, navigate])

  // Load saved addresses on mount
  useEffect(() => {
    fetchAddresses().catch(() => {})
  }, [fetchAddresses])

  // Auto-select default address once addresses are loaded
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      setSelectedAddress(defaultAddress.id)
    }
  }, [defaultAddress, selectedAddressId, setSelectedAddress])

  const handleOpenAddModal = () => {
    setEditingAddress(null)
    setIsMapModalOpen(true)
  }

  const handleOpenEditModal = (addr, e) => {
    e.stopPropagation()
    setEditingAddress(addr)
    setIsMapModalOpen(true)
  }

  const handleDeleteAddress = async (addrId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to remove this address?')) {
      await deleteAddress(addrId)
    }
  }

  const handleSetDefault = async (addrId, e) => {
    e.stopPropagation()
    await setDefaultAddress(addrId)
  }

  const handleSaveModalAddress = async (addressData) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, addressData)
    } else {
      await addAddress(addressData)
    }
  }

  const handlePlaceOrder = () => {
    initiatePayment({
      addressId: selectedAddressId,
      notes: notes.trim() || undefined,
      items,
      paymentMethod,
      total,
    })
  }

  if (items.length === 0) return null // Redirect handled by useEffect

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/cart"
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition-smooth"
            aria-label="Back to Cart"
          >
            <FiArrowLeft className="text-lg" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-[#1a1a2e] dark:text-white">Checkout</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              From <strong className="text-gray-700 dark:text-gray-300">{restaurantName}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left column: Address + Items + Notes ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Delivery Address Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiMapPin className="text-[#FF4F5A]" />
                  Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1 text-xs font-semibold text-[#FF4F5A] hover:underline cursor-pointer"
                >
                  <FiPlus className="text-sm" /> Add Delivery Address
                </button>
              </div>

              {addressLoading && (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {!addressLoading && addresses.length === 0 && (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <FiMapPin className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">No saved addresses found.</p>
                  <p className="text-xs text-gray-400 mb-4">Add a new delivery address using Google Maps</p>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 gradient-bg text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:shadow-glow transition-smooth cursor-pointer"
                  >
                    <FiPlus /> Add Delivery Address
                  </button>
                </div>
              )}

              {!addressLoading && addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`w-full text-left flex flex-col p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
                          isSelected
                            ? 'border-[#FF4F5A] bg-rose-50/40 dark:bg-rose-950/20'
                            : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#FF4F5A] bg-[#FF4F5A]' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {addr.label || addr.type || 'Address'}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold uppercase tracking-wide">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                              {[
                                addr.houseNumber,
                                addr.formattedAddress || addr.street,
                                addr.landmark ? `(Near ${addr.landmark})` : null,
                                addr.city,
                                addr.state,
                                addr.postalCode,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                            {addr.recipientName && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                👤 {addr.recipientName} {addr.phone ? `· 📞 ${addr.phone}` : ''}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <FiCheckCircle className="text-[#FF4F5A] text-lg flex-shrink-0 mt-0.5" />
                          )}
                        </div>

                        {/* Card Actions Row */}
                        <div className="flex items-center justify-end gap-3 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => handleSetDefault(addr.id, e)}
                              className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-1"
                            >
                              <FiStar className="text-xs" /> Set as Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(addr, e)}
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold flex items-center gap-1"
                          >
                            <FiEdit3 className="text-xs" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold flex items-center gap-1"
                          >
                            <FiTrash2 className="text-xs" /> Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <FiShoppingBag className="text-[#FF4F5A]" />
                Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>

              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-[#FF4F5A] font-semibold">
                <Link to="/cart" className="flex items-center gap-1 hover:underline">
                  <FiEdit3 /> Edit cart
                </Link>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <label htmlFor="checkout-notes" className="block font-bold text-gray-900 text-sm mb-2">
                Special Instructions <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="checkout-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. No onions, extra sauce, ring the doorbell twice…"
                maxLength={500}
                className="w-full text-sm text-gray-700 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF4F5A] focus:bg-white transition-smooth resize-none"
              />
              <p className="text-right text-[11px] text-gray-300 mt-1">{notes.length}/500</p>
            </div>

          </div>

          {/* ── Right column: Bill Summary + CTA ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Bill Details</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Item Total</span>
                  <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-800">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Taxes & Charges</span>
                  <span className="font-medium text-gray-800">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-base">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className="font-extrabold text-[#FF4F5A]">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-smooth cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-[#FF4F5A] bg-rose-50/50 text-[#FF4F5A] shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <span className="text-lg shrink-0">💵</span>
                    <div className="text-left min-w-0">
                      <p className="font-bold truncate">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-400 font-normal truncate">Pay cash at door</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-smooth cursor-pointer ${
                      paymentMethod !== 'COD'
                        ? 'border-[#FF4F5A] bg-rose-50/50 text-[#FF4F5A] shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    <span className="text-lg shrink-0">💳</span>
                    <div className="text-left min-w-0">
                      <p className="font-bold truncate">Online Payment</p>
                      <p className="text-[10px] text-gray-400 font-normal truncate">UPI / Card / NetBank</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Address Warning */}
              {!selectedAddressId && !addressLoading && addresses.length > 0 && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  <FiAlertCircle className="text-amber-500 text-base flex-shrink-0 mt-0.5" />
                  <span>Please select a delivery address above before placing your order.</span>
                </div>
              )}

              {/* Place Order Button */}
              <button
                id="checkout-place-order-btn"
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing || (!selectedAddressId && addresses.length > 0) || addressLoading}
                className="mt-5 w-full gradient-bg text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-smooth hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {paymentStatus === 'creatingOrder' && 'Creating Order…'}
                    {paymentStatus === 'openingCheckout' && 'Opening Checkout…'}
                    {paymentStatus === 'verifying' && 'Verifying Payment…'}
                    {!['creatingOrder', 'openingCheckout', 'verifying'].includes(paymentStatus) && 'Processing…'}
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="text-lg" />
                    Place Order · {formatCurrency(total)}
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-3">
                By placing this order you agree to our{' '}
                <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      <AddressMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSaveAddress={handleSaveModalAddress}
        editingAddress={editingAddress}
      />
    </div>
  )
}

