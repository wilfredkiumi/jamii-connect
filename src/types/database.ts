export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          hometown_kenya: string | null
          profession: string | null
          company: string | null
          skills: string[] | null
          looking_for: string[] | null
          whatsapp_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          hometown_kenya?: string | null
          profession?: string | null
          company?: string | null
          skills?: string[] | null
          looking_for?: string[] | null
          whatsapp_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          hometown_kenya?: string | null
          profession?: string | null
          company?: string | null
          skills?: string[] | null
          looking_for?: string[] | null
          whatsapp_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          category: string
          title: string
          content: string
          tags: string[] | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          title: string
          content: string
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          title?: string
          content?: string
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          posted_by: string
          company_name: string
          job_title: string
          job_type: string
          location: string
          salary_range: string | null
          description: string
          requirements: string[] | null
          application_url: string | null
          application_email: string | null
          is_active: boolean
          views_count: number
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          posted_by: string
          company_name: string
          job_title: string
          job_type: string
          location: string
          salary_range?: string | null
          description: string
          requirements?: string[] | null
          application_url?: string | null
          application_email?: string | null
          is_active?: boolean
          views_count?: number
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          posted_by?: string
          company_name?: string
          job_title?: string
          job_type?: string
          location?: string
          salary_range?: string | null
          description?: string
          requirements?: string[] | null
          application_url?: string | null
          application_email?: string | null
          is_active?: boolean
          views_count?: number
          created_at?: string
          expires_at?: string
        }
      }
      events: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string
          event_type: string
          location_name: string
          location_address: string | null
          event_date: string
          event_url: string | null
          cover_image: string | null
          max_attendees: number | null
          current_attendees: number
          is_free: boolean
          price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          description: string
          event_type: string
          location_name: string
          location_address?: string | null
          event_date: string
          event_url?: string | null
          cover_image?: string | null
          max_attendees?: number | null
          current_attendees?: number
          is_free?: boolean
          price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          description?: string
          event_type?: string
          location_name?: string
          location_address?: string | null
          event_date?: string
          event_url?: string | null
          cover_image?: string | null
          max_attendees?: number | null
          current_attendees?: number
          is_free?: boolean
          price?: number | null
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          provider_id: string
          service_name: string
          category: string
          description: string
          contact_phone: string | null
          contact_email: string | null
          website: string | null
          location: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          service_name: string
          category: string
          description: string
          contact_phone?: string | null
          contact_email?: string | null
          website?: string | null
          location?: string | null
          is_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          service_name?: string
          category?: string
          description?: string
          contact_phone?: string | null
          contact_email?: string | null
          website?: string | null
          location?: string | null
          is_verified?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
