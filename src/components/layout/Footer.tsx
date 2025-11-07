import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    community: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Mission', href: '/mission' },
      { name: 'Success Stories', href: '/stories' },
      { name: 'Community Guidelines', href: '/guidelines' },
    ],
    resources: [
      { name: 'Job Board', href: '/jobs' },
      { name: 'Events', href: '/events' },
      { name: 'Services Directory', href: '/services' },
      { name: 'Mentorship', href: '/mentorship' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Report Issue', href: '/report' },
      { name: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Data Protection', href: '/data-protection' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'YouTube', href: '#', icon: Youtube },
  ]

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JC</span>
              </div>
              <span className="text-xl font-bold">Jamii Connect</span>
            </div>
            <p className="text-neutral-300 text-sm mb-6">
              Uniting the African and Caribbean diaspora worldwide. Building bridges, creating opportunities, and celebrating our shared heritage.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-neutral-400 hover:text-accent-green transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-accent-green transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-accent-green transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-accent-green transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-accent-green transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="max-w-md">
            <h3 className="font-semibold text-white mb-2">Stay Connected</h3>
            <p className="text-neutral-300 text-sm mb-4">
              Get the latest updates on diaspora opportunities and community events.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:border-accent-green"
              />
              <button className="px-4 py-2 bg-accent-green hover:bg-green-700 text-white rounded-md transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            © {currentYear} Jamii Connect. Empowering the diaspora, one connection at a time.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-neutral-400 text-sm">Made with ❤️ for the diaspora</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
