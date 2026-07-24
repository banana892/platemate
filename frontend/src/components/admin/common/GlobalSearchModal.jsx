/**
 * GlobalSearchModal.jsx — Command Palette Style Global Search Component (Phase F4)
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiX, FiUser, FiShoppingBag, FiFileText } from 'react-icons/fi'
import useAdminDashboard from '../../../hooks/useAdminDashboard.js'

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const { globalSearchResults, searchGlobal, searchLoading } = useAdminDashboard()
  const navigate = useNavigate()

  useEffect(() => {
    if (query.trim().length >= 2) {
      searchGlobal(query)
    }
  }, [query, searchGlobal])

  if (!isOpen) return null

  const handleSelect = (path) => {
    onClose()
    setQuery('')
    navigate(path)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-100">
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <FiSearch className="text-xl text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Global search across users, restaurants, riders, orders..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {searchLoading && <div className="text-center py-6 text-slate-400 text-sm">Searching records...</div>}

          {!searchLoading && query.trim().length >= 2 && (
            <>
              {/* Users */}
              {globalSearchResults.users?.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FiUser /> Users ({globalSearchResults.users.length})
                  </div>
                  <div className="space-y-1">
                    {globalSearchResults.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelect('/admin/users')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors"
                      >
                        <span className="font-semibold text-slate-200">{u.name} ({u.email})</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-amber-400 font-mono">{u.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurants */}
              {globalSearchResults.restaurants?.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FiShoppingBag /> Restaurants ({globalSearchResults.restaurants.length})
                  </div>
                  <div className="space-y-1">
                    {globalSearchResults.restaurants.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect('/admin/restaurants')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors"
                      >
                        <span className="font-semibold text-slate-200">{r.name} ({r.cuisine})</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">{r.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders */}
              {globalSearchResults.orders?.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FiFileText /> Orders ({globalSearchResults.orders.length})
                  </div>
                  <div className="space-y-1">
                    {globalSearchResults.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleSelect('/admin/orders')}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors"
                      >
                        <span className="font-semibold text-slate-200">Order #{o.id} - {o.customerName} (${o.totalAmount})</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-mono">{o.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {globalSearchResults.users?.length === 0 &&
                globalSearchResults.restaurants?.length === 0 &&
                globalSearchResults.orders?.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-sm">No matching records found for "{query}"</div>
                )}
            </>
          )}

          {query.trim().length < 2 && (
            <div className="text-center py-6 text-slate-500 text-sm">Type at least 2 characters to search...</div>
          )}
        </div>
      </div>
    </div>
  )
}
