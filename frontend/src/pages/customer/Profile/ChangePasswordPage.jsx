/**
 * ChangePasswordPage.jsx — Customer Password Change Page (/profile/change-password)
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiLock, FiEye, FiEyeOff, FiCheck, FiShield } from 'react-icons/fi'
import useProfile from '../../../hooks/useProfile.js'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one digit')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ChangePasswordPage() {
  const { changingPassword, changePassword } = useProfile()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPasswordValue = watch('newPassword') || ''

  const requirements = [
    { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(newPasswordValue) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(newPasswordValue) },
    { label: 'One number (0-9)', met: /[0-9]/.test(newPasswordValue) },
    { label: 'One special character (!@#$...)', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(newPasswordValue) },
  ]

  const onSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      reset()
    } catch {}
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500">Update your security credentials to keep your account safe</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="currentPassword">
            Current Password *
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('currentPassword')}
              className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-smooth"
            >
              {showCurrent ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="newPassword">
            New Password *
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('newPassword')}
              className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                errors.newPassword ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-smooth"
            >
              {showNew ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Password Strength Checklist */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
            <FiShield className="text-emerald-500 text-sm" />
            <span>Password Policy Requirements</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    req.met ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <FiCheck />
                </div>
                <span className={req.met ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="confirmPassword">
            Confirm New Password *
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-[#FF4F5A]'
              } rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#FF4F5A]/20 transition-smooth`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-smooth"
            >
              {showConfirm ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={changingPassword}
            className="gradient-bg text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {changingPassword ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
