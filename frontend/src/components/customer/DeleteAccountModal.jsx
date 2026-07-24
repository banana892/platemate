/**
 * DeleteAccountModal.jsx — Production-Grade Account Deletion Confirmation Modal
 */

import { useState, useEffect } from 'react'
import { FiAlertTriangle, FiTrash2, FiX, FiLock } from 'react-icons/fi'

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail = '',
  isLoading = false,
}) {
  const [confirmationInput, setConfirmationInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('')
      setPasswordInput('')
      setErrorMsg('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const trimmedConfirm = confirmationInput.trim()
  const trimmedEmail = (userEmail || '').trim().toLowerCase()

  // Extra confirmation requirement: must type DELETE or user's email address
  const isConfirmationValid =
    trimmedConfirm === 'DELETE' ||
    trimmedConfirm.toLowerCase() === trimmedEmail

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isConfirmationValid || isLoading) return

    setErrorMsg('')
    try {
      await onConfirm({
        confirmation: trimmedConfirm,
        password: passwordInput,
      })
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to delete account. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-smooth disabled:opacity-50"
        >
          <FiX className="text-xl" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl flex-shrink-0">
            <FiAlertTriangle />
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-xl font-bold text-gray-900">
              Delete Account
            </h3>
            <p className="text-xs text-red-500 font-semibold tracking-wide uppercase">
              Permanent Action
            </p>
          </div>
        </div>

        {/* Warning Message Box */}
        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-900 leading-relaxed space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <span>⚠ This action is permanent.</span>
          </p>
          <p className="text-red-700">
            Deleting your account will remove your profile and personal information. This action cannot be undone.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              To confirm, type <span className="text-red-600 font-mono">DELETE</span> or your email address:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={userEmail ? `DELETE or ${userEmail}` : 'DELETE'}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-mono transition-smooth disabled:bg-gray-50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FiLock className="text-xs text-gray-500" />
              <span>Password (optional for Google Accounts):</span>
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter your current password"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-smooth disabled:bg-gray-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100 border border-gray-200 transition-smooth cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isConfirmationValid || isLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-smooth cursor-pointer ${
                isConfirmationValid && !isLoading
                  ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-95'
                  : 'bg-red-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FiTrash2 />
                  <span>Delete Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
