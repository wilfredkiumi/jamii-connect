'use client'

import { useState, useEffect } from 'react'
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
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  Star,
  Clock,
  Filter,
  Globe,
  Heart,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getUserProfile } from '@/lib/amplify/auth'
import { listConnections, searchUsers } from '@/lib/amplify/data-access'

interface Connection {
  id: string
  firstName: string
  lastName: string
  profileImage?: string
  profession?: string
  company?: string
  location?: string
  country?: string
  heritageCountry?: string
  bio?: string
  connectionStatus: 'connected' | 'pending' | 'none'
  mutualConnections?: number
  verified?: boolean
  isOnline?: boolean
  lastActive?: string
}

export default function ConnectionsPage() {
  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [suggestions, setSuggestions] = useState<Connection[]>([])
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedProfession, setSelectedProfession] = useState('all')

  useEffect(() => {
    loadUser()
    loadConnections()
  }, [])

  const loadUser = async () => {
    try {
      const profile = await getUserProfile()
      setUser(profile)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadConnections = async () => {
    try {
      setLoading(true)
      
      // Mock data for demo
      const mockConnections: Connection[] = [
        {
          id: '1',
          firstName: 'David',
          lastName: 'Kamau',
          profileImage: '/avatars/david.jpg',
          profession: 'Software Engineer',
          company: 'Safaricom',
          location: 'Nairobi',
          country: 'Kenya',
          heritageCountry: 'Kenya',
          bio: 'Building the future of mobile money in Africa',
          connectionStatus: 'connected',
          mutualConnections: 12,
          verified: true,
          isOnline: true,
          lastActive: new Date().toISOString(),
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Muthoni',
          profileImage: '/avatars/sarah.jpg',
          profession: 'Financial Advisor',
          company: 'Standard Chartered',
          location: 'London',
          country: 'United Kingdom',
          heritageCountry: 'Kenya',
          bio: 'Helping diaspora with cross-border financial planning',
          connectionStatus: 'connected',
          mutualConnections: 8,
          verified: true,
          isOnline: false,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockSuggestions: Connection[] = [
        {
          id: '3',
          firstName: 'James',
          lastName: 'Kiprotich',
          profileImage: '/avatars/james.jpg',
          profession: 'Data Scientist',
          company: 'Microsoft',
          location: 'Seattle',
          country: 'United States',
          heritageCountry: 'Kenya',
          bio: 'Machine learning engineer focusing on African language processing',
          connectionStatus: 'none',
          mutualConnections: 5,
          verified: false,
          isOnline: true,
        },
        {
          id: '4',
          firstName: 'Mary',
          lastName: 'Wanjiru',
          profileImage: '/avatars/mary.jpg',
          profession: 'Marketing Manager',
          company: 'Unilever',
          location: 'Dubai',
          country: 'United Arab Emirates',
          heritageCountry: 'Kenya',
          bio: 'Marketing professional with 10+ years in FMCG across East Africa',
          connectionStatus: 'none',
          mutualConnections: 3,
          verified: true,
          isOnline: false,
        },
      ]

      const mockPending: Connection[] = [
        {
          id: '5',
          firstName: 'Peter',
          lastName: 'Njoroge',
          profileImage: '/avatars/peter.jpg',
          profession: 'Investment Banker',
          company: 'Goldman Sachs',
          location: 'New York',
          country: 'United States',
          heritageCountry: 'Kenya',
          bio: 'Investment banking with focus on African markets',
          connectionStatus: 'pending',
          mutualConnections: 7,
          verified: true,
          isOnline: false,
        },
      ]

      setConnections(mockConnections)
      setSuggestions(mockSuggestions)
      setPendingRequests(mockPending)
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (userId: string) => {
    try {
      // Update UI optimistically
      setSuggestions(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, connectionStatus: 'pending' as const } : user
        )
      )
      toast.success('Connection request sent!')
    } catch (error) {
      console.error('Error sending connection request:', error)
      toast.error('Failed to send connection request')
    }
  }

  const handleAcceptRequest = async (userId: string) => {
    try {
      const user = pendingRequests.find(u => u.id === userId)
      if (user) {
        setConnections(prev => [...prev, { ...user, connectionStatus: 'connected' }])
        setPendingRequests(prev => prev.filter(u => u.id !== userId))
        toast.success('Connection request accepted!')
      }
    } catch (error) {
      console.error('Error accepting connection request:', error)
      toast.error('Failed to accept connection request')
    }
  }

  const getCountryFlag = (country: string) => {
    const countryFlags: { [key: string]: string } = {
      'Kenya': '🇰🇪', 'Uganda': '🇺🇬', 'Tanzania': '🇹🇿', 'Rwanda': '🇷🇼',
      'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
      'United Arab Emirates': '🇦🇪', 'Australia': '🇦🇺', 'Germany': '🇩🇪'
    }
    return countryFlags[country] || '🌍'
  }

  const UserCard = ({ user, showConnectButton = false, showAcceptButton = false }: { 
    user: Connection, 
    showConnectButton?: boolean,
    showAcceptButton?: boolean 
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-[var(--terracotta)]/20">
              <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-[var(--terracotta)]/10 text-[var(--terracotta)]">
                {user.firstName[0]}{user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground truncate">
                {user.firstName} {user.lastName}
              </h3>
              {user.verified && (
                <Badge variant="secondary" className="bg-[var(--terracotta)]/10 text-[var(--terracotta)] border-[var(--terracotta)]/20">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
              <Briefcase className="h-3 w-3" />
              <span>{user.profession}</span>
              {user.company && (
                <>
                  <span>at</span>
                  <span className="font-medium">{user.company}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
              <span>{getCountryFlag(user.country || '')}</span>
              <MapPin className="h-3 w-3" />
              <span>{user.location}, {user.country}</span>
            </div>
            
            {user.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
            )}
            
            {user.mutualConnections && user.mutualConnections > 0 && (
              <div className="flex items-center space-x-1 text-sm text-[var(--terracotta)] mt-2">
                <Users className="h-3 w-3" />
                <span>{user.mutualConnections} mutual connections</span>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                {showConnectButton && (
                  <Button 
                    size="sm" 
                    className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)]"
                    onClick={() => handleConnect(user.id)}
                    disabled={user.connectionStatus === 'pending'}
                  >
                    {user.connectionStatus === 'pending' ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
                
                {showAcceptButton && (
                  <Button 
                    size="sm" 
                    className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)]"
                    onClick={() => handleAcceptRequest(user.id)}
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                )}
                
                {user.connectionStatus === 'connected' && (
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                )}
              </div>
              
              <Link href={`/profile/${user.id}`}>
                <Button size="sm" variant="ghost">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
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
          Your Network
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect with fellow Kenyans around the world. Build relationships, share experiences, and grow together.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5 text-[var(--terracotta)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{connections.length}</p>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="h-5 w-5 text-[var(--terracotta)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Star className="h-5 w-5 text-[var(--gold)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{suggestions.length}</p>
                  <p className="text-xs text-muted-foreground">Suggestions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Globe className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="text-2xl font-bold">
                    {new Set([...connections, ...suggestions].map(u => u.country)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search connections..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
            <SelectItem value="united states">🇺🇸 United States</SelectItem>
            <SelectItem value="united kingdom">🇬🇧 United Kingdom</SelectItem>
            <SelectItem value="canada">🇨🇦 Canada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>My Connections ({connections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Suggestions ({suggestions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Requests ({pendingRequests.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <UserCard key={connection.id} user={connection} />
            ))}
          </div>
          {connections.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No connections yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start building your network by connecting with fellow Kenyans
                </p>
                <Button className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)]">
                  Find People to Connect
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <UserCard key={suggestion.id} user={suggestion} showConnectButton />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <UserCard key={request.id} user={request} showAcceptButton />
            ))}
          </div>
          {pendingRequests.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No pending requests
                </h3>
                <p className="text-muted-foreground">
                  Connection requests will appear here when you receive them
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}