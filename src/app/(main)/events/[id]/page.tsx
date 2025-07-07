'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'
// import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Share2,
  Bookmark,
  ArrowLeft,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description: string
  image_url?: string
  start_date: string
  end_date?: string
  location?: string
  country?: string
  is_virtual: boolean
  event_type: 'conference' | 'workshop' | 'networking' | 'cultural' | 'business' | 'social'
  price?: number
  currency: string
  max_attendees?: number
  current_attendees: number
  is_free: boolean
  registration_url?: string
  tags: string[]
  organizer: {
    id: string
    name: string
    avatar_url?: string
    organization?: string
  }
  created_at: string
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isAttending, setIsAttending] = useState(false)
  const [attendeesCount, setAttendeesCount] = useState(0)
  
  // const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadEvent(params.id as string)
    }
  }, [params.id])

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true)
      
      // Mock event data for now
      const mockEvent: Event = {
        id: eventId,
        title: 'Caribbean Tech Summit 2024',
        description: `Join us for the most anticipated tech event in the Caribbean! The Caribbean Tech Summit 2024 brings together the brightest minds in technology from across the region and diaspora.

This three-day summit will feature:

🎯 **Keynote Speakers**: Industry leaders from major tech companies
🚀 **Startup Showcase**: Emerging Caribbean tech startups
🤝 **Networking Sessions**: Connect with fellow professionals
💡 **Workshops**: Hands-on sessions on latest technologies
🌍 **Diaspora Panel**: Success stories from Caribbean tech professionals worldwide

Whether you're a seasoned professional, entrepreneur, or just starting your tech journey, this summit offers something for everyone. Come be part of the movement that's putting Caribbean tech on the global map!

**What's Included:**
- All conference sessions and workshops
- Welcome reception and networking dinner
- Lunch and refreshments
- Conference swag bag
- Access to exclusive online community

**Special Diaspora Track:**
We&apos;re featuring a special track for diaspora professionals, including sessions on remote work, building global teams, and giving back to the Caribbean tech ecosystem.`,
        image_url: '/api/placeholder/800/400',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Kingston Convention Centre',
        country: 'Jamaica',
        is_virtual: false,
        event_type: 'conference',
        price: 150,
        currency: 'USD',
        max_attendees: 500,
        current_attendees: 234,
        is_free: false,
        registration_url: 'https://caribbeantech.com/summit2024',
        tags: ['tech', 'caribbean', 'networking', 'startups', 'diaspora'],
        organizer: {
          id: '1',
          name: 'Caribbean Tech Alliance',
          avatar_url: '',
          organization: 'CTA',
        },
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      setEvent(mockEvent)
      setAttendeesCount(mockEvent.current_attendees)
      
      // Check if user has bookmarked or is attending
      setIsBookmarked(false)
      setIsAttending(false)
      
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    } catch {
      setIsBookmarked(isBookmarked)
      toast.error('Failed to update bookmark')
    }
  }

  const handleRSVP = async () => {
    try {
      setIsAttending(!isAttending)
      setAttendeesCount(isAttending ? attendeesCount - 1 : attendeesCount + 1)
      toast.success(isAttending ? 'RSVP cancelled' : 'RSVP confirmed! See you there!')
    } catch {
      setIsAttending(isAttending)
      setAttendeesCount(attendeesCount)
      toast.error('Failed to update RSVP')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      }
    } catch {
      toast.error('Failed to share event')
    }
  }

  const handleRegister = () => {
    if (event?.registration_url) {
      window.open(event.registration_url, '_blank')
    } else {
      handleRSVP()
    }
  }

  const formatPrice = () => {
    if (event?.is_free) return 'Free'
    if (!event?.price) return 'Price TBA'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(event.price)
  }

  const getEventStatus = () => {
    if (!event) return { status: 'unknown', color: 'bg-gray-100 text-gray-800' }
    
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = event.end_date ? new Date(event.end_date) : startDate

    if (isBefore(now, startDate)) {
      return { status: 'upcoming', color: 'bg-green-100 text-green-800' }
    } else if (isAfter(now, endDate)) {
      return { status: 'past', color: 'bg-gray-100 text-gray-800' }
    } else {
      return { status: 'ongoing', color: 'bg-red-100 text-red-800' }
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      'conference': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-green-100 text-green-800',
      'networking': 'bg-purple-100 text-purple-800',
      'cultural': 'bg-orange-100 text-orange-800',
      'business': 'bg-indigo-100 text-indigo-800',
      'social': 'bg-pink-100 text-pink-800',
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
      'Ethiopia': '🇪🇹', 'Jamaica': '🇯🇲', 'Trinidad and Tobago': '🇹🇹',
      'Barbados': '🇧🇧', 'Haiti': '🇭🇹', 'United States': '🇺🇸',
      'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'France': '🇫🇷', 'Germany': '🇩🇪',
    }
    return countryFlags[country] || '🌍'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-96 bg-neutral-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Event not found</h1>
        <p className="text-text-muted mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/events">Browse All Events</Link>
        </Button>
      </div>
    )
  }

  const eventStatus = getEventStatus()
  const isEventFull = event.max_attendees && attendeesCount >= event.max_attendees
  const canRSVP = eventStatus.status === 'upcoming' && !isEventFull

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header */}
          <Card>
            {event.image_url && (
              <div className="relative w-full h-64 overflow-hidden rounded-t-lg">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={eventStatus.color}>
                    {eventStatus.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={event.is_free ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {formatPrice()}
                  </Badge>
                </div>
              </div>
            )}
            <CardHeader>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-text-primary">{event.title}</h1>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type.toUpperCase()}
                  </Badge>
                  {event.is_virtual && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Virtual
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-text-muted">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">
                      {format(new Date(event.start_date), 'EEEE, MMMM dd, yyyy')}
                      {event.end_date && format(new Date(event.end_date), 'MMMM dd, yyyy') !== format(new Date(event.start_date), 'MMMM dd, yyyy') && 
                        ` - ${format(new Date(event.end_date), 'EEEE, MMMM dd, yyyy')}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{format(new Date(event.start_date), 'h:mm a')}</span>
                    {event.end_date && (
                      <span>- {format(new Date(event.end_date), 'h:mm a')}</span>
                    )}
                  </div>

                  {!event.is_virtual && event.location && (
                    <div className="flex items-center space-x-2">
                      {event.country && <span>{getCountryFlag(event.country)}</span>}
                      <MapPin className="h-5 w-5" />
                      <span>{event.location}{event.country && `, ${event.country}`}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>
                      {attendeesCount} attending
                      {event.max_attendees && ` • ${event.max_attendees - attendeesCount} spots left`}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Event Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral max-w-none">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-text-secondary whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {event.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/events?tag=${encodeURIComponent(tag)}`}
                      className="inline-block px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-text-secondary text-sm rounded-full transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <Card>
            <CardHeader>
              <CardTitle>Join This Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-green mb-1">
                  {formatPrice()}
                </div>
                {!event.is_free && (
                  <p className="text-sm text-text-muted">per person</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Date:</span>
                  <span className="font-medium">{format(new Date(event.start_date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Time:</span>
                  <span className="font-medium">{format(new Date(event.start_date), 'h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Attendees:</span>
                  <span className="font-medium">{attendeesCount}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {canRSVP ? (
                  <Button 
                    onClick={handleRegister}
                    className="w-full bg-accent-green hover:bg-green-700 text-white"
                  >
                    {event.registration_url ? 'Register Now' : (isAttending ? 'Going' : 'RSVP')}
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {isEventFull ? 'Event Full' : eventStatus.status === 'past' ? 'Event Ended' : 'Event Ongoing'}
                  </Button>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className="flex-1"
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer */}
          <Card>
            <CardHeader>
              <CardTitle>Organized by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.organizer.avatar_url} alt={event.organizer.name} />
                  <AvatarFallback>
                    {event.organizer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-text-primary">{event.organizer.name}</h3>
                  {event.organizer.organization && (
                    <p className="text-sm text-text-muted">{event.organizer.organization}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Event Type:</span>
                <span className="font-medium capitalize">{event.event_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Format:</span>
                <span className="font-medium">{event.is_virtual ? 'Virtual' : 'In-Person'}</span>
              </div>
              {event.max_attendees && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Capacity:</span>
                  <span className="font-medium">{event.max_attendees} people</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-muted">Created:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
