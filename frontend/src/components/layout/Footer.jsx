import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHeart } from 'react-icons/fa'
import { IoRestaurantOutline } from 'react-icons/io5'
import { BRAND } from '../../utils/constants.js'

const footerLinks = {
  Company: [
    { label: 'Who We Are', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
  ],
  'For Foodies': [
    { label: 'Community', to: '/community' },
    { label: 'Mobile Apps', to: '/apps' },
    { label: 'Code of Conduct', to: '/conduct' },
  ],
  'For Restaurants': [
    { label: 'Add Restaurant', to: '/restaurant/register' },
    { label: 'PlateMate for Business', to: '/business' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Security', to: '/security' },
  ],
}

const socials = [
  { icon: FaFacebookF, label: 'Facebook', href: '#' },
  { icon: FaTwitter, label: 'Twitter', href: '#' },
  { icon: FaInstagram, label: 'Instagram', href: '#' },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: '#' },
]

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#1a1a2e] text-white/70 pt-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 pb-10">
          {/* Brand */}
          <div className="lg:max-w-[280px] shrink-0">
            <div className="flex items-center gap-2.5 text-2xl font-extrabold text-white mb-3">
              <IoRestaurantOutline className="gradient-text" />
              <span>{BRAND.name}</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">{BRAND.tagline}</p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-[10px] bg-white/[0.08] flex items-center justify-center text-white/60 transition-smooth hover:gradient-bg hover:text-white hover:-translate-y-0.5"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-white text-[0.95rem] font-semibold mb-4">{category}</h4>
                <div className="flex flex-col">
                  {links.map(link => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-[0.88rem] py-1 transition-smooth hover:text-[#FF4F5A] hover:pl-1"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.08] py-5 text-center text-[0.82rem]">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Made with{' '}
            <FaHeart className="inline text-[#FF4F5A] mx-1" />
          </p>
        </div>
      </div>
    </footer>
  )
}
