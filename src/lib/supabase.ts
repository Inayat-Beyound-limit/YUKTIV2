import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// For development, we'll use a mock authentication system if Supabase is not configured
const isDevelopment = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('xyzcompany')

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'company' | 'admin'
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  college_name: string
  student_id?: string
  degree: string
  specialization?: string
  graduation_year: number
  cgpa: number
  skills: string[]
  certifications: string[]
  languages: string[]
  resume_url?: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  experience_level: 'entry' | 'mid' | 'senior'
  preferred_locations: string[]
  expected_salary_min: number
  expected_salary_max: number
  job_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  company_description: string
  website_url?: string
  industry: string
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  headquarters_location: string
  founded_year?: number
  logo_url?: string
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
  updated_at: string
}

export interface JobPosting {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string[]
  skills_required: string[]
  experience_level: 'entry' | 'mid' | 'senior'
  job_type: 'full-time' | 'part-time' | 'internship' | 'contract'
  location: string
  is_remote: boolean
  salary_min: number
  salary_max: number
  currency: string
  application_deadline?: string
  status: 'draft' | 'published' | 'closed' | 'paused'
  benefits: string[]
  work_mode: 'office' | 'remote' | 'hybrid'
  total_positions: number
  filled_positions: number
  view_count: number
  application_count: number
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  student_id: string
  status: 'applied' | 'screening' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected' | 'withdrawn'
  cover_letter?: string
  resume_url?: string
  application_source: string
  ai_match_score: number
  rejection_reason?: string
  feedback?: string
  applied_at: string
  updated_at: string
}

export interface MoodLog {
  id: string
  student_id: string
  mood_score: number
  stress_level: number
  energy_level: number
  confidence_level: number
  notes?: string
  factors: string[]
  logged_at: string
}

export interface WellnessAlert {
  id: string
  student_id: string
  alert_type: 'low_mood' | 'high_stress' | 'declining_trend' | 'no_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  triggered_at: string
  resolved_at?: string
  resolved_by?: string
  resolution_notes?: string
  is_resolved: boolean
}

// Mock storage for development
const mockStorage = {
  users: new Map(),
  profiles: new Map(),
  sessions: new Map()
}

// Helper functions for database operations
export const dbHelpers = {
  async createProfile(userData: Partial<Profile>) {
    try {
      if (isDevelopment) {
        const profile = {
          ...userData,
          id: userData.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        mockStorage.profiles.set(profile.id, profile)
        return { data: profile, error: null }
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([userData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating profile:', error)
      return { data: null, error }
    }
  },

  async getProfile(userId: string) {
    try {
      if (isDevelopment) {
        const profile = mockStorage.profiles.get(userId)
        return { data: profile || null, error: profile ? null : new Error('Profile not found') }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching profile:', error)
      return { data: null, error }
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      if (isDevelopment) {
        const existing = mockStorage.profiles.get(userId)
        if (!existing) {
          return { data: null, error: new Error('Profile not found') }
        }
        const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
        mockStorage.profiles.set(userId, updated)
        return { data: updated, error: null }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }
}

// Development mode indicator
export const isDevMode = isDevelopment