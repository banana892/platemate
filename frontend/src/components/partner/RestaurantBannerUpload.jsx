/**
 * RestaurantBannerUpload.jsx — Reusable Banner Uploader Component
 */

import { useState, useRef } from 'react'
import { FiCamera, FiCheck } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function RestaurantBannerUpload({
  currentBannerUrl,
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

  const activeImage = previewUrl || currentBannerUrl

  return (
    <div className="space-y-3 w-full">
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-36 sm:h-44 w-full flex items-center justify-center">
        {activeImage ? (
          <img src={activeImage} alt="Restaurant Banner" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 font-bold text-sm">NO BANNER UPLOADED</span>
        )}

        {loading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mb-1" />
            <span className="text-xs font-bold">{progress}% Uploading</span>
          </div>
        )}

        {!loading && !selectedFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-gray-800 px-3.5 py-2 rounded-xl shadow-md hover:bg-white transition-smooth text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FiCamera className="text-sm text-orange-600" />
            <span>Change Banner</span>
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
        <div className="flex items-center justify-end gap-2 animate-fade-in">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-glow"
          >
            <FiCheck className="text-sm" />
            <span>Upload Banner Image</span>
          </button>
        </div>
      )}
    </div>
  )
}
