import { FiAlertTriangle, FiX } from 'react-icons/fi'

export function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary'
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null

  const confirmColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/30',
    primary: 'gradient-bg hover:shadow-glow text-white focus:ring-primary/30',
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-card-hover border border-gray-100 dark:border-slate-800 animate-scale-in relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-smooth focus-ring"
          aria-label="Close modal"
        >
          <FiX className="text-xl" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 mb-5">
          <FiAlertTriangle className="text-2xl" />
        </div>

        {/* Content */}
        <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-smooth text-sm focus-ring"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-1/2 py-3 px-4 rounded-xl font-semibold transition-smooth flex items-center justify-center text-sm focus-ring ${
              confirmColors[confirmVariant] || confirmColors.danger
            } disabled:opacity-50`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
