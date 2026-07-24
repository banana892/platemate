/**
 * AvatarUpload.jsx — Reusable Avatar Uploader Component
 */

import { useState, useRef } from 'react'
import { FiCamera, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function AvatarUpload({
  currentAvatarUrl,
  userName = 'User',
  onUpload,
  loading = false,
  progress = 0,
}) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. MIME validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WEBP image.')
      return
    }

    // 2. Size validation
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile || !onUpload) return
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch {}
  }

  const handleCancelPreview = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const activeImage = previewUrl || currentAvatarUrl

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'PM'

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Avatar Container */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-card bg-gray-100 flex items-center justify-center relative">
          {activeImage ? (
            <img
              src={activeImage}
              alt={`${userName}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-bg flex items-center justify-center text-white text-4xl font-extrabold">
              {initials}
            </div>
          )}

          {/* Loading overlay with progress */}
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mb-1" />
              <span className="text-xs font-bold">{progress}%</span>
            </div>
          )}
        </div>

        {/* Change button overlay */}
        {!loading && !selectedFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 gradient-bg text-white p-2.5 rounded-full shadow-glow hover:scale-110 transition-smooth cursor-pointer"
            title="Upload new avatar"
            aria-label="Upload new avatar"
          >
            <FiCamera className="text-lg" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview Confirmation Controls */}
      {selectedFile && !loading && (
        <div className="flex items-center gap-2 animate-fade-in">
          <button
            type="button"
            onClick={handleConfirmUpload}
            className="gradient-bg text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-glow transition-smooth cursor-pointer"
          >
            <FiCheck className="text-sm" />
            <span>Upload Picture</span>
          </button>
          <button
            type="button"
            onClick={handleCancelPreview}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-gray-200 transition-smooth cursor-pointer"
          >
            <FiX className="text-sm" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {/* Format Info */}
      {!selectedFile && !loading && (
        <div className="text-xs text-gray-400 font-medium max-w-xs">
          JPEG, PNG or WEBP up to {MAX_SIZE_MB}MB
        </div>
      )}
    </div>
  )
}
