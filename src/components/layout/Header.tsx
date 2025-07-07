'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Briefcase,
  Calendar,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  MessageCircle,
  Star,
  MapPin,
  Plus,
} from 'lucide-react';
import { signOutUser, getUserProfile } from '@/lib/amplify/auth';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  location?: string;
  verified?: boolean;
}

const navigation = [
  {
    name: 'Forums',
    href: '/forums',
    icon: MessageCircle,
    description: 'Discuss topics with the community',
  },
  {
    name: 'Connect',
    href: '/connections',
    icon: Users,
    description: 'Network with fellow Africans',
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    description: 'Community events and gatherings',
  },
  {
    name: 'Services',
    href: '/services',
    icon: Star,
    description: 'Find trusted service providers',
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
    description: 'Find diaspora-friendly opportunities',
  },
  {
    name: 'Blogs',
    href: '/blog',
    icon: Home,
    description: 'Read our latest articles and stories',
  },
  {
    name: 'Resources',
    href: '/resources',
    icon: Star,
    description: 'Access helpful documents and templates',
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
            location: profile.location,
            verified: profile.verified,
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success('Signed out successfully');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavLinks = (isMobile = false) => {
    return navigation.map((item) => {
      const Icon = item.icon;
      const isActive = isActiveRoute(item.href);

      if (isMobile) {
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 rounded-lg px-3 py-4 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex flex-col">
              <span>{item.name}</span>
              <span className="text-sm text-muted-foreground">{item.description}</span>
            </div>
          </Link>
        );
      }

      return (
        <Link
          key={item.name}
          href={item.href}
          className={`group relative flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{item.name}</span>
          {isActive && (
            <div className="absolute -bottom-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-heritage-red"></div>
          )}
        </Link>
      );
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center">
              {/* Mobile logo */}
              <Image
                src="/jamii-logo-mobile.svg"
                alt="Jamii Connect"
                width={32}
                height={32}
                className="rounded-lg shadow-lg md:hidden"
              />
              {/* Desktop logo */}
              <Image
                src="/jamii-logo.svg"
                alt="Jamii Connect"
                width={40}
                height={40}
                className="rounded-xl shadow-lg hidden md:block"
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-lg font-bold text-heritage-black leading-none">
                Jamii Connect
              </span>
              <span className="text-xs text-muted-foreground leading-none">
                African Diaspora Community
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:items-center lg:space-x-1">
          {renderNavLinks()}
        </nav>

        {/* Search Bar (Desktop and Tablet) */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {loading ? (
             <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
          ) : user ? (
            <>
              <Button size="sm" className="hidden md:flex bg-heritage-green hover:bg-green-700" asChild>
                <Link href="/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Share</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Bell className="h-5 w-5" />
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-4 w-4 justify-center rounded-full p-0 text-xs">3</Badge>
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-heritage-green text-white">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><Home className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><Settings className="mr-2 h-4 w-4" /><span>Profile</span></Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden ml-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <>
          {/* Mobile menu overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="border-t bg-background lg:hidden relative z-50">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4 md:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search the community..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1">
              {renderNavLinks(true)}
            </nav>
            
            {/* Mobile User Actions */}
            {user ? (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Button className="w-full bg-heritage-green hover:bg-green-700" asChild>
                  <Link href="/posts/new" onClick={() => setMobileMenuOpen(false)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Share with Community
                  </Link>
                </Button>
                <Button variant="outline" className="w-full sm:hidden" asChild>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full sm:hidden" asChild>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t space-y-2 sm:hidden">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button className="w-full bg-heritage-green hover:bg-green-700" asChild>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    Join Community
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </header>
  );
}

export default Header;
