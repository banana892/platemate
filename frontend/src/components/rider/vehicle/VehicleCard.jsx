/**
 * VehicleCard.jsx — Rider Vehicle Information Display Card (Phase F3)
 */

import { FiTruck, FiFileText, FiShield, FiCheckCircle } from 'react-icons/fi'

export default function VehicleCard({ vehicle = {}, onEdit }) {
  const {
    vehicleType = 'Motorcycle / Scooter',
    vehicleNumber = 'KA-01-EQ-9876',
    licenseNumber = 'DL-9876543210',
    insuranceStatus = 'Active & Verified',
  } = vehicle

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-50 text-orange-600">
            <FiTruck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-900">{vehicleType}</h3>
            <span className="text-xs font-bold text-gray-400 block">{vehicleNumber}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>Verified</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
        <div className="p-3.5 bg-gray-50 rounded-2xl flex items-center gap-3">
          <FiFileText className="w-5 h-5 text-gray-400" />
          <div>
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">License Number</span>
            <span className="font-black text-gray-800">{licenseNumber}</span>
          </div>
        </div>

        <div className="p-3.5 bg-gray-50 rounded-2xl flex items-center gap-3">
          <FiShield className="w-5 h-5 text-emerald-500" />
          <div>
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider block">Insurance Status</span>
            <span className="font-black text-emerald-700">{insuranceStatus}</span>
          </div>
        </div>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Update Vehicle Details
        </button>
      )}
    </div>
  )
}
