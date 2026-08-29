'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,

} from '@/components/ui/dialog'
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Users,

  Share2,
  Bookmark,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { JobWithPoster as Job } from '@/types/database'
import { getJob } from '@/lib/api/client'
// import JobApplicationForm from '@/components/features/JobApplicationForm'

const posterName = (j: Job) => j.poster.full_name ?? 'Community member'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  
  // const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      loadJob(params.id as string)
    }
  }, [params.id])

  const loadJob = async (jobId: string) => {
    try {
      setLoading(true)
      const { data, error } = await getJob<Job>(jobId)

      if (error || !data) {
        throw error ?? new Error('Job not found')
      }

      setJob(data)
      setIsBookmarked(false)
      setHasApplied(false)
    } catch (error) {
      console.error('Error loading job:', error)
      toast.error('Failed to load job details')
      setJob(null)
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: job?.title,
          text: `Check out this job opportunity: ${job?.title} at ${job?.company}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      }
    } catch {
      toast.error('Failed to share job')
    }
  }

  const handleApply = () => {
    if (job?.application_url) {
      window.open(job.application_url, '_blank')
    } else {
      setShowApplicationForm(true)
    }
  }

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return null
    
    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: job.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    if (job.salary_min && job.salary_max) {
      return `${formatAmount(job.salary_min)} - ${formatAmount(job.salary_max)}`
    }
    
    if (job.salary_min) {
      return `From ${formatAmount(job.salary_min)}`
    }
    
    if (job.salary_max) {
      return `Up to ${formatAmount(job.salary_max)}`
    }
  }

  const getJobTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'freelance': 'bg-orange-100 text-orange-800',
      'internship': 'bg-yellow-100 text-yellow-800',
    }
    return colors[type as keyof typeof colors] || 'bg-[var(--clay-100)] text-[var(--clay-800)]'
  }

  const getWorkTypeColor = (type: string) => {
    const colors = {
      'remote': 'bg-emerald-100 text-emerald-800',
      'hybrid': 'bg-indigo-100 text-indigo-800',
      'on-site': 'bg-slate-100 text-slate-800',
    }
    return colors[type as keyof typeof colors] || 'bg-[var(--clay-100)] text-[var(--clay-800)]'
  }

  const getExperienceLevel = (level: string) => {
    const levels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive',
    }
    return levels[level as keyof typeof levels] || level
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
          <div className="h-8 bg-[var(--clay-200)] rounded w-1/3"></div>
          <div className="h-96 bg-[var(--clay-200)] rounded"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-display text-2xl font-bold text-[var(--clay)] mb-4">Job not found</h1>
        <p className="text-[var(--clay-500)] mb-6">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button asChild>
          <Link href="/jobs">Browse All Jobs</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {job.company_logo && (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-[var(--clay-200)]">
                      <Image
                        src={job.company_logo}
                        alt={`${job.company} logo`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-display text-2xl font-bold text-[var(--clay)] mb-2">{job.title}</h1>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-5 w-5 text-[var(--clay-500)]" />
                      <span className="text-lg font-medium text-[var(--clay-600)]">{job.company}</span>
                      {job.company_size && (
                        <>
                          <span className="text-[var(--clay-500)]">•</span>
                          <span className="text-[var(--clay-500)]">{job.company_size}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span>{getCountryFlag(job.country)}</span>
                      <MapPin className="h-4 w-4 text-[var(--clay-500)]" />
                      <span className="text-[var(--clay-500)]">{job.location}, {job.country}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getJobTypeColor(job.job_type)}>
                        {job.job_type.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={getWorkTypeColor(job.work_type)}>
                        {job.work_type.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {getExperienceLevel(job.experience_level)}
                      </Badge>
                      {job.is_diaspora_friendly && (
                        <Badge className="bg-[var(--terracotta)] text-white">
                          Diaspora Friendly
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral max-w-none">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-[var(--clay-600)] whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-[var(--terracotta)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--clay-600)]">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-[var(--terracotta)] mt-0.5 flex-shrink-0" />
                      <span className="text-[var(--clay-600)]">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formatSalary() && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-[var(--clay-500)]" />
                  <span className="font-medium text-[var(--clay)]">{formatSalary()}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[var(--clay-500)]" />
                <span className="text-[var(--clay-600)]">{job.applications_count} applicants</span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[var(--clay-500)]" />
                <span className="text-[var(--clay-600)]">
                  Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </span>
              </div>

              {job.expires_at && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-orange-600 text-sm">
                    Expires {formatDistanceToNow(new Date(job.expires_at), { addSuffix: true })}
                  </span>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                {hasApplied ? (
                  <Button disabled className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button 
                    onClick={handleApply}
                    className="w-full bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"
                  >
                    Apply Now
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

          {/* Posted By */}
          <Card>
            <CardHeader>
              <CardTitle>Posted by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={job.poster.avatar_url ?? undefined} alt={posterName(job)} />
                  <AvatarFallback>
                    {posterName(job).split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-[var(--clay)]">{posterName(job)}</h3>
                  {job.poster.profession && (
                    <p className="text-sm text-[var(--clay-500)]">{job.poster.profession}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>About {job.company}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job.industry && (
                <div>
                  <span className="text-sm font-medium">Industry:</span>
                  <span className="text-sm text-[var(--clay-500)] ml-2">{job.industry}</span>
                </div>
              )}
              {job.company_size && (
                <div>
                  <span className="text-sm font-medium">Company Size:</span>
                  <span className="text-sm text-[var(--clay-500)] ml-2">{job.company_size}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm text-[var(--clay-500)] ml-2">{job.location}, {job.country}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this position at {job.company}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-[var(--clay-500)]">Job application form will be implemented here.</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowApplicationForm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"
                onClick={() => {
                  setShowApplicationForm(false)
                  setHasApplied(true)
                  toast.success('Application submitted successfully!')
                }}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
