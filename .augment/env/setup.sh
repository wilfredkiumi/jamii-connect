#!/bin/bash

cd /mnt/persist/workspace

# Create MobileNav component
cat << 'EOF' > src/components/layout/MobileNav.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface Profile {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  protected?: boolean
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  navigation: NavigationItem[]
  user: User | null
  profile: Profile | null
  onSignOut: () => void
  isActive: (href: string) => boolean
}

export function MobileNav({
  isOpen,
  onClose,
  navigation,
  user,
  profile,
  onSignOut,
  isActive,
}: MobileNavProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl z-50 md:hidden">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">JC</span>
              </div>
              <span className="text-lg font-bold text-text-primary">Jamii Connect</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {user && (
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                  <AvatarFallback className="bg-accent-green text-white">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              if (item.protected && !user) return null
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-accent-green bg-secondary-green'
                      : 'text-text-secondary hover:text-text-primary hover:bg-neutral-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-neutral-200">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-neutral-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-neutral-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    onSignOut()
                    onClose()
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  onClick={onClose}
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  className="w-full bg-accent-green hover:bg-green-700 text-white"
                  asChild
                  onClick={onClose}
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
EOF

# Create Footer component
cat << 'EOF' > src/components/layout/Footer.tsx
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-800 text-neutral-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">JC</span>
              </div>
              <span className="text-xl font-bold">Jamii Connect</span>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md">
              Connecting the Kenyan community in the UK. Find opportunities, build relationships, 
              and create your home away from home with fellow Kenyans.
            </p>
            
            <div className="space-y-2 text-sm text-neutral-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>hello@jamiiconnect.co.uk</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+44 20 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>London, United Kingdom</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">About Us</Link></li>
              <li><Link href="/guidelines" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Community Guidelines</Link></li>
              <li><Link href="/stories" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Success Stories</Link></li>
              <li><Link href="/events" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Events</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Job Board</Link></li>
              <li><Link href="/services" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Services Directory</Link></li>
              <li><Link href="/guide" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">UK Living Guide</Link></li>
              <li><Link href="/faq" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Help Center</Link></li>
              <li><Link href="/contact" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Contact Us</Link></li>
              <li><Link href="/report" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Report Issue</Link></li>
              <li><Link href="/feedback" className="text-neutral-300 hover:text-accent-green transition-colors text-sm">Feedback</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-neutral-400 text-sm">
              © {currentYear} Jamii Connect. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <Link href="#" className="text-neutral-400 hover:text-accent-green transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-accent-green transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-accent-green transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-neutral-400 hover:text-accent-green transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
EOF

# Create index file
cat << 'EOF' > src/components/layout/index.ts
export { Header } from './Header'
export { Footer } from './Footer'
export { MobileNav } from './MobileNav'
EOF

echo "All layout components created successfully"