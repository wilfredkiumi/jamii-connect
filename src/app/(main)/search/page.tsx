'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  Building2,
  Star,
  Clock,
  Filter,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import JobCard from '@/components/features/JobCard'
import EventCard from '@/components/features/EventCard'
import PostCard from '@/components/features/PostCard'

interface SearchResult {
  id: string
  type: 'user' | 'job' | 'event' | 'post' | 'service'
  title: string
  description?: string
  location?: string
  country?: string
  image?: string
  author?: {
    name: string
    avatar: string
  }
  metadata?: any
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'user',
          title: 'Grace Wanjiku',
          description: 'Software Engineer at Safaricom Europe',
          location: 'London, UK',
          country: 'United Kingdom',
          image: '/avatars/grace.jpg',
          metadata: {
            profession: 'Software Engineer',
            company: 'Safaricom Europe',
            verified: true,
          }
        },
        {
          id: '2',
          type: 'job',
          title: 'Senior Software Engineer - Fintech',
          description: 'Join our mission to revolutionize payments across Africa. We\'re building the next generation of financial infrastructure.',
          location: 'Lagos, Nigeria',
          country: 'Nigeria',
          author: {
            name: 'AfriPay Technologies',
            avatar: '/logos/afripay.png'
          },
          metadata: {
            salary: '$80,000 - $120,000',
            type: 'Full-time',
            remote: false,
          }
        },
        {
          id: '3',
          type: 'event',
          title: 'Kenyan Diaspora UK Annual Convention 2024',
          description: 'The largest gathering of Kenyan professionals in the UK. Network, learn, and celebrate our heritage together.',
          location: 'London, UK',
          country: 'United Kingdom',
          image: '/images/convention.jpg',
          metadata: {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            price: '£75',
            attendees: 234,
          }
        },
        {
          id: '4',
          type: 'service',
          title: 'Kenyan Heritage Legal Services',
          description: 'Specialized legal services for immigration, business formation, and international law with cultural understanding.',
          location: 'London, UK',
          country: 'United Kingdom',
          author: {
            name: 'Grace Wanjiku',
            avatar: '/avatars/grace.jpg'
          },
          metadata: {
            category: 'Legal',
            rating: 4.8,
            verified: true,
          }
        },
        {
          id: '5',
          type: 'post',
          title: 'Just landed my dream job at a tech company in Toronto!',
          description: 'The diaspora network really works. Shoutout to everyone who supported me on this journey. 🇰🇪🇨🇦',
          location: 'Toronto, Canada',
          country: 'Canada',
          author: {
            name: 'David Kamau',
            avatar: '/avatars/david.jpg'
          },
          metadata: {
            likes: 45,
            comments: 12,
            shares: 8,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          }
        },
      ]

      // Filter results based on search query
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      )

      setResults(filteredResults)
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Failed to search')
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter(result => {
    if (selectedType !== 'all' && result.type !== selectedType) return false
    if (selectedCountry !== 'all' && result.country?.toLowerCase() !== selectedCountry) return false
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />
      case 'job': return <Briefcase className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'service': return <Star className="h-4 w-4" />
      case 'post': return <Users className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Kenya': '🇰🇪', 'Nigeria': '🇳🇬', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
      'United States': '🇺🇸', 'Australia': '🇦🇺', 'Germany': '🇩🇪'
    }
    return countryFlags[country] || '🌍'
  }

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {result.image ? (
            <img src={result.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
          ) : result.author?.avatar ? (
            <Avatar className="h-12 w-12">
              <AvatarImage src={result.author.avatar} alt={result.author.name} />
              <AvatarFallback>{result.author.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-heritage-green/10 flex items-center justify-center">
              {getTypeIcon(result.type)}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
              </Badge>
              {result.metadata?.verified && (
                <Badge variant="secondary" className="bg-heritage-green/10 text-heritage-green border-heritage-green/20 text-xs">
                  Verified
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
              {result.title}
            </h3>
            
            {result.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {result.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {result.location && (
                  <div className="flex items-center space-x-1">
                    <span>{getCountryFlag(result.country || '')}</span>
                    <MapPin className="h-3 w-3" />
                    <span>{result.location}</span>
                  </div>
                )}
                
                {result.author && (
                  <span>by {result.author.name}</span>
                )}
                
                {result.metadata?.date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <Link href={`/${result.type}s/${result.id}`}>
                <Button size="sm" variant="ghost" className="text-heritage-green hover:text-green-700">
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Search Results
        </h1>
        {initialQuery && (
          <p className="text-muted-foreground text-lg">
            Showing results for "{initialQuery}"
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search the diaspora community..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                performSearch(searchQuery)
              }
            }}
          />
        </div>
        <Button 
          onClick={() => performSearch(searchQuery)}
          className="bg-heritage-green hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user">People</SelectItem>
            <SelectItem value="job">Jobs</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="service">Services</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-full md:w-48">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
            <SelectItem value="united kingdom">🇬🇧 United Kingdom</SelectItem>
            <SelectItem value="united states">🇺🇸 United States</SelectItem>
            <SelectItem value="canada">🇨🇦 Canada</SelectItem>
            <SelectItem value="nigeria">🇳🇬 Nigeria</SelectItem>
          </SelectContent>
        </Select>

        {(selectedType !== 'all' || selectedCountry !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedType('all')
              setSelectedCountry('all')
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {filteredResults.length} Results Found
          </h2>
          <div className="text-sm text-muted-foreground">
            {loading && 'Searching...'}
          </div>
        </div>

        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResults.map((result) => (
              <ResultCard key={`${result.type}-${result.id}`} result={result} />
            ))}
          </div>
        ) : searchQuery ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedType('all')
                  setSelectedCountry('all')
                  setResults([])
                }}
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Your Search
              </h3>
              <p className="text-muted-foreground">
                Search for people, jobs, events, services, and posts in the Kenyan diaspora community
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}