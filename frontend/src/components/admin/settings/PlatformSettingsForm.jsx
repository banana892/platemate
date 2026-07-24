/**
 * PlatformSettingsForm.jsx — Platform Operational & Fee Configuration Form (Phase F4)
 */

import { useState } from 'react'
import { FiSave } from 'react-icons/fi'

export default function PlatformSettingsForm({ settings, onSave }) {
  const [formData, setFormData] = useState(settings || {
    commissionRate: 15,
    deliveryFeeBase: 3.50,
    deliveryFeePerKm: 0.80,
    taxRate: 5,
    supportEmail: 'support@platemate.com',
    contactPhone: '+1 (800) 555-PLATE',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 space-y-6">
      <div className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
        Financial & Platform Fee Rules
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Platform Commission Rate (%)</label>
          <input
            type="number"
            name="commissionRate"
            value={formData.commissionRate}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Tax Rate (%)</label>
          <input
            type="number"
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Base Delivery Fee ($)</label>
          <input
            type="number"
            step="0.1"
            name="deliveryFeeBase"
            value={formData.deliveryFeeBase}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Delivery Fee / Km ($)</label>
          <input
            type="number"
            step="0.05"
            name="deliveryFeePerKm"
            value={formData.deliveryFeePerKm}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Support Desk Email</label>
          <input
            type="email"
            name="supportEmail"
            value={formData.supportEmail}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Contact Phone</label>
          <input
            type="text"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-bold focus:outline-none focus:border-amber-400"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
      >
        <FiSave /> Save Configuration Changes
      </button>
    </form>
  )
}
