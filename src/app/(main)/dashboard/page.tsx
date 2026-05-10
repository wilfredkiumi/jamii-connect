'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PostCard from '@/components/features/PostCard'
import JobCard from '@/components/features/JobCard'
import EventCard from '@/components/features/EventCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  MapPin,
  Search,
  Filter,
  Plus,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Star,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getUserProfile } from '@/lib/amplify/auth'

interface DashboardStats {
  totalMembers: number
  activeJobs: number
  upcomingEvents: number
  newConnections: number
}

interface User {
  id: string
  firstName: string
  lastName: string
  location?: string
  verified?: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeJobs: 0,
    upcomingEvents: 0,
    newConnections: 0,
  })
  const [posts, setPosts] = useState([])
  const [jobs, setJobs] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadDashboardData()
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const profile = await getUserProfile()
      if (profile) {
        setUser({
          id: profile.id,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          location: profile.location,
          verified: profile.verified,
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load stats (mock data for now - replace with API calls)
      setStats({
        totalMembers: 45672,
        activeJobs: 1234,
        upcomingEvents: 89,
        newConnections: 156,
      })

      // Load recent posts (mock data - replace with API calls)
      setPosts([
        {
          id: '1',
          content: 'Just landed my dream job at a tech company in Toronto! The diaspora network really works. Shoutout to everyone who supported me on this journey. 🇰🇪🇨🇦 #DiasporaSuccess #TechJobs',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            id: '1',
            name: 'Amara Okafor',
            avatar: '/avatars/grace.jpg',
            location: 'Toronto, Canada',
            verified: true,
          },
          images: ['/images/celebration.jpg'],
          likesCount: 45,
          commentsCount: 12,
          sharesCount: 8,
          isLiked: false,
          isBookmarked: false,
          tags: ['tech', 'success', 'canada'],
        },
        {
          id: '2',
          content: 'Starting a new business venture focused on connecting African artisans with global markets. Looking for partners and investors who share the vision! 🌍✨ #AfricanBusiness #GlobalMarkets',
          images: ['/images/artisans.jpg'],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author: {
            id: '2',
            name: 'David Kamau',
            avatar: '/avatars/david.jpg',
            location: 'Nairobi, Kenya',
            verified: false,
          },
          likesCount: 78,
          commentsCount: 23,
          sharesCount: 15,
          isLiked: true,
          isBookmarked: true,
          tags: ['business', 'artisans', 'investment'],
        },
        {
          id: '3',
          content: 'Hosting a virtual meetup for African professionals in the UK next Friday! Join us to discuss career growth and networking opportunities. Link in comments 👇 #AfricansInUK #Networking',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          author: {
            id: '3',
            name: 'Sarah Muthoni',
            avatar: '/avatars/sarah.jpg',
            location: 'London, UK',
            verified: true,
          },
          likesCount: 34,
          commentsCount: 18,
          sharesCount: 12,
          isLiked: false,
          isBookmarked: false,
          tags: ['networking', 'uk', 'meetup'],
        },
      ])

      // Load featured jobs (mock data - replace with API calls)
      setJobs([
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'Safaricom PLC',
          companyLogo: '/logos/safaricom.png',
          location: 'Nairobi, Kenya',
          jobType: 'Full-time',
          workType: 'Hybrid',
          salaryMin: 2500000,
          salaryMax: 4000000,
          currency: 'KES',
          description: 'Join our growing team building fintech solutions for the African market. Diaspora experience valued.',
          requirements: ['React', 'Node.js', 'TypeScript', 'Mobile Money APIs'],
          postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isBookmarked: false,
          applicationsCount: 23,
          experienceLevel: 'Senior',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
          diasporaFriendly: true,
          visaSponsorship: false,
        },
        {
          id: '2',
          title: 'Marketing Manager - Africa',
          company: 'Microsoft',
          companyLogo: '/logos/microsoft.png',
          location: 'Lagos, Nigeria',
          jobType: 'Full-time',
          workType: 'Remote',
          salaryMin: 80000,
          salaryMax: 120000,
          currency: 'USD',
          description: 'Lead marketing initiatives across African markets. Diaspora background preferred for cultural insights.',
          requirements: ['Marketing', 'Digital Strategy', 'African Markets'],
          postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          isBookmarked: true,
          applicationsCount: 45,
          experienceLevel: 'Mid',
          skills: ['Marketing', 'Strategy', 'Analytics', 'Leadership'],
          diasporaFriendly: true,
          visaSponsorship: true,
        },
      ])

      // Load upcoming events (mock data - replace with API calls)
      setEvents([
        {
          id: '1',
          title: 'African Diaspora UK Annual Convention 2024',
          description: 'Annual gathering of African professionals in the UK. Network, learn, and celebrate our heritage together.',
          image: '/images/convention.jpg',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'London, UK',
          locationType: 'in-person',
          category: 'networking',
          price: 50,
          currency: 'GBP',
          capacity: 500,
          attendeeCount: 234,
          isFree: false,
          organizer: {
            id: '1',
            name: 'African Diaspora UK',
            avatar: '/logos/kduk.png',
          },
          isBookmarked: false,
          isAttending: true,
          tags: ['networking', 'professional', 'culture'],
        },
        {
          id: '2',
          title: 'Tech Skills Workshop: AI for African Markets',
          description: 'Learn how to leverage AI technologies for African market solutions. Hands-on workshop with industry experts.',
          image: '/images/ai-workshop.jpg',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Virtual Event',
          locationType: 'virtual',
          category: 'workshop',
          price: 0,
          currency: 'USD',
          capacity: 200,
          attendeeCount: 156,
          isFree: true,
          organizer: {
            id: '2',
            name: 'African Tech Hub',
            avatar: '/logos/afritech.png',
          },
          isBookmarked: true,
          isAttending: false,
          tags: ['tech', 'ai', 'education'],
        },
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const countries = [
    'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Ethiopia', 'Uganda', 'Tanzania',
    'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France'
  ]

  const categories = [
    'Technology', 'Business', 'Culture', 'Education', 'Healthcare',
    'Finance', 'Arts', 'Sports', 'Community', 'Career'
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-display text-3xl md:text-4xl font-bold text-foreground">
          Welcome back{user ? `, ${user.firstName}` : ''}! 🌍
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Stay connected with the African diaspora community. Share your journey, find opportunities, and build lasting connections across the globe.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[var(--terracotta)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--terracotta)]">{stats.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across 50+ countries</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--terracotta)]">{stats.activeJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[var(--gold)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Connections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--gold)]">{stats.newConnections}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild className="h-20 bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)]">
          <Link href="/posts/new">
            <div className="flex flex-col items-center space-y-2">
              <Plus className="h-5 w-5" />
              <span>Share Your Story</span>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20">
          <Link href="/jobs">
            <div className="flex flex-col items-center space-y-2">
              <Briefcase className="h-5 w-5" />
              <span>Find Opportunities</span>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20">
          <Link href="/events">
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="h-5 w-5" />
              <span>Join Events</span>
            </div>
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts, jobs, events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full md:w-48">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country.toLowerCase()}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Community Feed</span>
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Featured Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming Events</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/posts">View All Posts</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}