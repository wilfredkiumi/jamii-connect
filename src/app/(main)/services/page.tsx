'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
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
  Phone,
  Mail,
  ExternalLink,
  Star,
  Verified,
  Plus,
  SlidersHorizontal,
  Users,
  Briefcase,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getUserProfile, listServices, searchServices } from '@/lib/api/client'
import type { ServiceWithProvider as Service, Profile } from '@/types/database'

// full_name is nullable in the profiles table.
const providerName = (service: Service) => service.provider.full_name ?? 'Community member'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const [user, setUser] = useState<Profile | null>(null)

  useEffect(() => {
    loadUser()
    loadServices()
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await getUserProfile<Profile>()
      setUser(data)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await listServices<Service>({ limit: 50 })

      if (error) {
        throw error
      }

      setServices(data ?? [])
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Failed to load services')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadServices()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await searchServices<Service>(searchQuery)
      
      if (error) {
        throw error
      }
      
      setServices(data ?? [])
    } catch (error) {
      console.error('Error searching services:', error)
      toast.error('Failed to search services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
      } else {
        loadServices()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const categories = [
    'Legal',
    'Financial Services',
    'Technology',
    'Creative Services',
    'Food & Catering',
    'Healthcare',
    'Education',
    'Real Estate',
    'Marketing',
    'Consulting',
    'Translation',
    'Business Services',
    'Other',
  ]

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi',
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'
  ]

  const filteredServices = services.filter(service => {
    if (searchQuery && !service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false
    }
    if (selectedCountry !== 'all' && service.country?.toLowerCase() !== selectedCountry) {
      return false
    }
    if (verifiedOnly && !service.is_verified) {
      return false
    }
    return true
  })

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
      'Ethiopia': '🇪🇹', 'Jamaica': '🇯🇲', 'Trinidad and Tobago': '🇹🇹',
      'Barbados': '🇧🇧', 'Haiti': '🇭🇹', 'United States': '🇺🇸',
      'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'France': '🇫🇷', 'Germany': '🇩🇪',
    }
    return countryFlags[country] || '🌍'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

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
        <h1 className="text-display text-3xl md:text-4xl font-bold text-[var(--clay)]">
          Diaspora Services Directory
        </h1>
        <p className="text-[var(--clay-600)] text-lg max-w-2xl mx-auto">
          Discover professional services offered by talented members of the African and Caribbean diaspora community worldwide.
        </p>
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--clay-500)] h-4 w-4" />
                  <Input
                    placeholder="Service name or description..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Briefcase className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country.toLowerCase()}>
                        {getCountryFlag(country)} {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified-only"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-[var(--clay-300)]"
                />
                <label htmlFor="verified-only" className="text-sm font-medium flex items-center">
                  <Verified className="h-4 w-4 mr-1 text-[var(--terracotta)]" />
                  Verified Services Only
                </label>
              </div>

              {/* Add Service Button */}
              <Button asChild className="w-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white">
                <Link href="/services/add">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Service
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--clay)]">
                {filteredServices.length} Services Found
              </h2>
              <p className="text-[var(--clay-500)] text-sm">
                Professional services by diaspora community members
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12 border-2 border-[var(--clay-200)]">
                          <AvatarImage src={service.provider.avatar_url ?? undefined} alt={providerName(service)} />
                          <AvatarFallback className="bg-[var(--clay-100)] text-[var(--clay)]">
                            {providerName(service).split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-[var(--clay)]">
                              {service.service_name}
                            </h3>
                            {service.is_verified && (
                              <Verified className="h-5 w-5 text-[var(--terracotta)]" />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-[var(--clay-600)] font-medium">
                              by {providerName(service)}
                            </span>
                            <span className="text-[var(--clay-500)]">•</span>
                            <span className="text-[var(--clay-500)]">{service.provider.profession}</span>
                          </div>

                          <div className="flex items-center space-x-4 mb-3">
                            <Badge variant="secondary">{service.category}</Badge>
                            {service.country && (
                              <div className="flex items-center space-x-1 text-[var(--clay-500)] text-sm">
                                <span>{getCountryFlag(service.country)}</span>
                                <MapPin className="h-4 w-4" />
                                <span>{service.location}, {service.country}</span>
                              </div>
                            )}
                          </div>

                          {service.rating && (
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex items-center space-x-1">
                                {renderStars(service.rating)}
                              </div>
                              <span className="text-sm font-medium">{service.rating}</span>
                              <span className="text-sm text-[var(--clay-500)]">
                                ({service.review_count} reviews)
                              </span>
                            </div>
                          )}

                          <p className="text-[var(--clay-600)] text-sm mb-4 line-clamp-2">
                            {service.description}
                          </p>

                          {service.provider.heritage_countries && service.provider.heritage_countries.length > 0 && (
                            <div className="flex items-center space-x-2 mb-4">
                              <span className="text-xs text-[var(--clay-500)]">Heritage:</span>
                              {service.provider.heritage_countries.map((country: string, index: number) => (
                                <span key={index} className="text-xs">
                                  {getCountryFlag(country)} {country}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm">
                            {service.contact_phone && (
                              <a
                                href={`tel:${service.contact_phone}`}
                                className="flex items-center space-x-1 text-[var(--terracotta)] hover:underline"
                              >
                                <Phone className="h-4 w-4" />
                                <span>Call</span>
                              </a>
                            )}
                            {service.contact_email && (
                              <a
                                href={`mailto:${service.contact_email}`}
                                className="flex items-center space-x-1 text-[var(--terracotta)] hover:underline"
                              >
                                <Mail className="h-4 w-4" />
                                <span>Email</span>
                              </a>
                            )}
                            {service.website && (
                              <a
                                href={service.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-[var(--terracotta)] hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Website</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-[var(--clay-500)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--clay)] mb-2">
                    No services found
                  </h3>
                  <p className="text-[var(--clay-500)] mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedCountry('all')
                    setVerifiedOnly(false)
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
