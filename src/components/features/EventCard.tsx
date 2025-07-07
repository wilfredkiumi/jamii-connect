'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format, isAfter, isBefore } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar,
  Clock,
  MapPin,
  Users,

  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Flag,
  Share2,
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
  organizer: {
    id: string
    name: string
    avatar_url?: string
    organization?: string
  }
  is_bookmarked: boolean
  is_attending: boolean
  tags: string[]
  registration_url?: string
  created_at: string
}

interface EventCardProps {
  event: Event
  onBookmark?: (eventId: string) => void
  onRSVP?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

export default function EventCard({ event, onBookmark, onRSVP, onShare }: EventCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(event.is_bookmarked)
  const [isAttending, setIsAttending] = useState(event.is_attending)
  const [attendeesCount, setAttendeesCount] = useState(event.current_attendees)

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked)
      onBookmark?.(event.id)
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
      onRSVP?.(event.id)
      toast.success(isAttending ? 'RSVP cancelled' : 'RSVP confirmed')
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
          title: event.title,
          text: event.description.substring(0, 100) + '...',
          url: `${window.location.origin}/events/${event.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}`)
        toast.success('Link copied to clipboard')
      }
      onShare?.(event.id)
    } catch {
      toast.error('Failed to share event')
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

  const formatPrice = () => {
    if (event.is_free) return 'Free'
    if (!event.price) return 'Price TBA'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: event.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(event.price)
  }

  const getEventStatus = () => {
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

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Nigeria': '🇳🇬',
      'Ghana': '🇬🇭',
      'Kenya': '🇰🇪',
      'South Africa': '🇿🇦',
      'Ethiopia': '🇪🇹',
      'Jamaica': '🇯🇲',
      'Trinidad and Tobago': '🇹🇹',
      'Barbados': '🇧🇧',
      'Haiti': '🇭🇹',
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
    }
    return countryFlags[country] || '🌍'
  }

  const eventStatus = getEventStatus()
  const isEventFull = event.max_attendees && attendeesCount >= event.max_attendees
  const canRSVP = eventStatus.status === 'upcoming' && !isEventFull

  return (
    <Card className="w-full border border-neutral-200 hover:border-neutral-300 transition-all hover:shadow-md">
      {event.image_url && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge className={eventStatus.color}>
              {eventStatus.status.toUpperCase()}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className={event.is_free ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              {formatPrice()}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link href={`/events/${event.id}`} className="hover:underline">
              <h3 className="font-semibold text-text-primary text-lg leading-tight">{event.title}</h3>
            </Link>
            <div className="flex items-center space-x-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.organizer.avatar_url} alt={event.organizer.name} />
                <AvatarFallback className="text-xs">
                  {event.organizer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-text-secondary text-sm">
                by {event.organizer.name}
                {event.organizer.organization && ` • ${event.organizer.organization}`}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Event
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
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

          <p className="text-text-secondary text-sm line-clamp-2">{event.description}</p>

          <div className="space-y-2 text-sm text-text-muted">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(event.start_date), 'MMM dd, yyyy')}
                {event.end_date && format(new Date(event.end_date), 'MMM dd, yyyy') !== format(new Date(event.start_date), 'MMM dd, yyyy') && 
                  ` - ${format(new Date(event.end_date), 'MMM dd, yyyy')}`
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(event.start_date), 'h:mm a')}</span>
            </div>

            {!event.is_virtual && event.location && (
              <div className="flex items-center space-x-2">
                {event.country && <span>{getCountryFlag(event.country)}</span>}
                <MapPin className="h-4 w-4" />
                <span>{event.location}{event.country && `, ${event.country}`}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {attendeesCount} attending
                {event.max_attendees && ` • ${event.max_attendees - attendeesCount} spots left`}
              </span>
            </div>
          </div>

          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={index}
                  href={`/events?tag=${encodeURIComponent(tag)}`}
                  className="inline-block px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-text-muted text-xs rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
              {event.tags.length > 3 && (
                <span className="inline-block px-2 py-1 bg-neutral-100 text-text-muted text-xs rounded-full">
                  +{event.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`flex items-center space-x-2 ${
              isBookmarked ? 'text-accent-green' : 'text-text-muted hover:text-accent-green'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>Save</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
            
            {canRSVP ? (
              <Button 
                size="sm" 
                className={`${
                  isAttending 
                    ? 'bg-accent-green hover:bg-green-700 text-white' 
                    : 'bg-accent-green hover:bg-green-700 text-white'
                }`}
                onClick={handleRSVP}
              >
                {isAttending ? 'Going' : 'RSVP'}
              </Button>
            ) : (
              <Button size="sm" disabled>
                {isEventFull ? 'Event Full' : eventStatus.status === 'past' ? 'Event Ended' : 'Ongoing'}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
