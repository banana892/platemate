/**
 * FeatureFlagManager.jsx — Live Feature Flags Toggle Board Component (Phase F4)
 */

import { FiToggleLeft, FiToggleRight, FiSliders } from 'react-icons/fi'

export default function FeatureFlagManager({ flags = {}, onToggle }) {
  const FLAGS = [
    { key: 'autoAssignRiders', title: 'Rider Auto-Assignment Engine', desc: 'Automatically dispatches available riders using proximity algorithm' },
    { key: 'surgePricingEnabled', title: 'Dynamic Surge Pricing', desc: 'Enable multiplier during peak order volume hours' },
    { key: 'cashOnDeliveryEnabled', title: 'Cash On Delivery (COD)', desc: 'Allow customers to select cash payment at door' },
    { key: 'promoCouponsEnabled', title: 'Promotional Coupon Engine', desc: 'Enable system-wide discount coupon redemptions' },
    { key: 'guestCheckoutEnabled', title: 'Guest Checkout Mode', desc: 'Allow orders without mandatory user account creation' },
    { key: 'liveLocationTracking', title: 'Real-Time Rider GPS Tracking', desc: 'Stream rider coordinates via Socket.io to customer apps' },
  ]

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-4">
      <div className="flex items-center gap-2 text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
        <FiSliders className="text-amber-400" /> Platform Feature Flags & Control Toggles
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FLAGS.map((flag) => {
          const isEnabled = flags[flag.key] ?? false
          return (
            <div
              key={flag.key}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                isEnabled
                  ? 'bg-slate-950 border-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800 opacity-70'
              }`}
            >
              <div>
                <div className="font-bold text-xs text-slate-200">{flag.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{flag.desc}</div>
              </div>
              <button
                onClick={() => onToggle(flag.key, !isEnabled)}
                className={`p-1.5 text-2xl transition-colors ${
                  isEnabled ? 'text-amber-400' : 'text-slate-600'
                }`}
              >
                {isEnabled ? <FiToggleRight /> : <FiToggleLeft />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
