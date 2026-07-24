/**
 * AddressCard.jsx — Individual Address Card Component
 */

import { FiMapPin, FiPhone, FiCheck, FiEdit2, FiTrash2, FiStar } from 'react-icons/fi'

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  loading = false,
}) {
  if (!address) return null

  return (
    <div
      className={`rounded-2xl p-6 border transition-smooth relative flex flex-col justify-between ${
        address.isDefault
          ? 'bg-rose-50/40 border-[#FF4F5A] shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-card'
      }`}
    >
      <div>
        {/* Top Bar: Label & Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                address.isDefault
                  ? 'gradient-bg text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <FiMapPin />
            </div>
            <span className="font-bold text-gray-900 text-base">
              {address.label || 'Home'}
            </span>
          </div>

          {address.isDefault ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF4F5A] text-white flex items-center gap-1 shadow-xs">
              <FiStar className="fill-current text-xs" />
              Default Address
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSetDefault(address)}
              disabled={loading}
              className="text-xs font-semibold text-gray-500 hover:text-[#FF4F5A] transition-smooth flex items-center gap-1 cursor-pointer"
            >
              <FiCheck className="text-xs" />
              Set as Default
            </button>
          )}
        </div>

        {/* Recipient Details */}
        <div className="space-y-1.5 mb-4">
          <p className="text-sm font-semibold text-gray-800">
            {address.recipientName || 'Recipient'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <FiPhone className="text-gray-400" />
            <span>{address.phone || address.recipientPhone || 'N/A'}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pt-1">
            {[
              address.houseNumber,
              address.formattedAddress || address.street,
              address.landmark ? `(Near ${address.landmark})` : null,
              address.city,
              address.state,
              address.postalCode,
              address.country,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100/80">
        <button
          type="button"
          onClick={() => onEdit(address)}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition-smooth flex items-center gap-1.5 cursor-pointer"
        >
          <FiEdit2 className="text-xs" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(address)}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 font-semibold text-xs transition-smooth flex items-center gap-1.5 cursor-pointer"
        >
          <FiTrash2 className="text-xs" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  )
}
