import { useState } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver.js'

export default function AppDownload() {
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue] = useState('')
  const [ref, isVisible] = useIntersectionObserver()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (contactValue.trim()) {
      alert(`App link sent to your ${contactMethod}: ${contactValue}`)
      setContactValue('')
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50" id="appDownload">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          ref={ref}
          className={`flex flex-col md:flex-row items-center gap-12 md:gap-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Phone Mockup */}
          <div className="shrink-0 w-64 md:w-72 h-[420px] md:h-[480px] rounded-[30px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80"
              alt="PlateMate app on phone"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Get the <span className="gradient-text">PlateMate</span> App
            </h2>
            <p className="text-gray-500 mb-7">
              We will send you a link, open it on your phone to download the app
            </p>

            <form onSubmit={handleSubmit}>
              {/* Radio Group */}
              <div className="flex gap-6 mb-5 justify-center md:justify-start">
                {['email', 'phone'].map(method => (
                  <label key={method} className="flex items-center gap-2 text-[0.95rem] cursor-pointer text-gray-800">
                    <input
                      type="radio"
                      name="contactMethod"
                      value={method}
                      checked={contactMethod === method}
                      onChange={() => {
                        setContactMethod(method)
                        setContactValue('')
                      }}
                      className="w-4.5 h-4.5 accent-[#FF4F5A]"
                    />
                    {method === 'email' ? 'Email' : 'Phone'}
                  </label>
                ))}
              </div>

              {/* Input Group */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    id="contactInput"
                    value={contactValue}
                    onChange={e => setContactValue(e.target.value)}
                    placeholder=" "
                    required
                    className="w-full py-3.5 px-4 border-[1.5px] border-gray-300 rounded-xl text-base outline-none transition-smooth focus:border-[#FF4F5A] focus:shadow-[0_0_0_3px_rgba(255,79,90,0.1)] bg-white peer"
                  />
                  <label
                    htmlFor="contactInput"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.95rem] text-gray-400 pointer-events-none transition-all duration-300 bg-white px-1 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#FF4F5A] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#FF4F5A]"
                  >
                    {contactMethod === 'email' ? 'Email address' : 'Phone number'}
                  </label>
                </div>
                <button
                  type="submit"
                  className="py-3.5 px-7 gradient-bg text-white rounded-xl text-[0.95rem] font-semibold whitespace-nowrap transition-smooth hover:shadow-[0_6px_20px_rgba(255,79,90,0.35)] hover:-translate-y-0.5"
                >
                  Share App Link
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mb-3">Download app from</p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a href="#" className="transition-smooth hover:scale-105">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
                  alt="Get it on Google Play"
                  className="h-11 rounded-lg"
                />
              </a>
              <a href="#" className="transition-smooth hover:scale-105">
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on App Store"
                  className="h-11 rounded-lg"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
