'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Flag,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

interface Post {
  id: string
  content: string
  image_url?: string
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url?: string
    location?: string
    country?: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
  is_bookmarked: boolean
  tags?: string[]
}

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onBookmark?: (postId: string) => void
  onShare?: (postId: string) => void
}

export default function PostCard({ post, onLike, onBookmark, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked)
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
      onLike?.(post.id)
    } catch {
      // Revert on error
      setIsLiked(isLiked)
      setLikesCount(likesCount)
      toast.error('Failed to update like')
    }
  }

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked)
      onBookmark?.(post.id)
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
          title: `Post by ${post.author.full_name}`,
          text: post.content.substring(0, 100) + '...',
          url: `${window.location.origin}/posts/${post.id}`,
        })
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)
        toast.success('Link copied to clipboard')
      }
      onShare?.(post.id)
    } catch {
      toast.error('Failed to share post')
    }
  }

  const getLocationDisplay = () => {
    if (post.author.location && post.author.country) {
      return `${post.author.location}, ${post.author.country}`
    }
    return post.author.country || post.author.location || 'Diaspora'
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
    <Card className="w-full border border-neutral-200 hover:border-neutral-300 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="h-10 w-10 border-2 border-neutral-200 hover:border-accent-green transition-colors">
                <AvatarImage src={post.author.avatar_url} alt={post.author.full_name} />
                <AvatarFallback className="bg-neutral-100 text-text-primary">
                  {post.author.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.author.id}`} className="hover:underline">
                <h3 className="font-semibold text-text-primary">{post.author.full_name}</h3>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <span>{getCountryFlag(post.author.country || '')}</span>
                <span>{getLocationDisplay()}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Post
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          <p className="text-text-primary whitespace-pre-wrap">{post.content}</p>
          
          {post.image_url && (
            <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
              <Image
                src={post.image_url}
                alt="Post image"
                fill
                className="object-cover"
              />
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="inline-block px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-text-secondary text-xs rounded-full transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-neutral-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-accent-red' : 'text-text-muted hover:text-accent-red'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likesCount}</span>
            </Button>

            <Link href={`/posts/${post.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-text-muted hover:text-text-primary">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{post.comments_count}</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2 text-text-muted hover:text-text-primary"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`${
              isBookmarked ? 'text-accent-green' : 'text-text-muted hover:text-accent-green'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
