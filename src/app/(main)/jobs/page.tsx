'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import JobCard from '@/components/features/JobCard'
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
  DollarSign,
  Plus,
  SlidersHorizontal,
  Building2,
  Clock,
  Users2,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getUserProfile } from '@/lib/amplify/auth'
import { listJobs, searchJobs } from '@/lib/amplify/data-access'
import { Badge } from '@/components/ui/badge'

interface Job {
  id: string
  title: string
  company: string
  company_logo?: string
  location: string
  country: string
  job_type: string
  work_type: string
  salary_min?: number
  salary_max?: number
  currency?: string
  description: string
  requirements: string[]
  posted_at: string
  is_bookmarked?: boolean
  applications_count?: number
  company_size?: string
  industry?: string
  experience_level: string
  skills: string[]
  is_diaspora_friendly: boolean
  visa_sponsorship?: boolean
  status?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedJobType, setSelectedJobType] = useState('all')
  const [selectedWorkType, setSelectedWorkType] = useState('all')
  const [selectedExperience, setSelectedExperience] = useState('all')
  const [salaryRange, setSalaryRange] = useState('all')
  const [diasporaFriendlyOnly, setDiasporaFriendlyOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
    loadJobs()
  }, [])

  const loadUser = async () => {
    try {
      const profile = await getUserProfile()
      setUser(profile)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      
      // Load jobs from DynamoDB through API
      const { data, error } = await listJobs({
        status: 'active',
        limit: 50,
      })

      if (error) {
        throw error
      }

      // If no jobs from API, use mock data for demo
      if (!data || data.length === 0) {
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Senior Software Engineer - Fintech',
            company: 'AfriPay Technologies',
            company_logo: '/logos/afripay.png',
            location: 'Lagos',
            country: 'Nigeria',
            job_type: 'full-time',
            work_type: 'hybrid',
            salary_min: 80000,
            salary_max: 120000,
            currency: 'USD',
            description: 'Join our mission to revolutionize payments across Africa. We\'re building the next generation of financial infrastructure for the continent.',
            requirements: ['React', 'Node.js', 'TypeScript', 'AWS'],
            posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_bookmarked: false,
            applications_count: 23,
            company_size: '50-200 employees',
            industry: 'Fintech',
            experience_level: 'senior',
            skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
            is_diaspora_friendly: true,
            visa_sponsorship: true,
          },
          {
            id: '2',
            title: 'Marketing Manager - Caribbean Markets',
            company: 'Island Connect Ltd',
            company_logo: '/logos/island-connect.png',
            location: 'Kingston',
            country: 'Jamaica',
            job_type: 'full-time',
            work_type: 'remote',
            salary_min: 45000,
            salary_max: 65000,
            currency: 'USD',
            description: 'Lead marketing initiatives across Caribbean markets. Perfect for someone with deep understanding of Caribbean culture and business practices.',
            requirements: ['Marketing', 'Digital Strategy', 'Analytics'],
            posted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            is_bookmarked: true,
            applications_count: 15,
            company_size: '10-50 employees',
            industry: 'Marketing',
            experience_level: 'mid',
            skills: ['Digital Marketing', 'SEO', 'Social Media', 'Analytics'],
            is_diaspora_friendly: true,
            visa_sponsorship: false,
          },
          {
            id: '3',
            title: 'Data Scientist - Healthcare AI',
            company: 'MedTech Solutions',
            company_logo: '/logos/medtech.png',
            location: 'Cape Town',
            country: 'South Africa',
            job_type: 'full-time',
            work_type: 'on-site',
            salary_min: 70000,
            salary_max: 95000,
            currency: 'USD',
            description: 'Apply AI and machine learning to solve healthcare challenges across Africa. Work with cutting-edge technology to improve healthcare outcomes.',
            requirements: ['Python', 'Machine Learning', 'Healthcare Domain'],
            posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            is_bookmarked: false,
            applications_count: 31,
            company_size: '200-500 employees',
            industry: 'Healthcare',
            experience_level: 'senior',
            skills: ['Python', 'TensorFlow', 'Healthcare', 'Statistics'],
            is_diaspora_friendly: true,
            visa_sponsorship: true,
          },
          {
            id: '4',
            title: 'Business Development Representative',
            company: 'Global Ventures Inc',
            company_logo: '/logos/global-ventures.png',
            location: 'Toronto',
            country: 'Canada',
            job_type: 'full-time',
            work_type: 'hybrid',
            salary_min: 55000,
            salary_max: 75000,
            currency: 'CAD',
            description: 'Expand our business across African and Caribbean markets. Ideal for someone with strong networks in these regions.',
            requirements: ['Sales', 'Business Development', 'Market Research'],
            posted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            is_bookmarked: false,
            applications_count: 18,
            company_size: '500+ employees',
            industry: 'Business Services',
            experience_level: 'mid',
            skills: ['Sales', 'CRM', 'Market Analysis', 'Networking'],
            is_diaspora_friendly: true,
            visa_sponsorship: false,
          },
          {
            id: '5',
            title: 'Community Manager - Kenyan Diaspora',
            company: 'Jamii Connect',
            company_logo: '/logos/jamii-connect.png',
            location: 'London',
            country: 'United Kingdom',
            job_type: 'full-time',
            work_type: 'remote',
            salary_min: 35000,
            salary_max: 45000,
            currency: 'GBP',
            description: 'Build and nurture our growing Kenyan diaspora community across the UK. Perfect for someone passionate about connecting people and creating impact.',
            requirements: ['Community Management', 'Social Media', 'Event Planning'],
            posted_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            is_bookmarked: false,
            applications_count: 42,
            company_size: '10-50 employees',
            industry: 'Community & Social',
            experience_level: 'mid',
            skills: ['Community Building', 'Content Creation', 'Events', 'Social Media'],
            is_diaspora_friendly: true,
            visa_sponsorship: true,
          },
        ]
        setJobs(mockJobs)
      } else {
        setJobs(data as Job[])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadJobs()
      return
    }

    try {
      setLoading(true)
      const { data, error } = await searchJobs(searchQuery)
      
      if (error) {
        throw error
      }
      
      setJobs(data as Job[])
    } catch (error) {
      console.error('Error searching jobs:', error)
      toast.error('Failed to search jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch()
      } else {
        loadJobs()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const countries = [
    'Kenya', 'Nigeria', 'Ghana', 'South Africa', 'Ethiopia', 'Uganda', 'Tanzania',
    'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Haiti',
    'United States', 'United Kingdom', 'Canada', 'France', 'Germany', 'Australia'
  ]

  const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  const workTypes = ['remote', 'hybrid', 'on-site']
  const experienceLevels = ['entry', 'mid', 'senior', 'executive']
  const salaryRanges = [
    { label: 'Under $50K', value: '0-50000' },
    { label: '$50K - $75K', value: '50000-75000' },
    { label: '$75K - $100K', value: '75000-100000' },
    { label: '$100K - $150K', value: '100000-150000' },
    { label: '$150K+', value: '150000+' },
  ]

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
    'Business Services', 'Nonprofit', 'Government', 'Retail', 'Manufacturing'
  ]

  const filteredJobs = jobs.filter(job => {
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !job.company.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedCountry !== 'all' && job.country.toLowerCase() !== selectedCountry) {
      return false
    }
    if (selectedJobType !== 'all' && job.job_type !== selectedJobType) {
      return false
    }
    if (selectedWorkType !== 'all' && job.work_type !== selectedWorkType) {
      return false
    }
    if (selectedExperience !== 'all' && job.experience_level !== selectedExperience) {
      return false
    }
    if (diasporaFriendlyOnly && !job.is_diaspora_friendly) {
      return false
    }
    return true
  })

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
          Diaspora Job Board
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover opportunities that value your unique perspective and cultural background. Connect with employers who understand the diaspora experience.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Briefcase className="h-5 w-5 text-[var(--terracotta)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{jobs.length}</p>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="h-5 w-5 text-[var(--gold)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{countries.length}</p>
                  <p className="text-xs text-muted-foreground">Countries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Building2 className="h-5 w-5 text-[var(--terracotta)]" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{new Set(jobs.map(j => j.company)).size}</p>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2">
                <Users2 className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="text-2xl font-bold">{jobs.filter(j => j.is_diaspora_friendly).length}</p>
                  <p className="text-xs text-muted-foreground">Diaspora Friendly</p>
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
                    placeholder="Job title or company..."
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
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                  <SelectTrigger>
                    <Briefcase className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('-', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Work Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Type</label>
                <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Work Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Types</SelectItem>
                    {workTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('-', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level</label>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level === 'entry' ? 'Entry Level' : 
                         level === 'mid' ? 'Mid Level' : 
                         level === 'senior' ? 'Senior Level' : 'Executive'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Salary Range</label>
                <Select value={salaryRange} onValueChange={setSalaryRange}>
                  <SelectTrigger>
                    <DollarSign className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Salaries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Salaries</SelectItem>
                    {salaryRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Diaspora Friendly */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="diaspora-friendly"
                  checked={diasporaFriendlyOnly}
                  onCheckedChange={setDiasporaFriendlyOnly}
                />
                <label htmlFor="diaspora-friendly" className="text-sm font-medium">
                  Diaspora Friendly Only
                </label>
              </div>

              {/* Post Job Button */}
              <Button asChild className="w-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white">
                <Link href="/jobs/post">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {filteredJobs.length} Jobs Found
              </h2>
              <p className="text-muted-foreground text-sm">
                Showing opportunities for the diaspora community
              </p>
            </div>
            
            {/* Sort Options */}
            <Select defaultValue="recent">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="relevant">Most Relevant</SelectItem>
                <SelectItem value="salary-high">Highest Salary</SelectItem>
                <SelectItem value="applications">Most Applied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id}>
                  <JobCard job={job} />
                  {job.is_diaspora_friendly && (
                    <div className="flex items-center gap-2 mt-2 ml-4">
                      <Badge variant="secondary" className="bg-[var(--terracotta)]/10 text-[var(--terracotta)] border-[var(--terracotta)]/20">
                        🌍 Diaspora Friendly
                      </Badge>
                      {job.visa_sponsorship && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                          ✈️ Visa Sponsorship
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No jobs found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('')
                    setSelectedCountry('all')
                    setSelectedJobType('all')
                    setSelectedWorkType('all')
                    setSelectedExperience('all')
                    setSalaryRange('all')
                    setDiasporaFriendlyOnly(false)
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
