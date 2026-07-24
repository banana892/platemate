/**
 * EditProfilePage.jsx — Edit Profile Details & Avatar (/profile/edit)
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiUser, FiPhone, FiMail, FiSave } from 'react-icons/fi'
import AvatarUpload from '../../../components/customer/AvatarUpload.jsx'
import useProfile from '../../../hooks/useProfile.js'

const editProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Please enter a valid phone number')
    .or(z.literal(''))
    .optional(),
})

export default function EditProfilePage() {
  const { user, updatingProfile, uploadingAvatar, avatarProgress, updateProfile, uploadAvatar } = useProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    await updateProfile(data)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Edit Profile</h2>
        <p className="text-sm text-gray-500">Update your personal information and avatar</p>
      </div>

      {/* Avatar Uploader Section */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 flex flex-col items-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Profile Picture</h3>
        <AvatarUpload
          currentAvatarUrl={user?.avatar || user?.imageUrl}
          userName={user?.name}
          onUpload={uploadAvatar}
          loading={uploadingAvatar}
          progress={avatarProgress}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="name">
            Full Name *
          </label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="name"
              type="text"
              placeholder="Your Full Name"
              {...register('name')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Email Address (Read-only) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="email">
            Email Address (Read-only)
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-[0.7rem] text-gray-400">Email address cannot be changed directly.</p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="phone">
            Phone Number
          </label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              {...register('phone')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={updatingProfile}
            className="gradient-bg text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updatingProfile ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSave className="text-base" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
