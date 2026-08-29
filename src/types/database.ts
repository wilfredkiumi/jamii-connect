/**
 * Canonical application data model.
 *
 * These mirror the Postgres tables in `database/schema.sql` exactly — snake_case
 * column names, nullable columns typed as `| null`. This file is the single
 * source of truth: `src/lib/db/*` imports these for its query return types, and
 * UI components import them for props. It deliberately contains no runtime
 * imports, so client components can use it without pulling in the `pg` driver.
 */

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type WorkType = 'remote' | 'hybrid' | 'on-site';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
export type EventType = 'conference' | 'workshop' | 'networking' | 'cultural' | 'business' | 'social';
export type ConnectionStatus = 'pending' | 'accepted' | 'declined';
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';
export type AttendanceStatus = 'attending' | 'maybe' | 'not_attending';

export interface Profile {
  id: string;
  cognito_sub: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  country: string | null;
  heritage_countries: string[];
  profession: string | null;
  company: string | null;
  education: string | null;
  skills: string[];
  languages: string[];
  interests: string[];
  looking_for: string[];
  whatsapp_number: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  is_mentor: boolean;
  is_seeking_mentorship: boolean;
  is_verified: boolean;
  is_public_profile: boolean;
  created_at: string;
  updated_at: string;
}

/** Own-profile view: the row plus engagement counts computed per request. */
export interface ProfileWithStats extends Profile {
  connection_count: number;
  posts_count: number;
  events_attended: number;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

/** Minimal profile projection embedded in feed rows. */
export interface AuthorSummary {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  country: string | null;
  profession: string | null;
  company: string | null;
  bio: string | null;
  heritage_countries: string[];
  is_verified: boolean;
}

export interface PostWithAuthor extends Post {
  author: AuthorSummary;
  /**
   * Viewer-relative state, computed per request against the signed-in user.
   * Null/false for anonymous readers rather than absent, so the UI never has
   * to distinguish "not loaded" from "not liked".
   */
  is_liked: boolean;
}

export interface EventWithOrganizer extends Event {
  organizer: AuthorSummary;
  is_attending: boolean;
}

export interface Job {
  id: string;
  posted_by: string;
  title: string;
  company: string;
  company_logo: string | null;
  location: string;
  country: string;
  job_type: JobType;
  work_type: WorkType;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  experience_level: ExperienceLevel;
  company_size: string | null;
  industry: string | null;
  application_url: string | null;
  application_email: string | null;
  is_diaspora_friendly: boolean;
  visa_sponsorship: boolean;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  /** Job listings are surfaced in the UI as "posted <created_at>". */
  created_at: string;
  expires_at: string | null;
}

export interface JobWithPoster extends Job {
  poster: AuthorSummary;
}

export interface Event {
  id: string;
  created_by: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  country: string | null;
  is_virtual: boolean;
  event_type: EventType;
  price: number | null;
  currency: string;
  max_attendees: number | null;
  current_attendees: number;
  is_free: boolean;
  registration_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  service_name: string;
  category: string;
  country: string | null;
  description: string;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  location: string | null;
  service_area: string[];
  pricing_type: string;
  pricing_amount: number | null;
  pricing_currency: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithProvider extends Service {
  provider: AuthorSummary;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * A connection row plus the *other* party's profile — whichever of
 * requester/addressee is not the viewer.
 */
export interface ConnectionWithProfile extends Connection {
  profile: AuthorSummary;
}
