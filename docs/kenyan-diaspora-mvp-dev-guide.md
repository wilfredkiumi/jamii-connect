# Jamii Connect - Kenyan Diaspora UK Platform Development Guide

> **⚠️ IMPORTANT NOTE**: This guide contains references to Supabase, but the project now uses **AWS DynamoDB, Cognito, and Lambda**. Please refer to the main README.md and infrastructure/README.md for current setup instructions. This document will be updated to reflect the AWS stack.

## Project Overview
A modern Progressive Web App (PWA) connecting the Kenyan diaspora in the UK through jobs, events, community discussions, and services.

## Design Philosophy: 60/30/10 Rule
This design follows the professional 60/30/10 color distribution rule:
- **60% Neutral** (whites, grays) - Creates breathing room and professional feel
- **30% Secondary** (soft greens, warm beiges) - Adds visual interest without overwhelming
- **10% Accent** (Kenyan flag green) - Reserved for CTAs and key actions only

This creates a clean, modern interface that feels professional while maintaining cultural identity through strategic use of Kenyan flag colors.

## Tech Stack Decision
**Framework**: Next.js 14 (App Router) + TypeScript
- **Why**: Server-side rendering, excellent PWA support, modern React features, great developer experience
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Deployment**: Vercel (seamless Next.js integration)

## Color Theme - "Kenyan Heritage Modern" (60/30/10 Rule)
```css
/* 60/30/10 Design Rule Implementation
   60% - Neutral colors (backgrounds, large surfaces)
   30% - Secondary color (sections, cards, supporting elements)
   10% - Accent color (CTAs, important actions, highlights)
*/

:root {
  /* 60% - Dominant Neutral Palette */
  --neutral-50: #FAFAFA;
  --neutral-100: #F5F5F5;
  --neutral-200: #E5E5E5;
  --neutral-300: #D4D4D4;
  --neutral-400: #A3A3A3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
  
  /* 30% - Secondary Colors (Kenyan flag inspired, muted) */
  --secondary-green: #E6F3EC;     /* Light green for backgrounds */
  --secondary-green-dark: #C4E0D1; /* Slightly darker for hover states */
  --secondary-warmth: #FFF8F3;    /* Warm beige for sections */
  
  /* 10% - Accent Colors (Kenyan flag colors for CTAs) */
  --accent-green: #006B3F;        /* Kenyan flag green - primary CTAs */
  --accent-red: #BB0000;          /* Kenyan flag red - alerts/urgent */
  --accent-gold: #FFC72C;         /* Gold for special highlights */
  
  /* Semantic Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Text Colors */
  --text-primary: #171717;        /* Main text */
  --text-secondary: #525252;      /* Secondary text */
  --text-muted: #737373;          /* Muted text */
}

/* Typography - Using Inter for modern feel */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Usage Guidelines:
   - Backgrounds: Use neutral-50, neutral-100
   - Cards/Sections: Use secondary-green, secondary-warmth
   - Primary buttons: Use accent-green
   - Text: Use text-primary for headings, text-secondary for body
   - Borders: Use neutral-200 or neutral-300
*/
```

## Database Schema (Supabase)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles extending Supabase auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  hometown_kenya TEXT,
  profession TEXT,
  company TEXT,
  skills TEXT[],
  looking_for TEXT[], -- ['jobs', 'housing', 'networking', 'mentorship']
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community posts/discussions
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'general', 'help', 'social', 'professional'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs board
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'full-time', 'part-time', 'contract', 'internship'
  location TEXT NOT NULL,
  salary_range TEXT,
  description TEXT NOT NULL,
  requirements TEXT[],
  application_url TEXT,
  application_email TEXT,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Events
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'social', 'professional', 'cultural', 'sports'
  location_name TEXT NOT NULL,
  location_address TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_url TEXT,
  cover_image TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services directory
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'legal', 'financial', 'health', 'education', 'business'
  description TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  website TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic examples)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Project Structure

```
jamii-connect/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   └── features/
│       ├── JobCard.tsx
│       ├── PostCard.tsx
│       └── EventCard.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── types/
│   └── database.ts
└── public/
```

## Environment Variables (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Initial Setup Commands

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest jamii-connect --typescript --tailwind --app

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @hookform/resolvers react-hook-form zod
npm install date-fns

# Install shadcn/ui CLI
npx shadcn-ui@latest init

