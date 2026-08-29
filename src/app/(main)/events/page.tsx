'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import EventCard from '@/components/features/EventCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  MapPin,
  Calendar,
  Plus,
  SlidersHorizontal,
  Video,
  Users,
  Clock,
  Sparkles,
  Ticket,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getUserProfile, listEvents, searchEvents } from '@/lib/api/client'
import { Badge } from '@/components/ui/badge'
import type { EventWithOrganizer as Event, Profile } from '@/types/database'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedEventType, setSelectedEventType] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('upcoming')
  const [virtualOnly, setVirtualOnly] = useState(false)
  const [freeOnly, setFreeOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)

  useEffect(() => {
    loadUser()
    loadEvents()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await getUserProfile<Profile>()
      setUser(data)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await listEvents<Event>({ limit: 50 })

      if (error) {
        throw error
      }

      setEvents(data ?? [])
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadEvents()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await searchEvents<Event>(searchQuery)
      
      if (error) {
        throw error
      }
      
      setEvents(data ?? [])
    } catch (error) {
      console.error('Error searching events:', error)
      toast.error('Failed to search events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
      } else {
        loadEvents()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const countries = [
    'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Ethiopia', 'Uganda', 'Tanzania',
    'United States', 'United Kingdom', 'Canada', 'United Arab Emirates', 'Australia', 'Germany'
  ]

  const eventTypes = [
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'networking', label: 'Networking' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'business', label: 'Business' },
    { value: 'social', label: 'Social' },
    { value: 'celebration', label: 'Celebration' },
  ]

  const timeframes = [
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'past', label: 'Past Events' },
  ]

  const filteredEvents = events.filter(event => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedCountry !== 'all' && event.country?.toLowerCase() !== selectedCountry) {
      return false
    }
    if (selectedEventType !== 'all' && event.event_type !== selectedEventType) {
      return false
    }
    if (virtualOnly && !event.is_virtual) {
      return false
    }
    if (freeOnly && !event.is_free) {
      return false
    }
    return true
  })

  const upcomingEvents = filteredEvents.filter(event => 
    new Date(event.start_date) > new Date()
  )

  const pastEvents = filteredEvents.filter(event => 
    new Date(event.start_date) <= new Date()
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--clay-200)] rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-[var(--clay-200)] rounded"></div>
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-[var(--clay-200)] rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-display text-3xl md:text-4xl font-bold text-foreground">
          Diaspora Events
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover and attend events that celebrate our heritage, build connections, and create opportunities across the Kenyan diaspora community.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="h-5 w-5 text-[var(--terracotta)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5 text-[var(--gold)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">
                    {events.reduce((acc, e) => acc + (e.current_attendees || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Attendees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Video className="h-5 w-5 text-[var(--terracotta)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{events.filter(e => e.is_virtual).length}</p>
                  <p className="text-xs text-muted-foreground">Virtual Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{events.filter(e => e.is_free).length}</p>
                  <p className="text-xs text-muted-foreground">Free Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Event name or description..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="virtual">Virtual Only</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country.toLowerCase()}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timeframe */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeframe</label>
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((timeframe) => (
                      <SelectItem key={timeframe.value} value={timeframe.value}>
                        {timeframe.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Virtual Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="virtual-only"
                  checked={virtualOnly}
                  onCheckedChange={(checked) => setVirtualOnly(checked === true)}
                />
                <label htmlFor="virtual-only" className="text-sm font-medium flex items-center">
                  <Video className="h-4 w-4 mr-1" />
                  Virtual Events Only
                </label>
              </div>

              {/* Free Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="free-only"
                  checked={freeOnly}
                  onCheckedChange={(checked) => setFreeOnly(checked === true)}
                />
                <label htmlFor="free-only" className="text-sm font-medium">
                  Free Events Only
                </label>
              </div>

              {/* Create Event Button */}
              <Button asChild className="w-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white">
                <Link href="/events/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="lg:col-span-3">
          <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {upcomingEvents.length} Upcoming Events
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Don&apos;t miss out on these amazing opportunities
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="relative">
                      <EventCard event={event} />
                      <div className="flex items-center gap-2 mt-2 ml-4">
                        {event.is_virtual && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                            <Video className="h-3 w-3 mr-1" />
                            Virtual Event
                          </Badge>
                        )}
                        {event.is_free && (
                          <Badge variant="secondary" className="bg-[var(--terracotta)]/10 text-[var(--terracotta)] border-[var(--terracotta)]/20">
                            <Ticket className="h-3 w-3 mr-1" />
                            Free Entry
                          </Badge>
                        )}
                        {event.current_attendees && event.max_attendees && 
                         event.current_attendees >= event.max_attendees * 0.8 && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Almost Full
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No upcoming events found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your filters or check back later for new events
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('')
                        setSelectedCountry('all')
                        setSelectedEventType('all')
                        setVirtualOnly(false)
                        setFreeOnly(false)
                      }}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {pastEvents.length} Past Events
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    See what you missed and get inspired for future events
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {pastEvents.length > 0 ? (
                  pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No past events found
                      </h3>
                      <p className="text-muted-foreground">
                        Past events will appear here once they&apos;ve concluded
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
