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
import { getUserProfile, listPosts, listJobs, listEvents } from '@/lib/api/client'
import type { Profile, PostWithAuthor, Job, EventWithOrganizer } from '@/types/database'

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
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [events, setEvents] = useState<EventWithOrganizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadDashboardData()
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: profile, error } = await getUserProfile<Profile>()
    if (error || !profile) {
      if (error) console.error('Error loading user:', error)
      return
    }
    const [firstName = '', ...rest] = (profile.full_name ?? '').split(' ')
    setUser({
      id: profile.id,
      firstName,
      lastName: rest.join(' '),
      location: profile.location ?? undefined,
      verified: profile.is_verified,
    })
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [postsResult, jobsResult, eventsResult] = await Promise.all([
        listPosts<PostWithAuthor>({ limit: 10 }),
        listJobs<Job>({ limit: 4 }),
        listEvents<EventWithOrganizer>({ limit: 4 }),
      ])

      setPosts(postsResult.data ?? [])
      setJobs(jobsResult.data ?? [])
      setEvents(eventsResult.data ?? [])

      // Headline counts are derived from what was returned. A dedicated
      // /api/stats endpoint should replace this once the counts need to be
      // exact rather than indicative.
      setStats({
        totalMembers: 0,
        activeJobs: jobsResult.data?.length ?? 0,
        upcomingEvents: eventsResult.data?.length ?? 0,
        newConnections: 0,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard')
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