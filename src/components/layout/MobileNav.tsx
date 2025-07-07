'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Briefcase, Calendar, Users, User } from 'lucide-react'

export default function MobileNav() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [lastScrollY])

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
    },
    {
      name: 'Services',
      href: '/services',
      icon: Users,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                active
                  ? 'text-accent-green'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'text-accent-green' : 'text-text-muted'}`} />
              <span className={`text-xs font-medium ${active ? 'text-accent-green' : 'text-text-muted'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
