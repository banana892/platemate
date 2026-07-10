import { FiTag, FiArrowRight } from 'react-icons/fi'

export default function OfferBanner({ title, description, code, expiry, onClick }) {
  return (
    <div className="gradient-bg rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden group cursor-pointer" onClick={onClick}>
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <FiTag className="text-xl" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1">{title}</h3>
            <p className="text-white/80 text-sm mb-2">{description}</p>
            {code && (
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                <span className="text-xs font-medium text-white/70">Use code:</span>
                <span className="text-sm font-bold tracking-wider">{code}</span>
              </div>
            )}
          </div>
        </div>

        <button className="bg-white text-[#FF4F5A] font-bold text-sm py-2.5 px-6 rounded-xl transition-smooth group-hover:shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0">
          Order Now <FiArrowRight className="transition-smooth group-hover:translate-x-1" />
        </button>
      </div>

      {expiry && (
        <p className="text-white/50 text-xs mt-3 relative z-10">Valid till {expiry}</p>
      )}
    </div>
  )
}
