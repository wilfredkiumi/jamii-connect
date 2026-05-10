'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Briefcase,
  Calendar,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  MessageCircle,
  Handshake,
  Home,
  BookOpen,
} from 'lucide-react';
import { signOutUser, getUserProfile } from '@/lib/amplify/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

const navigation = [
  { name: 'Forums', href: '/forums', icon: MessageCircle },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Services', href: '/services', icon: Handshake },
  { name: 'Connect', href: '/connections', icon: Users },
  { name: 'Blog', href: '/blog', icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          });
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success('Signed out');
      setUser(null);
      router.push('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--clay-200)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--clay)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="text-display text-lg text-[var(--clay)] hidden sm:block">
            Jamii
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-[var(--clay-100)] text-[var(--clay)]'
                  : 'text-[var(--clay-600)] hover:text-[var(--clay)] hover:bg-[var(--clay-100)]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 bg-[var(--clay-200)] animate-pulse rounded-full" />
          ) : user ? (
            <>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4 text-[var(--clay-600)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--terracotta)] rounded-full" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-[var(--clay)] text-white text-xs">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-[var(--clay-500)]">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><Home className="mr-2 h-4 w-4" />Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><Settings className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[var(--clay-600)] hidden sm:inline-flex" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white h-8 px-4 text-sm" asChild>
                <Link href="/signup">Join</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-50 border-t border-[var(--clay-200)] bg-white lg:hidden">
            <nav className="mx-auto max-w-7xl px-6 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-[var(--clay-100)] text-[var(--clay)]'
                        : 'text-[var(--clay-600)] hover:bg-[var(--clay-100)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
