/**
 * DeliveryMapWrapper.jsx — Provider-Agnostic Map Component (Phase F3)
 *
 * Implements a rich responsive map representation with pickup/drop pins,
 * route path overlay, distance indicator, and Google Maps / Waze launch triggers.
 * Abstracted to easily inject Mapbox GL or Google Maps JS SDK in the future.
 */

import { useState } from 'react'
import { FiNavigation, FiMapPin, FiCompass, FiExternalLink, FiLayers } from 'react-icons/fi'

export default function DeliveryMapWrapper({
  pickupAddress = 'Restaurant Location',
  deliveryAddress = 'Customer Drop Location',
  distance = '3.2 km',
  estimatedTime = '12 mins',
  _pickupCoords = { lat: 12.9716, lng: 77.5946 },
  _deliveryCoords = { lat: 12.9352, lng: 77.6245 },
  className = '',
}) {
  const [mapStyle, setMapStyle] = useState('standard') // standard | satellite | dark

  const openExternalNavigation = (type = 'google') => {
    const dest = encodeURIComponent(deliveryAddress)
    if (type === 'google') {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank')
    } else if (type === 'waze') {
      window.open(`https://waze.com/ul?q=${dest}&navigate=yes`, '_blank')
    }
  }

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-slate-900 text-white ${className}`}>
      {/* Map Header / Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2">
          <FiCompass className="w-4 h-4 text-orange-400 animate-spin-slow" />
          <span>{distance}</span>
          <span className="text-gray-400">•</span>
          <span className="text-emerald-400">{estimatedTime}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === 'standard' ? 'dark' : 'standard')}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Toggle Map Style"
          >
            <FiLayers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated Provider-Agnostic Map Canvas / SVG Viewport */}
      <div
        className={`w-full h-72 sm:h-96 relative flex items-center justify-center transition-colors duration-500 ${
          mapStyle === 'dark' ? 'bg-slate-950' : 'bg-slate-900'
        }`}
      >
        {/* Grid lines simulating map streets */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Dynamic Route SVG Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 80 180 Q 200 80, 320 180 T 520 120"
            fill="none"
            stroke="#f97316"
            strokeWidth="5"
            strokeDasharray="8 6"
            className="animate-pulse"
          />
        </svg>

        {/* Pickup Pin */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="bg-amber-500 text-white font-extrabold text-[0.65rem] px-2.5 py-1 rounded-full shadow-lg border border-amber-300 flex items-center gap-1 mb-1">
            <FiMapPin className="w-3 h-3" />
            <span>Pickup</span>
          </div>
          <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-amber-500/30 animate-bounce">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Dropoff Pin */}
        <div className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2 flex flex-col items-center group cursor-pointer">
          <div className="bg-emerald-500 text-white font-extrabold text-[0.65rem] px-2.5 py-1 rounded-full shadow-lg border border-emerald-300 flex items-center gap-1 mb-1">
            <FiNavigation className="w-3 h-3" />
            <span>Dropoff</span>
          </div>
          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl ring-4 ring-emerald-500/30 animate-bounce">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Center Watermark Provider Tag */}
        <div className="absolute bottom-3 left-3 text-[0.65rem] font-bold text-gray-500/80 uppercase tracking-widest pointer-events-none">
          PlateMate Map Provider v1.0
        </div>
      </div>

      {/* Map Action Bar Footer */}
      <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs space-y-0.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="truncate max-w-[200px] sm:max-w-[300px] font-medium">{pickupAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[200px] sm:max-w-[300px] font-medium">{deliveryAddress}</span>
          </div>
        </div>

        {/* External Navigation Launchers */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => openExternalNavigation('google')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FiNavigation className="w-3.5 h-3.5" />
            <span>Google Maps</span>
            <FiExternalLink className="w-3 h-3 opacity-70" />
          </button>
          <button
            type="button"
            onClick={() => openExternalNavigation('waze')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Waze</span>
            <FiExternalLink className="w-3 h-3 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  )
}