# Add shadcn/ui components
npx shadcn-ui@latest add button card input label form toast avatar dropdown-menu dialog tabs badge
```

## Page 1: Landing Page (app/page.tsx)

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Users, Briefcase, Calendar, Home, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-accent-green" />,
      title: "Connect with Community",
      description: "Join thousands of Kenyans in the UK. Share experiences, ask questions, and build lasting friendships."
    },
    {
      icon: <Briefcase className="w-8 h-8 text-accent-green" />,
      title: "Find Opportunities",
      description: "Discover jobs from diaspora-friendly employers who value your unique background and skills."
    },
    {
      icon: <Calendar className="w-8 h-8 text-accent-green" />,
      title: "Attend Events",
      description: "From nyama choma gatherings to professional networking, never miss out on community events."
    },
    {
      icon: <Home className="w-8 h-8 text-accent-green" />,
      title: "Trusted Services",
      description: "Find verified Kenyan professionals - lawyers, accountants, and businesses you can trust."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Wanjiru",
      role: "NHS Nurse, Manchester",
      quote: "Finally, a place where I can connect with other Kenyans who understand the journey. Found my current flat through a connection here!"
    },
    {
      name: "James Ochieng",
      role: "Software Engineer, London",
      quote: "The job board helped me find a company that actually values diversity. Plus, I've made genuine friends through the meetups."
    }
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - 60% neutral background */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
            <span className="text-white font-bold">JC</span>
          </div>
          <span className="text-xl font-bold text-text-primary">Jamii Connect</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-text-secondary hover:text-text-primary" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button className="bg-accent-green hover:bg-green-700 text-white" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-text-primary">
          Karibu to Your UK
          <span className="text-accent-green"> Kenyan Community</span>
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
          Connect with fellow Kenyans, find opportunities, and build your life in the UK with the support of your community.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-accent-green hover:bg-green-700 text-white" asChild>
            <Link href="/signup">
              Join the Community
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-neutral-300 text-text-primary hover:bg-neutral-100" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
        
        {/* Stats - Using secondary colors */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div className="bg-secondary-green rounded-lg p-4">
            <div className="text-3xl font-bold text-accent-green">2,500+</div>
            <div className="text-text-secondary">Active Members</div>
          </div>
          <div className="bg-secondary-green rounded-lg p-4">
            <div className="text-3xl font-bold text-accent-green">150+</div>
            <div className="text-text-secondary">Monthly Jobs</div>
          </div>
          <div className="bg-secondary-green rounded-lg p-4">
            <div className="text-3xl font-bold text-accent-green">50+</div>
            <div className="text-text-secondary">Events Monthly</div>
          </div>
        </div>
      </section>

      {/* Features Section - 30% secondary background */}
      <section id="features" className="bg-secondary-warmth py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">Everything You Need in One Place</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-neutral-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-text-primary">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Back to neutral */}
      <section className="bg-neutral-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-primary">What Our Community Says</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-neutral-200">
                <CardContent className="p-6">
                  <p className="text-text-secondary mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-text-primary">{testimonial.name}</div>
                    <div className="text-sm text-text-muted">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Secondary background for contrast */}
      <section className="bg-secondary-green py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-text-primary">Ready to Join Your Community?</h2>
          <p className="text-xl text-text-secondary mb-8">
            Start connecting with fellow Kenyans in the UK today.
          </p>
          <Button size="lg" className="bg-accent-green hover:bg-green-700 text-white" asChild>
            <Link href="/signup">
              Create Your Free Account
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
```

## Page 2: Sign Up (app/(auth)/signup/page.tsx)

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: fullName,
            username: email.split('@')[0], // Default username
          })

        if (profileError) throw profileError

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })

        router.push('/dashboard')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md bg-white border-neutral-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">JC</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-text-primary">Karibu! Join Jamii Connect</CardTitle>
          <CardDescription className="text-center text-text-secondary">
            Connect with the Kenyan community in the UK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-text-primary">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Kamau"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-neutral-300 focus:border-accent-green"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-neutral-300 focus:border-accent-green"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text-primary">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-neutral-300 focus:border-accent-green"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent-green hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-muted">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full border-neutral-300 text-text-primary hover:bg-neutral-100" disabled>
            Continue with Google (Coming Soon)
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-green hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

