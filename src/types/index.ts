// ===================================
// Core User Types
// ===================================

export interface User {
  userId: string
  email: string
  full_name: string
  username?: string
  avatar_url?: string
  bio?: string
  location?: string
  country?: string
  skills?: string[]
  looking_for?: string[]
  linkedin_url?: string
  twitter_url?: string
  website_url?: string
  phone?: string
  is_verified?: boolean
  member_since?: string
  created_at: string
  updated_at: string
}

export interface Profile extends User {
  posts_count?: number
  connections_count?: number
  events_attended?: number
}

// ===================================
// Post Types
// ===================================

export interface Post {
  postId: string
  userId: string
  title: string
  content: string
  category: PostCategory
  tags: string[]
  image_url?: string
  likes_count: number
  comments_count: number
  shares_count: number
  is_pinned?: boolean
  created_at: string
  updated_at: string
  author?: {
    userId: string
    full_name: string
    username?: string
    avatar_url?: string
  }
}

export type PostCategory =
  | 'general'
  | 'jobs'
  | 'housing'
  | 'events'
  | 'advice'
  | 'culture'
  | 'news'
  | 'questions'

export interface Comment {
  commentId: string
  postId: string
  userId: string
  content: string
  likes_count: number
  parent_comment_id?: string
  created_at: string
  updated_at: string
  author?: {
    userId: string
    full_name: string
    username?: string
    avatar_url?: string
  }
}

export interface Like {
  likeId: string
  userId: string
  target_type: 'post' | 'comment'
  target_id: string
  created_at: string
}

// ===================================
// Job Types
// ===================================

export interface Job {
  jobId: string
  title: string
  company: string
  company_logo?: string
  location: string
  country: string
  job_type: JobType
  work_type: WorkType
  salary_min?: number
  salary_max?: number
  currency: string
  description: string
  requirements: string[]
  benefits?: string[]
  skills: string[]
  experience_level: ExperienceLevel
  company_size?: string
  industry?: string
  application_url?: string
  application_email?: string
  is_diaspora_friendly: boolean
  visa_sponsorship?: boolean
  posted_by: string
  posted_date: string
  expires_at?: string
  applications_count?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type JobType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'internship'

export type WorkType =
  | 'remote'
  | 'hybrid'
  | 'on-site'

export type ExperienceLevel =
  | 'entry'
  | 'mid'
  | 'senior'
  | 'executive'

// ===================================
// Event Types
// ===================================

export interface Event {
  eventId: string
  title: string
  description: string
  image_url?: string
  start_date: string
  end_date?: string
  location?: string
  country?: string
  is_virtual: boolean
  virtual_link?: string
  event_type: EventType
  price?: number
  currency: string
  is_free: boolean
  max_attendees?: number
  current_attendees: number
  registration_url?: string
  tags: string[]
  organizer_id: string
  organizer?: {
    id: string
    name: string
    avatar_url?: string
    organization?: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EventType =
  | 'conference'
  | 'workshop'
  | 'networking'
  | 'cultural'
  | 'business'
  | 'social'
  | 'educational'

export interface EventAttendee {
  attendeeId: string
  eventId: string
  userId: string
  status: 'going' | 'interested' | 'not-going'
  registered_at: string
}

// ===================================
// Service Types
// ===================================

export interface Service {
  serviceId: string
  service_name: string
  category: ServiceCategory
  description: string
  provider_id: string
  provider?: {
    id: string
    name: string
    avatar_url?: string
    rating?: number
    reviews_count?: number
  }
  price_range?: string
  currency?: string
  location?: string
  country?: string
  contact_info: {
    email?: string
    phone?: string
    website?: string
  }
  image_url?: string
  tags: string[]
  is_verified: boolean
  is_active: boolean
  rating?: number
  reviews_count?: number
  created_at: string
  updated_at: string
}

export type ServiceCategory =
  | 'legal'
  | 'financial'
  | 'housing'
  | 'education'
  | 'healthcare'
  | 'transportation'
  | 'translation'
  | 'career-coaching'
  | 'immigration'
  | 'other'

export interface ServiceReview {
  reviewId: string
  serviceId: string
  userId: string
  rating: number
  comment: string
  created_at: string
  author?: {
    userId: string
    full_name: string
    avatar_url?: string
  }
}

// ===================================
// Connection Types
// ===================================

export interface Connection {
  connectionId: string
  userId: string
  connected_user_id: string
  status: ConnectionStatus
  created_at: string
  updated_at: string
  connected_user?: User
}

export type ConnectionStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'blocked'

// ===================================
// Notification Types
// ===================================

export interface Notification {
  notificationId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  is_read: boolean
  sender?: {
    userId: string
    full_name: string
    avatar_url?: string
  }
  metadata?: Record<string, any>
  created_at: string
}

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'post_like'
  | 'post_comment'
  | 'job_match'
  | 'event_reminder'
  | 'event_update'
  | 'service_inquiry'
  | 'system'

// ===================================
// API Response Types
// ===================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  nextToken?: string
  hasMore: boolean
  total?: number
}

// ===================================
// Form Types
// ===================================

export interface PostFormData {
  title: string
  content: string
  category: PostCategory
  tags: string[]
  image_url?: string
}

export interface JobFormData {
  title: string
  company: string
  location: string
  country: string
  job_type: JobType
  work_type: WorkType
  salary_min?: string
  salary_max?: string
  currency: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  experience_level: ExperienceLevel
  company_size?: string
  industry?: string
  application_url?: string
  application_email?: string
  is_diaspora_friendly: boolean
  expires_at?: string
}

export interface ProfileUpdateData {
  full_name?: string
  username?: string
  bio?: string
  location?: string
  country?: string
  skills?: string[]
  looking_for?: string[]
  linkedin_url?: string
  twitter_url?: string
  website_url?: string
  phone?: string
}

// ===================================
// Filter Types
// ===================================

export interface JobFilters {
  location?: string[]
  job_type?: JobType[]
  work_type?: WorkType[]
  experience_level?: ExperienceLevel[]
  salary_min?: number
  salary_max?: number
  diaspora_friendly?: boolean
  keywords?: string
}

export interface EventFilters {
  event_type?: EventType[]
  is_virtual?: boolean
  is_free?: boolean
  date_from?: string
  date_to?: string
  location?: string
  keywords?: string
}

export interface ServiceFilters {
  category?: ServiceCategory[]
  location?: string
  is_verified?: boolean
  price_range?: string
  keywords?: string
}
