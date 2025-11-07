'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PostCategory, PostFormData } from '@/types'
import { logger } from '@/lib/logger'

const POST_CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: 'general', label: 'General Discussion' },
  { value: 'jobs', label: 'Jobs & Career' },
  { value: 'housing', label: 'Housing & Accommodation' },
  { value: 'events', label: 'Events & Meetups' },
  { value: 'advice', label: 'Advice & Tips' },
  { value: 'culture', label: 'Culture & Heritage' },
  { value: 'news', label: 'News & Updates' },
  { value: 'questions', label: 'Questions & Help' },
]

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentTag, setCurrentTag] = useState('')

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    image_url: '',
  })

  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (currentTag.trim() && formData.tags.length < 10) {
      const tag = currentTag.trim().toLowerCase()
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }))
      }
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      // Validate required fields
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error('Please fill in title and content')
        return
      }

      if (formData.title.length < 10) {
        toast.error('Title must be at least 10 characters')
        return
      }

      if (formData.content.length < 50) {
        toast.error('Content must be at least 50 characters')
        return
      }

      logger.userAction('create_post_attempt', {
        category: formData.category,
        tags: formData.tags,
      })

      // TODO: Connect to AWS API Gateway endpoint
      // const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
      // const response = await fetch(`${apiEndpoint}/posts`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${await getAuthToken()}`
      //   },
      //   body: JSON.stringify({
      //     ...formData,
      //     userId: user.userId, // Get from auth context
      //   })
      // })

      // if (!response.ok) {
      //   throw new Error('Failed to create post')
      // }

      // For now, just log and redirect
      logger.info('Post would be created', { formData })

      toast.success('Post created successfully!')
      router.push('/dashboard')

    } catch (error) {
      logger.error('Error creating post', error as Error)
      toast.error('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDraft = () => {
    localStorage.setItem('post_draft', JSON.stringify(formData))
    toast.success('Draft saved locally')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-text-primary">Create a Post</h1>
        <p className="text-text-secondary mt-2">
          Share your thoughts, questions, or experiences with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What's on your mind?"
                maxLength={200}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value as PostCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {POST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Share your thoughts in detail..."
                rows={12}
                maxLength={10000}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                {formData.content.length}/10000 characters (minimum 50)
              </p>
            </div>

            {/* Image URL (Optional) */}
            <div>
              <Label htmlFor="image_url" className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-1" />
                Image URL (Optional)
              </Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-text-secondary mt-1">
                Add a cover image for your post
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">
                Tags (Optional)
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  maxLength={30}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  disabled={formData.tags.length >= 10}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Add up to 10 tags to help others find your post
              </p>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Card className="bg-secondary-green/10 border-secondary-green/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">Community Guidelines</h3>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Be respectful and constructive in your posts</li>
              <li>• Keep content relevant to the diaspora community</li>
              <li>• No spam, self-promotion, or commercial content</li>
              <li>• Protect privacy - don't share personal information</li>
              <li>• Report inappropriate content to moderators</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleDraft}
            disabled={loading}
          >
            Save Draft
          </Button>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="bg-accent-green hover:bg-green-700 text-white"
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
