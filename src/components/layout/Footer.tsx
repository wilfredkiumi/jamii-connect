import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--clay)] text-[var(--clay-300)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--terracotta)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-display text-lg text-white">Jamii</span>
            </div>
            <p className="text-sm text-[var(--clay-400)] leading-relaxed max-w-xs">
              Connecting African &amp; Caribbean diaspora communities across the UK.
              Built by diaspora, for diaspora.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/forums" className="hover:text-white transition-colors">Forums</Link></li>
              <li><Link href="/connections" className="hover:text-white transition-colors">Connect</Link></li>
            </ul>
          </div>

          {/* Communities */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Communities</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/communities/kenyan" className="hover:text-white transition-colors">🇰🇪 Kenyan</Link></li>
              <li><Link href="/communities/nigerian" className="hover:text-white transition-colors">🇳🇬 Nigerian</Link></li>
              <li><Link href="/communities/ghanaian" className="hover:text-white transition-colors">🇬🇭 Ghanaian</Link></li>
              <li><Link href="/communities/caribbean" className="hover:text-white transition-colors">🇯🇲 Caribbean</Link></li>
              <li><Link href="/communities" className="text-[var(--terracotta-light)] hover:text-[var(--terracotta)] transition-colors">View all →</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[var(--clay-700)] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--clay-500)]">
            © {currentYear} Jamii Connect. For the diaspora, by the diaspora.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-[var(--clay-500)] hover:text-white transition-colors text-xs">
              Twitter
            </Link>
            <Link href="#" className="text-[var(--clay-500)] hover:text-white transition-colors text-xs">
              Instagram
            </Link>
            <Link href="#" className="text-[var(--clay-500)] hover:text-white transition-colors text-xs">
              LinkedIn
            </Link>
            <Link href="#" className="text-[var(--clay-500)] hover:text-white transition-colors text-xs">
              WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
