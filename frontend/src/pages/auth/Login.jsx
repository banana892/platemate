import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { IoRestaurantOutline } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { checkAuthThunk } from '../../store/slices/authSlice.js'
import { useAuth } from '../../hooks/useAuth.js'
import { getDashboardRoute } from '../../utils/constants.js'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Guard: ensure the OAuth callback is only processed once, even across re-renders.
  // Without this, an unstable function reference in the dep array causes the effect
  // to re-fire after every Redux state update, creating an infinite redirect loop.
  const callbackProcessed = useRef(false)

  const getRedirectPath = (role, fromParam) => {
    if (fromParam && fromParam.startsWith('/')) return fromParam
    return getDashboardRoute(role)
  }

  // Handle Google OAuth Callback Token in URL if present.
  // Deps: only [searchParams] — all other refs (dispatch, navigate) are stable by spec.
  // We intentionally exclude any hook-derived functions that are recreated each render.
  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')
    const redirectParam = searchParams.get('redirect')

    if (token) {
      // Prevent re-execution if Redux state update causes a re-render before navigation
      if (callbackProcessed.current) return
      callbackProcessed.current = true

      localStorage.setItem('accessToken', token)

      // Use dispatch directly — it is a stable reference guaranteed by React-Redux.
      // DO NOT use checkAuth() from useAuth() here: it is not memoized and recreates
      // on every render, which would cause this effect to re-run infinitely.
      dispatch(checkAuthThunk())
        .unwrap()
        .then((user) => {
          toast.success(`Welcome back, ${user?.name || 'User'}!`)
          const target = getRedirectPath(user?.role, redirectParam)
          navigate(target, { replace: true })
        })
        .catch(() => {
          callbackProcessed.current = false // allow retry if auth check fails
          localStorage.removeItem('accessToken')
          toast.error('Authentication verification failed.')
        })
    } else if (errorParam) {
      toast.error(decodeURIComponent(errorParam))
    }
  }, [searchParams, dispatch, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await login({ email: data.email, password: data.password })
      const userObj = res?.user || res
      const redirectParam = searchParams.get('redirect')
      toast.success(`Welcome back, ${userObj?.name || 'User'}!`)
      const targetPath = getRedirectPath(userObj?.role, redirectParam)
      navigate(targetPath)
    } catch (err) {
      toast.error(err || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    window.location.href = `${apiBase}/auth/google`
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-card overflow-hidden grid md:grid-cols-2 min-h-[600px] border border-gray-100">
        
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
              Discover great food, everywhere.
            </h1>
            <p className="text-white/80 text-lg">
              Log in to order from the best local restaurants, track your deliveries, and enjoy hot meals at your doorstep.
            </p>
          </div>

          <div className="z-10 flex gap-6 text-sm text-white/60">
            <span>© {new Date().getFullYear()} PlateMate Inc.</span>
            <Link to="/privacy" className="hover:text-white transition-smooth">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-smooth">Terms</Link>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
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
                  className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                  } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#FF4F5A] hover:text-[#E8434D] transition-smooth"
                >
                  Forgot Password?
                </Link>
              </div>
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
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`block w-full pl-11 pr-12 py-3 bg-gray-50 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#FF4F5A] focus:ring-[#FF4F5A]/20'
                  } rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:ring-4 transition-smooth text-[0.95rem]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-smooth"
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-smooth hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none text-base cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="text-lg" />
                </>
              )}
            </button>

            {/* Social Login Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-smooth hover:border-gray-300 text-[0.95rem] cursor-pointer"
            >
              <FcGoogle className="text-xl" />
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-8 text-center text-sm text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#FF4F5A] font-bold hover:text-[#E8434D] transition-smooth underline decoration-2 decoration-transparent hover:decoration-[#E8434D]"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
