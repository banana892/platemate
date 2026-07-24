import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiCheckCircle, FiCreditCard } from 'react-icons/fi'
import { IoBicycleOutline } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthThunk, updateProfile } from '../../store/slices/authSlice.js'

export default function RiderOnboardingComplete() {
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const tokenProcessed = useRef(false)

  // Process token if present in URL (OAuth redirect)
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && !tokenProcessed.current) {
      tokenProcessed.current = true
      localStorage.setItem('accessToken', token)
      dispatch(checkAuthThunk())
    }
  }, [searchParams, dispatch])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: user?.phone || '',
      vehicleType: 'MOTORCYCLE',
      vehicleNumber: '',
      licenseNumber: '',
    },
  })

  useEffect(() => {
    if (user?.phone) {
      setValue('phone', user.phone)
    }
  }, [user, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Save/update user profile or rider onboarding info
      dispatch(updateProfile({
        phone: data.phone,
        vehicleType: data.vehicleType,
        vehicleNumber: data.vehicleNumber,
        licenseNumber: data.licenseNumber,
        isOnboarded: true,
      }))

      toast.success('Rider registration completed successfully!')
      navigate('/rider/dashboard', { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Failed to complete registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-card overflow-hidden border border-gray-100 p-8 sm:p-12 animate-scale-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4F5A]/10 text-[#FF4F5A] mb-4">
            <IoBicycleOutline className="text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Complete Rider Registration
          </h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            Your Google account is connected. Please provide your vehicle and delivery info to get started.
          </p>
        </div>

        {/* User Card - Prefilled from Google */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/75 rounded-2xl p-4 mb-8 flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User'}
              className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FF4F5A] text-white font-bold text-xl flex items-center justify-center shadow-sm">
              {(user?.name || 'R')[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate">{user?.name || 'Rider'}</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                <FiCheckCircle className="text-xs" /> Verified Google
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Read-Only Full Name & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUser className="text-base" />
                </div>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="block w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium cursor-not-allowed text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiMail className="text-base" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium cursor-not-allowed text-sm"
                />
              </div>
            </div>
          </div>

          {/* Required Rider Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="phone">
              Phone Number <span className="text-[#FF4F5A]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiPhone className="text-lg" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="10-digit phone number"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                  errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="vehicleType">
                Vehicle Type <span className="text-[#FF4F5A]">*</span>
              </label>
              <select
                id="vehicleType"
                {...register('vehicleType', { required: 'Vehicle type is required' })}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20 rounded-xl text-gray-900 outline-none focus:ring-4 transition-smooth text-[0.95rem]"
              >
                <option value="BICYCLE">Bicycle</option>
                <option value="SCOOTER">Electric Scooter</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="CAR">Car</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="vehicleNumber">
                Vehicle Plate / Registration # <span className="text-[#FF4F5A]">*</span>
              </label>
              <input
                id="vehicleNumber"
                type="text"
                placeholder="e.g. KA-01-AB-1234"
                {...register('vehicleNumber', {
                  required: 'Vehicle registration number is required',
                })}
                className={`block w-full px-4 py-3 bg-gray-50 border ${
                  errors.vehicleNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
              />
              {errors.vehicleNumber && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.vehicleNumber.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="licenseNumber">
              Driving License Number <span className="text-[#FF4F5A]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FiCreditCard className="text-lg" />
              </div>
              <input
                id="licenseNumber"
                type="text"
                placeholder="e.g. DL-1420110012345"
                {...register('licenseNumber', {
                  required: 'Driving license number is required',
                })}
                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                  errors.licenseNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
              />
            </div>
            {errors.licenseNumber && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.licenseNumber.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 gradient-bg text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-smooth hover:scale-[1.01] disabled:opacity-50 text-base cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Complete Rider Setup</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
