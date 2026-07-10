import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { IoRestaurantOutline, IoBicycleOutline, IoFastFoodOutline } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth.js'
import { USER_ROLES } from '../../utils/constants.js'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.CUSTOMER)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    }
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    // Simulate API registration call
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setLoading(false)

    // Log the user in with mock data
    const mockUser = {
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      role: selectedRole,
    }

    login(mockUser)
    toast.success(`Welcome to PlateMate, ${mockUser.name}!`)
    
    // Redirect based on role
    if (selectedRole === USER_ROLES.RESTAURANT) {
      navigate('/restaurant/dashboard')
    } else if (selectedRole === USER_ROLES.DELIVERY) {
      navigate('/delivery/dashboard')
    } else {
      navigate('/')
    }
  }

  const rolesConfig = [
    {
      id: USER_ROLES.CUSTOMER,
      title: 'Customer',
      description: 'Order food online',
      icon: IoFastFoodOutline,
    },
    {
      id: USER_ROLES.RESTAURANT,
      title: 'Partner',
      description: 'List your restaurant',
      icon: IoRestaurantOutline,
    },
    {
      id: USER_ROLES.DELIVERY,
      title: 'Rider',
      description: 'Earn with delivery',
      icon: IoBicycleOutline,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-card overflow-hidden grid md:grid-cols-2 min-h-[650px] border border-gray-100 animate-scale-in">
        
        {/* Left Side: Premium Aesthetic Panel */}
        <div className="gradient-bg hidden md:flex flex-col justify-between p-12 text-white relative overflow-hidden">
          {/* Subtle design elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="flex items-center gap-3 z-10">
            <IoRestaurantOutline className="text-3xl" />
            <span className="text-2xl font-extrabold tracking-tight">PlateMate</span>
          </div>

          <div className="z-10 max-w-sm">
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Join the PlateMate Family
            </h1>
            <p className="text-white/80 text-lg">
              Explore mouth-watering collections, register your eatery, or deliver orders with absolute flexibility.
            </p>
          </div>

          <div className="z-10 flex gap-6 text-sm text-white/60">
            <span>© {new Date().getFullYear()} PlateMate Inc.</span>
            <Link to="/privacy" className="hover:text-white transition-smooth">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-smooth">Terms</Link>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="text-center md:text-left mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 font-medium">Join us and start your delicious journey</p>
          </div>

          {/* Role Selection Grid */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Choose your profile
            </label>
            <div className="grid grid-cols-3 gap-3">
              {rolesConfig.map((role) => {
                const Icon = role.icon
                const isSelected = selectedRole === role.id
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-smooth cursor-pointer ${
                      isSelected
                        ? 'border-[#FF4F5A] bg-[#FF4F5A]/5 text-[#FF4F5A] ring-2 ring-[#FF4F5A]/15'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className={`text-xl mb-1.5 ${isSelected ? 'text-[#FF4F5A]' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold block">{role.title}</span>
                    <span className="text-[9px] text-gray-400 mt-0.5 leading-none hidden sm:block">
                      {role.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiUser className="text-lg" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  className={`block w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${
                    errors.fullName ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                  } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiMail className="text-lg" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`block w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                  } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FiPhone className="text-lg" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number',
                    },
                  })}
                  className={`block w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${
                    errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                  } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FiLock className="text-lg" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Must be at least 6 chars',
                      },
                    })}
                    className={`block w-full pl-11 pr-10 py-2.5 bg-gray-50 border ${
                      errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                    } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-smooth"
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FiLock className="text-lg" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                    className={`block w-full pl-11 pr-10 py-2.5 bg-gray-50 border ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                    } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-smooth"
                  >
                    {showConfirmPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start py-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF4F5A] focus:ring-[#FF4F5A] accent-[#FF4F5A]"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-gray-500 leading-normal font-medium">
                I agree to PlateMate's{' '}
                <Link to="/terms" className="text-[#FF4F5A] font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#FF4F5A] font-bold hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-smooth hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none text-base cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight className="text-lg" />
                </>
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-6 text-center text-sm text-gray-600 font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#FF4F5A] font-bold hover:text-[#E8434D] transition-smooth underline decoration-2 decoration-transparent hover:decoration-[#E8434D]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
