'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import {
  ArrowLeft,
  Plus,
  X,
  Building2,
  DollarSign,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface JobFormData {
  title: string
  company: string
  location: string
  country: string
  job_type: string
  work_type: string
  salary_min: string
  salary_max: string
  currency: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  experience_level: string
  company_size: string
  industry: string
  application_url: string
  application_email: string
  is_diaspora_friendly: boolean
  expires_at: string
}

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentRequirement, setCurrentRequirement] = useState('')
  const [currentBenefit, setCurrentBenefit] = useState('')
  const [currentSkill, setCurrentSkill] = useState('')
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    country: '',
    job_type: '',
    work_type: '',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    description: '',
    requirements: [],
    benefits: [],
    skills: [],
    experience_level: '',
    company_size: '',
    industry: '',
    application_url: '',
    application_email: '',
    is_diaspora_friendly: false,
    expires_at: '',
  })

  // const supabase = createClient()

  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Morocco', 'Egypt',
    'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Haiti', 'Dominican Republic',
    'United States', 'United Kingdom', 'Canada', 'France', 'Germany', 'Netherlands'
  ]

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
  ]

  const workTypes = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'on-site', label: 'On-site' },
  ]

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees',
  ]

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Operations',
    'Legal',
    'Human Resources',
    'Other',
  ]

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'NGN', 'GHS', 'KES', 'ZAR', 'JMD']

  const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }))
      setCurrentRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (currentBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }))
      setCurrentBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  const addSkill = () => {
    if (currentSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.title || !formData.company || !formData.location || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }

      // Here you would submit to Supabase
      // const { data, error } = await supabase.from('jobs').insert([formData])
      
      toast.success('Job posted successfully!')
      router.push('/jobs')
      
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <h1 className="text-display text-3xl font-bold text-[var(--clay)]">Post a Job</h1>
          <p className="text-[var(--clay-600)] mt-2">
            Connect with talented professionals in the African and Caribbean diaspora
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="e.g. TechCorp Africa"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g. Lagos, Remote"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="job_type">Job Type *</Label>
                <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="work_type">Work Type *</Label>
                <Select value={formData.work_type} onValueChange={(value) => handleInputChange('work_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience_level">Experience Level *</Label>
                <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="diaspora_friendly"
                checked={formData.is_diaspora_friendly}
                onCheckedChange={(checked) => handleInputChange('is_diaspora_friendly', checked as boolean)}
              />
              <Label htmlFor="diaspora_friendly" className="text-sm">
                This position is diaspora-friendly (visa sponsorship, remote work, cultural understanding)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Salary Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary_min">Minimum Salary</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => handleInputChange('salary_min', e.target.value)}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="salary_max">Maximum Salary</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => handleInputChange('salary_max', e.target.value)}
                  placeholder="80000"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
              rows={8}
              required
            />
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              />
              <Button type="button" onClick={addRequirement} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((requirement, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {requirement}
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Required Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={currentBenefit}
                onChange={(e) => setCurrentBenefit(e.target.value)}
                placeholder="Add a benefit..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
              />
              <Button type="button" onClick={addBenefit} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {benefit}
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_size">Company Size</Label>
                <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Information */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="application_email">Application Email</Label>
                <Input
                  id="application_email"
                  type="email"
                  value={formData.application_email}
                  onChange={(e) => handleInputChange('application_email', e.target.value)}
                  placeholder="careers@company.com"
                />
              </div>
              <div>
                <Label htmlFor="application_url">Application URL</Label>
                <Input
                  id="application_url"
                  type="url"
                  value={formData.application_url}
                  onChange={(e) => handleInputChange('application_url', e.target.value)}
                  placeholder="https://company.com/careers"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="expires_at">Application Deadline</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => handleInputChange('expires_at', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-[var(--terracotta)] hover:bg-[var(--terracotta-light)] text-white"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </form>
    </div>
  )
}
