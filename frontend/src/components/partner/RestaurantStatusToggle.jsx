/**
 * RestaurantStatusToggle.jsx — Open / Closed Restaurant Status Toggle Switch & Modal
 */

import { useState } from 'react'
import { FiPower, FiX } from 'react-icons/fi'

export default function RestaurantStatusToggle({
  isOpen = true,
  onToggle,
  loading = false,
}) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')

  const handleSwitchClick = () => {
    if (isOpen) {
      setShowModal(true) // Opening closure modal to prompt reason
    } else {
      onToggle(true) // Directly re-opening
    }
  }

  const handleConfirmClosure = () => {
    onToggle(false, reason)
    setShowModal(false)
    setReason('')
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSwitchClick}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition-smooth cursor-pointer border ${
            isOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <FiPower className={`text-sm ${isOpen ? 'text-emerald-600' : 'text-rose-600'}`} />
          <span>{isOpen ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}</span>
        </button>
      </div>

      {/* Closure Reason Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-card-hover border border-gray-100 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-smooth cursor-pointer"
            >
              <FiX className="text-xl" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-4">
              <FiPower />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Close Restaurant Temporarily?</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Customers will not be able to place new delivery or pickup orders while your store is closed.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="closureReason">
                Reason for Closure (Optional)
              </label>
              <input
                id="closureReason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. High order volume, Kitchen maintenance..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#FF4F5A]"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClosure}
                disabled={loading}
                className="w-1/2 bg-rose-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-rose-700 transition-smooth cursor-pointer"
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
