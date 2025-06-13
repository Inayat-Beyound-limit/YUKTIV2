import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  profile: any | null
  loading: boolean
}

export interface SignUpData {
  full_name: string
  role: 'student' | 'company' | 'admin'
  college_name?: string
  company_name?: string
}

export const authService = {
  async signUp(email: string, password: string, userData: SignUpData) {
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        return { data: null, error: authError }
      }

      if (!authData.user) {
        return { data: null, error: new Error('User creation failed') }
      }

      // Create profile record
      const profileData = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: userData.full_name,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't return error here as auth user is already created
      }

      // Create role-specific profile
      if (userData.role === 'student' && userData.college_name) {
        const studentData = {
          user_id: authData.user.id,
          college_name: userData.college_name,
          degree: '',
          graduation_year: new Date().getFullYear(),
          cgpa: 0,
          skills: [],
          certifications: [],
          languages: [],
          experience_level: 'entry' as const,
          preferred_locations: [],
          expected_salary_min: 0,
          expected_salary_max: 0,
          job_preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: studentError } = await supabase
          .from('student_profiles')
          .insert([studentData])

        if (studentError) {
          console.error('Student profile creation error:', studentError)
        }
      }

      if (userData.role === 'company' && userData.company_name) {
        const companyData = {
          user_id: authData.user.id,
          company_name: userData.company_name,
          company_description: '',
          industry: '',
          company_size: 'startup' as const,
          headquarters_location: '',
          verification_status: 'pending' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: companyError } = await supabase
          .from('company_profiles')
          .insert([companyData])

        if (companyError) {
          console.error('Company profile creation error:', companyError)
        }
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error: error as Error }
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Signin error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error: error as Error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Signout error:', error)
        return { error }
      }
      return { error: null }
    } catch (error) {
      console.error('Signout error:', error)
      return { error: error as Error }
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Get user error:', error)
        return null
      }
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Update profile error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { data: null, error: error as Error }
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}