/**
 * OrderTimeline.jsx — Visual Order Multi-Stage Fulfillment Timeline Widget (Phase F4)
 */

import { FiCheckCircle, FiClock, FiShoppingBag, FiTruck, FiHome, FiXCircle } from 'react-icons/fi'

export default function OrderTimeline({ timeline = [], currentStatus }) {
  const STAGES = [
    { key: 'PLACED', label: 'Order Placed', icon: FiClock },
    { key: 'ACCEPTED', label: 'Accepted by Restaurant', icon: FiCheckCircle },
    { key: 'PREPARING', label: 'Food Preparation', icon: FiShoppingBag },
    { key: 'PICKED_UP', label: 'Picked Up by Rider', icon: FiTruck },
    { key: 'DELIVERED', label: 'Order Delivered', icon: FiHome },
  ]

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-center flex items-center justify-center gap-2 text-xs font-bold">
        <FiXCircle className="text-lg text-red-400" /> Order Cancelled
      </div>
    )
  }

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fulfillment Timeline</div>
      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
        {STAGES.map((stg, _idx) => {
          const Icon = stg.icon
          const eventMatch = timeline.find((t) => t.status === stg.key)
          const isDone = !!eventMatch

          return (
            <div key={stg.key} className="relative pl-6">
              <div
                className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                  isDone
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}
              >
                <Icon />
              </div>
              <div>
                <div className={`font-bold text-xs ${isDone ? 'text-slate-100' : 'text-slate-500'}`}>
                  {stg.label}
                </div>
                {eventMatch && (
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                    {new Date(eventMatch.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
