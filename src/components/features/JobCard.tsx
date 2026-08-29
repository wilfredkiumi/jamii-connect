'use client'

import { useState } from 'react'
import type { Job } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Flag,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

interface JobCardProps {
  job: Job
  /** Bookmarking is per-viewer UI state, not a column on the job row. */
  bookmarked?: boolean
  onBookmark?: (jobId: string) => void
  onApply?: (jobId: string) => void
}

export default function JobCard({ job, bookmarked = false, onBookmark, onApply }: JobCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(bookmarked)

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked)
      onBookmark?.(job.id)
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks')
    } catch {
      setIsBookmarked(isBookmarked)
      toast.error('Failed to update bookmark')
    }
  }

  const handleApply = () => {
    onApply?.(job.id)
  }

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null
    
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
      'full-time': 'bg-[var(--forest)]/10 text-[var(--forest)]',
      'part-time': 'bg-[var(--indigo)]/10 text-[var(--indigo)]',
      'contract': 'bg-[var(--terracotta)]/10 text-[var(--terracotta)]',
      'freelance': 'bg-[var(--gold)]/10 text-[var(--gold)]',
      'internship': 'bg-[var(--gold-light)]/10 text-[var(--gold)]',
    }
    return colors[type as keyof typeof colors] || 'bg-[var(--clay-100)] text-[var(--clay-600)]'
  }

  const getWorkTypeColor = (type: string) => {
    const colors = {
      'remote': 'bg-[var(--forest-light)]/10 text-[var(--forest)]',
      'hybrid': 'bg-[var(--indigo)]/10 text-[var(--indigo)]',
      'on-site': 'bg-[var(--clay-100)] text-[var(--clay-600)]',
    }
    return colors[type as keyof typeof colors] || 'bg-[var(--clay-100)] text-[var(--clay-600)]'
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

  return (
    <Card className="w-full border border-[var(--clay-200)] hover:border-[var(--clay-300)] transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {job.company_logo && (
              <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[var(--clay-200)]">
                <Image
                  src={job.company_logo}
                  alt={`${job.company} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                <h3 className="font-semibold text-[var(--clay)] text-lg leading-tight">{job.title}</h3>
              </Link>
              <div className="flex items-center space-x-2 mt-1">
                <Building2 className="h-4 w-4 text-[var(--clay-500)]" />
                <span className="text-[var(--clay-600)] font-medium">{job.company}</span>
                {job.company_size && (
                  <>
                    <span className="text-[var(--clay-500)]">•</span>
                    <span className="text-[var(--clay-500)] text-sm">{job.company_size}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span>{getCountryFlag(job.country)}</span>
                <MapPin className="h-4 w-4 text-[var(--clay-500)]" />
                <span className="text-[var(--clay-500)] text-sm">{job.location}, {job.country}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {job.is_diaspora_friendly && (
              <Badge variant="secondary" className="bg-[var(--terracotta)]/10 text-[var(--terracotta)] border-[var(--terracotta)]/20">
                Diaspora Friendly
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
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
          </div>

          <p className="text-[var(--clay-600)] text-sm line-clamp-2">{job.description}</p>

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-[var(--clay-100)] text-[var(--clay-500)] text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="inline-block px-2 py-1 bg-[var(--clay-100)] text-[var(--clay-500)] text-xs rounded-full">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-[var(--clay-500)]">
            <div className="flex items-center space-x-4">
              {formatSalary() && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatSalary()}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{job.applications_count} applicants</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-[var(--clay-100)]">
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`flex items-center space-x-2 ${
              isBookmarked ? 'text-[var(--terracotta)]' : 'text-[var(--clay-500)] hover:text-[var(--terracotta)]'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>Save</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/jobs/${job.id}`}>View Details</Link>
            </Button>
            <Button
              size="sm"
              className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"
              onClick={handleApply}
            >
              Apply Now
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
