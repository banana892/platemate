/**
 * ProfileForm.jsx — Rider Profile Edit & Avatar Upload Form (Phase F3)
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiPhone, FiCamera, FiSave, FiAlertCircle } from 'react-icons/fi'
import mediaService from '../../../services/media.service.js'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Valid phone number required'),
  emergencyContact: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Valid emergency contact required').optional().or(z.literal('')),
})

export default function ProfileForm({ profile = null, onSubmit, isLoading = false }) {
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || '')
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      emergencyContact: profile?.settings?.emergencyContact || profile?.emergencyContact || '',
    },
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const res = await mediaService.uploadImage(file, 'riders/avatars')
      const uploadedUrl = res?.secure_url || res?.url
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl)
      }
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleFormSubmit = (data) => {
    if (onSubmit) {
      onSubmit({ ...data, avatar: avatarUrl })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative group">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-500/20"
          />
          <label className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-500 cursor-pointer transition-transform group-hover:scale-110">
            <FiCamera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
        </div>
        {uploading && <span className="text-xs font-semibold text-orange-600 animate-pulse">Uploading photo...</span>}
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
            Full Name
          </label>

          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              {...register('name')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
              placeholder="Your full name"
            />
          </div>

          {errors.name && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>{errors.name.message}</span>
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>

          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              {...register('phone')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
              placeholder="+91 9876543210"
            />
          </div>

          {errors.phone && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>{errors.phone.message}</span>
            </p>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
            Emergency Contact Number
          </label>

          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              {...register('emergencyContact')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
              placeholder="+91 9123456789"
            />
          </div>

          {errors.emergencyContact && (
            <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
              <FiAlertCircle className="w-3.5 h-3.5" />
              <span>{errors.emergencyContact.message}</span>
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || uploading}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <FiSave className="w-4 h-4" />
        <span>Save Profile Changes</span>
      </button>
    </form>
  )
}