## Page 3: Community Dashboard (app/(main)/dashboard/page.tsx)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Search, Plus } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  likes_count: number
  comments_count: number
  profiles: {
    full_name: string
    avatar_url: string
  }
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (activeTab !== 'all') {
        query = query.eq('category', activeTab)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-50 text-blue-700',
      help: 'bg-red-50 text-red-700',
      social: 'bg-green-50 text-green-700',
      professional: 'bg-purple-50 text-purple-700'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - White background (60% neutral) */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">JC</span>
                </div>
                <span className="text-xl font-bold text-text-primary hidden md:inline">Jamii Connect</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4 max-w-md flex-1 mx-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search community..."
                  className="pl-10 border-neutral-300 focus:border-accent-green"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <nav className="flex items-center space-x-4">
              <Button asChild className="bg-accent-green hover:bg-green-700 text-white">
                <Link href="/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
              <Avatar className="border-2 border-neutral-200">
                <AvatarFallback className="bg-neutral-100 text-text-primary">JK</AvatarFallback>
              </Avatar>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed - White cards on neutral background */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-text-primary">Community Feed</CardTitle>
                <CardDescription className="text-text-secondary">Latest discussions from the Kenyan community</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-neutral-100">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="help">Help</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="space-y-4 mt-6">
                    {isLoading ? (
                      <div className="text-center py-8 text-text-muted">Loading posts...</div>
                    ) : posts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-text-secondary mb-4">No posts yet in this category</p>
                        <Button asChild className="bg-accent-green hover:bg-green-700 text-white">
                          <Link href="/posts/new">Be the first to post!</Link>
                        </Button>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <Card key={post.id} className="bg-white border-neutral-200 hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-start space-x-4">
                              <Avatar className="border-2 border-neutral-200">
                                <AvatarImage src={post.profiles.avatar_url} />
                                <AvatarFallback className="bg-neutral-100 text-text-primary">
                                  {post.profiles.full_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-text-primary">{post.profiles.full_name}</h3>
                                    <p className="text-sm text-text-muted">{formatDate(post.created_at)}</p>
                                  </div>
                                  <Badge className={getCategoryColor(post.category)}>
                                    {post.category}
                                  </Badge>
                                </div>
                                <h4 className="text-lg font-medium mb-2 text-text-primary">{post.title}</h4>
                                <p className="text-text-secondary line-clamp-3">{post.content}</p>
                                
                                <div className="flex items-center space-x-4 mt-4">
                                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-accent-green">
                                    <Heart className="h-4 w-4 mr-1" />
                                    {post.likes_count}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-accent-green">
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {post.comments_count}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-accent-green">
                                    <Share2 className="h-4 w-4 mr-1" />
                                    Share
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Using secondary colors for variety */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-neutral-200">
              <CardHeader className="bg-secondary-green rounded-t-lg">
                <CardTitle className="text-text-primary">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-6">
                <Button asChild variant="outline" className="w-full justify-start border-neutral-300 text-text-primary hover:bg-neutral-100">
                  <Link href="/jobs">
                    <Briefcase className="h-4 w-4 mr-2 text-accent-green" />
                    Browse Jobs
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-neutral-300 text-text-primary hover:bg-neutral-100">
                  <Link href="/events">
                    <Calendar className="h-4 w-4 mr-2 text-accent-green" />
                    Upcoming Events
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start border-neutral-300 text-text-primary hover:bg-neutral-100">
                  <Link href="/services">
                    <Users className="h-4 w-4 mr-2 text-accent-green" />
                    Find Services
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Events Preview */}
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-text-primary">Upcoming Events</CardTitle>
                <CardDescription className="text-text-secondary">Don't miss out!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-secondary-warmth rounded-lg">
                  <h4 className="font-medium text-text-primary">Kenyan Professionals Meetup</h4>
                  <p className="text-sm text-text-secondary">Sat, Jan 20 • London</p>
                </div>
                <div className="p-3 bg-secondary-warmth rounded-lg">
                  <h4 className="font-medium text-text-primary">Nyama Choma Social</h4>
                  <p className="text-sm text-text-secondary">Sun, Jan 21 • Birmingham</p>
                </div>
                <Button asChild variant="link" className="w-full text-accent-green hover:text-green-700">
                  <Link href="/events">View all events →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-white border-neutral-200">
              <CardHeader>
                <CardTitle className="text-text-primary">Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Total Members</span>
                    <span className="font-semibold text-text-primary">2,543</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Posts Today</span>
                    <span className="font-semibold text-text-primary">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Active Now</span>
                    <span className="font-semibold text-accent-green">124</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
```

## Page 4: Jobs Board (app/(main)/jobs/page.tsx)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Building, Clock, DollarSign, Search, Filter, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  company_name: string
  job_title: string
  job_type: string
  location: string
  salary_range: string
  description: string
  requirements: string[]
  application_url: string
  application_email: string
  created_at: string
  views_count: number
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchQuery, jobTypeFilter, locationFilter, jobs])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
      setFilteredJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = [...jobs]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Job type filter
    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.job_type === jobTypeFilter)
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredJobs(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Posted today'
    if (diffInDays === 1) return 'Posted yesterday'
    if (diffInDays < 7) return `Posted ${diffInDays} days ago`
    if (diffInDays < 30) return `Posted ${Math.floor(diffInDays / 7)} weeks ago`
    return `Posted ${Math.floor(diffInDays / 30)} months ago`
  }

  const getJobTypeBadgeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-50 text-green-700',
      'part-time': 'bg-blue-50 text-blue-700',
      'contract': 'bg-purple-50 text-purple-700',
      'internship': 'bg-orange-50 text-orange-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700'
  }

  const incrementViewCount = async (jobId: string) => {
    await supabase
      .from('jobs')
      .update({ views_count: jobs.find(j => j.id === jobId)?.views_count || 0 + 1 })
      .eq('id', jobId)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - White background (60% neutral) */}
      <header className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JC</span>
              </div>
              <span className="text-xl font-bold text-text-primary hidden md:inline">Jamii Connect</span>
            </Link>
            <Button asChild className="bg-accent-green hover:bg-green-700 text-white">
              <Link href="/jobs/post">Post a Job</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-text-primary">Jobs Board</h1>
          <p className="text-text-secondary">Find opportunities with diaspora-friendly employers</p>
        </div>

        {/* Filters - Secondary background for contrast */}
        <Card className="mb-8 bg-secondary-warmth border-neutral-200">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="sr-only">Search jobs</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-4 w-4" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search job title, company, or keywords..."
                    className="pl-10 bg-white border-neutral-300 focus:border-accent-green"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="job-type" className="sr-only">Job type</Label>
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger id="job-type" className="bg-white border-neutral-300">
                    <SelectValue placeholder="Job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location" className="sr-only">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-white border-neutral-300 focus:border-accent-green"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 bg-white border-neutral-200">
              <div className="text-center text-text-muted">Loading jobs...</div>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card className="p-8 bg-white border-neutral-200">
              <div className="text-center">
                <p className="text-text-secondary mb-4">No jobs found matching your criteria</p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setJobTypeFilter('all')
                  setLocationFilter('')
                }} className="bg-accent-green hover:bg-green-700 text-white">
                  Clear filters
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="text-sm text-text-secondary mb-4">
                Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              </div>
              {filteredJobs.map((job) => (
                <Card key={job.id} className="bg-white border-neutral-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => incrementViewCount(job.id)}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 text-text-primary">{job.job_title}</h3>
                        <div className="flex items-center gap-4 text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <Badge className={getJobTypeBadgeColor(job.job_type)}>
                        {job.job_type.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-text-secondary mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        {job.salary_range && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary_range}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(job.created_at)}
                        </span>
                        <span>{job.views_count} views</span>
                      </div>
                      
                      <Button size="sm" className="bg-accent-green hover:bg-green-700 text-white">
                        View Details
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  ))
}
```

## Page 5: User Profile (app/(main)/profile/page.tsx)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Camera, MapPin, Briefcase, Phone, Mail, Edit2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
  location: string
  hometown_kenya: string
  profession: string
  company: string
  skills: string[]
  looking_for: string[]
  whatsapp_number: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newSkill, setNewSkill] = useState('')
  const supabase = createClientComponentClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedProfile) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedProfile.username,
          full_name: editedProfile.full_name,
          bio: editedProfile.bio,
          location: editedProfile.location,
          hometown_kenya: editedProfile.hometown_kenya,
          profession: editedProfile.profession,
          company: editedProfile.company,
          skills: editedProfile.skills,
          looking_for: editedProfile.looking_for,
          whatsapp_number: editedProfile.whatsapp_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', editedProfile.id)

      if (error) throw error

      setProfile(editedProfile)
      setIsEditing(false)
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const addSkill = () => {
    if (newSkill && editedProfile) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        skills: editedProfile.skills.filter(s => s !== skill)
      })
    }
  }

  const toggleLookingFor = (item: string) => {
    if (editedProfile) {
      const looking_for = editedProfile.looking_for.includes(item)
        ? editedProfile.looking_for.filter(l => l !== item)
        : [...editedProfile.looking_for, item]
      
      setEditedProfile({
        ...editedProfile,
        looking_for
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Loading profile...</div>
      </div>
    )
  }

  if (!profile || !editedProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-500">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JC</span>
              </div>
              <span className="text-xl font-bold hidden md:inline">Jamii Connect</span>
            </Link>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-primary-green hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button size="sm" variant="outline" className="absolute bottom-0 right-0 rounded-full p-2">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editedProfile.full_name}
                        onChange={(e) => setEditedProfile({...editedProfile, full_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editedProfile.username}
                        onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
                    <p className="text-neutral-600 mb-4">@{profile.username}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </span>
                      )}
                      {profile.profession && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {profile.profession} {profile.company && `at ${profile.company}`}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    placeholder="Tell the community about yourself..."
                    rows={4}
                  />
                ) : (
                  <p className="text-neutral-700">
                    {profile.bio || 'No bio added yet'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Background */}
            <Card>
              <CardHeader>
                <CardTitle>Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="hometown">Hometown in Kenya</Label>
                      <Input
                        id="hometown"
                        value={editedProfile.hometown_kenya || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, hometown_kenya: e.target.value})}
                        placeholder="e.g., Nairobi, Kisumu, Mombasa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession">Profession</Label>
                      <Input
                        id="profession"
                        value={editedProfile.profession || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, profession: e.target.value})}
                        placeholder="e.g., Software Engineer, Nurse, Teacher"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        value={editedProfile.company || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, company: e.target.value})}
                        placeholder="Where do you work?"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Hometown:</span>
                      <span>{profile.hometown_kenya || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Profession:</span>
                      <span>{profile.profession || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Company:</span>
                      <span>{profile.company || 'Not specified'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editedProfile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="pr-1">
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:bg-neutral-300 rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-neutral-500">No skills added yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Looking For */}
            <Card>
              <CardHeader>
                <CardTitle>I'm Looking For</CardTitle>
                <CardDescription>Let the community know how they can help</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-2">
                    {['jobs', 'housing', 'networking', 'mentorship', 'business partners'].map((item) => (
                      <label key={item} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editedProfile.looking_for.includes(item)}
                          onChange={() => toggleLookingFor(item)}
                          className="rounded"
                        />
                        <span className="capitalize">{item}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.looking_for.length > 0 ? (
                      profile.looking_for.map((item) => (
                        <Badge key={item} className="bg-primary-green text-white capitalize">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-neutral-500">Not specified</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Your contact details are only visible to logged-in members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={editedProfile.whatsapp_number || ''}
                        onChange={(e) => setEditedProfile({...editedProfile, whatsapp_number: e.target.value})}
                        placeholder="+44 7XXX XXXXXX"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profile.whatsapp_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-600" />
                        <span>{profile.whatsapp_number}</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-500">No recent activity</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
```

## Additional Setup Files

### Supabase Client (lib/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Supabase Server (lib/supabase/server.ts)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### Tailwind Config Update (tailwind.config.ts)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 60% - Neutral colors (main backgrounds)
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // 30% - Secondary colors (sections, cards)
        'secondary-green': '#E6F3EC',
        'secondary-green-dark': '#C4E0D1',
        'secondary-warmth': '#FFF8F3',
        // 10% - Accent colors (CTAs, highlights)
        'accent-green': '#006B3F',
        'accent-red': '#BB0000',
        'accent-gold': '#FFC72C',
        // Text colors
        'text-primary': '#171717',
        'text-secondary': '#525252',
        'text-muted': '#737373',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```

## Next Steps

1. **Set up Supabase Project**
   - Create a new Supabase project
   - Run the SQL schema in the Supabase SQL editor
   - Copy environment variables to `.env.local`

2. **Install and Configure**
   - Run the setup commands
   - Initialize shadcn/ui with the color theme
   - Test authentication flow

3. **Deploy**
   - Push to GitHub
   - Deploy on Vercel
   - Connect Supabase environment variables

4. **Immediate Enhancements**
   - Add email verification
   - Implement password reset
   - Add image uploads for avatars
   - Create post creation flow
   - Add real-time features for chat

This MVP focuses on the core features identified in the research while keeping the codebase manageable and scalable. The modern stack ensures good performance and developer experience.