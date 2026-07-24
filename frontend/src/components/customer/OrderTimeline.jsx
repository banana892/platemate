/**
 * OrderTimeline.jsx — Visual Step-by-Step Order Status Progress Timeline
 */

import { FiCheck, FiClock, FiX } from 'react-icons/fi'

const TIMELINE_STEPS = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
]

export default function OrderTimeline({ currentStatus = 'PENDING' }) {
  const isCancelled = currentStatus?.toUpperCase() === 'CANCELLED'

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 my-6">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 mx-auto flex items-center justify-center text-2xl mb-2">
          <FiX />
        </div>
        <h4 className="font-bold text-lg mb-1">Order Cancelled</h4>
        <p className="text-xs text-red-600">This order was cancelled and is no longer active.</p>
      </div>
    )
  }

  // Determine current active step index
  const activeIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStatus?.toUpperCase())
  const currentStep = activeIndex >= 0 ? activeIndex : 0

  return (
    <div className="py-6 px-2 my-4">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />

        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 gradient-bg -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${(currentStep / (TIMELINE_STEPS.length - 1)) * 100}%`,
          }}
        />

        {/* Timeline Nodes */}
        {TIMELINE_STEPS.map((step, idx) => {
          const isPassed = idx < currentStep
          const isCurrent = idx === currentStep

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isPassed
                    ? 'gradient-bg text-white shadow-glow'
                    : isCurrent
                    ? 'bg-white border-4 border-[#FF4F5A] text-[#FF4F5A] shadow-md scale-110'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isPassed ? (
                  <FiCheck className="text-base" />
                ) : isCurrent ? (
                  <FiClock className="text-base animate-spin" />
                ) : (
                  idx + 1
                )}
              </div>

              <span
                className={`text-xs mt-2 font-semibold text-center max-w-[80px] ${
                  isPassed || isCurrent ? 'text-gray-900 font-bold' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
