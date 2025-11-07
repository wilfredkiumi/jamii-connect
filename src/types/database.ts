// DynamoDB Types for Jamii Connect
// These types match the DynamoDB entities defined in the data access layer

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  location?: string;
  bio?: string;
  heritageCountry?: string;
  currentCountry?: string;
  profession?: string;
  company?: string;
  education?: string;
  skills?: string[];
  languages?: string[];
  interests?: string[];
  lookingFor?: string[];
  whatsappNumber?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  profileImage?: string;
  isMentor?: boolean;
  isSeekingMentorship?: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  userId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  location: string;
  country: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  benefits?: string[];
  skills?: string[];
  companySize?: string;
  industry?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  diasporaFriendly: boolean;
  visaSponsorship: boolean;
  applicationDeadline?: string;
  status: 'active' | 'closed' | 'draft';
  viewsCount?: number;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  userId: string;
  organizerName: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  country?: string;
  locationType: 'in-person' | 'virtual' | 'hybrid';
  category: 'conference' | 'workshop' | 'networking' | 'cultural' | 'business' | 'social';
  capacity?: number;
  attendeeCount: number;
  price?: number;
  currency?: string;
  isFree?: boolean;
  registrationUrl?: string;
  image?: string;
  tags?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  userId: string;
  providerName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  serviceArea: string[];
  pricing?: {
    type: 'fixed' | 'hourly' | 'custom';
    amount?: number;
    currency?: string;
  };
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  availability: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  requesterName: string;
  connectedUserName: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userImage?: string;
  status: 'attending' | 'maybe' | 'not_attending';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility types
export type UserProfile = Omit<User, 'createdAt' | 'updatedAt'>;
export type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUser = Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

export type CreatePost = Omit<Post, 'id' | 'likeCount' | 'commentCount' | 'createdAt' | 'updatedAt'>;
export type UpdatePost = Partial<Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type CreateJob = Omit<Job, 'id' | 'viewsCount' | 'applicationsCount' | 'createdAt' | 'updatedAt'>;
export type UpdateJob = Partial<Omit<Job, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type CreateEvent = Omit<Event, 'id' | 'attendeeCount' | 'createdAt' | 'updatedAt'>;
export type UpdateEvent = Partial<Omit<Event, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type CreateService = Omit<Service, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>;
export type UpdateService = Partial<Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type CreateConnection = Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateConnection = Partial<Omit<Connection, 'id' | 'userId' | 'connectedUserId' | 'createdAt' | 'updatedAt'>>;

// Filter types for queries
export interface JobFilters {
  location?: string;
  jobType?: Job['jobType'];
  experienceLevel?: Job['experienceLevel'];
  diasporaFriendly?: boolean;
  visaSponsorship?: boolean;
  salaryMin?: number;
  salaryMax?: number;
}

export interface EventFilters {
  category?: Event['category'];
  locationType?: Event['locationType'];
  isFree?: boolean;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

export interface ServiceFilters {
  category?: string;
  location?: string;
  verified?: boolean;
  minRating?: number;
}