/**
 * RestaurantLogoUpload.jsx — Reusable Logo Uploader Component
 */

import { useState, useRef } from 'react'
import { FiCamera, FiCheck, FiX } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function RestaurantLogoUpload({
  currentLogoUrl,
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

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid image format. Allowed: JPEG, PNG, WEBP')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File size exceeds limit (${MAX_SIZE_MB}MB)`)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch {}
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const activeImage = previewUrl || currentLogoUrl

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group">
        <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center relative">
          {activeImage ? (
            <img src={activeImage} alt="Restaurant Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-black text-gray-300">LOGO</span>
          )}

          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
              <span className="text-[0.65rem] font-bold">{progress}%</span>
            </div>
          )}
        </div>

        {!loading && !selectedFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-2.5 rounded-full shadow-glow hover:scale-110 transition-smooth cursor-pointer"
            title="Change Logo"
          >
            <FiCamera className="text-sm" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile && !loading && (
        <div className="flex items-center gap-2 animate-fade-in">
          <button
            type="button"
            onClick={handleUpload}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <FiCheck /> Upload Logo
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  )
}
