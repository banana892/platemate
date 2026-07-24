/**
 * DeliveryTimeline.jsx — Order Progress Tracker Component (Phase F3)
 */

import { FiCheck, FiPackage, FiTruck, FiHome } from 'react-icons/fi'

const STEPS = [
  { id: 'ASSIGNED', label: 'Order Assigned', icon: FiPackage },
  { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: FiCheck },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: FiTruck },
  { id: 'DELIVERED', label: 'Delivered', icon: FiHome },
]

export default function DeliveryTimeline({ currentStatus = 'READY_FOR_PICKUP' }) {
  const getStepStatus = (stepId) => {
    const order = ['ASSIGNED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const currentIndex = order.indexOf(currentStatus)
    const stepIndex = order.indexOf(stepId)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'upcoming'
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between w-full relative">
        {/* Connecting Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />

        {STEPS.map((step) => {
          const status = getStepStatus(step.id)
          const Icon = step.icon

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : status === 'active'
                    ? 'bg-orange-500 text-white shadow-lg ring-4 ring-orange-100 scale-110'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[0.65rem] font-bold mt-2 text-center max-w-[70px] leading-tight ${
                  status === 'active'
                    ? 'text-orange-600 font-extrabold'
                    : status === 'completed'
                    ? 'text-emerald-600'
                    : 'text-gray-400'
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
