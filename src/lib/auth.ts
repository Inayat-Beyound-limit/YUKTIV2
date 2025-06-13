import { supabase, isDevMode } from './supabase'
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

// Mock storage for development
const mockStorage = {
  users: new Map(),
  profiles: new Map(),
  currentUser: null as any
}

// Mock user creation for development
const createMockUser = (email: string, userData: SignUpData) => {
  const userId = crypto.randomUUID()
  const user = {
    id: userId,
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_metadata: {
      full_name: userData.full_name,
      role: userData.role
    }
  }
  
  const profile = {
    id: userId,
    email,
    full_name: userData.full_name,
    role: userData.role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  mockStorage.users.set(email, { user, password: '', profile })
  mockStorage.profiles.set(userId, profile)
  
  return { user, profile }
}

export const authService = {
  async signUp(email: string, password: string, userData: SignUpData) {
    try {
      if (isDevMode) {
        // Mock authentication for development
        console.log('Development mode: Creating mock user')
        
        // Check if user already exists
        if (mockStorage.users.has(email)) {
          return { 
            data: null, 
            error: new Error('User already registered') 
          }
        }

        const { user, profile } = createMockUser(email, userData)
        mockStorage.currentUser = user

        // Create role-specific profile
        if (userData.role === 'student' && userData.college_name) {
          const studentData = {
            user_id: user.id,
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
          // In a real app, this would be stored in student_profiles table
          console.log('Student profile created:', studentData)
        }

        if (userData.role === 'company' && userData.company_name) {
          const companyData = {
            user_id: user.id,
            company_name: userData.company_name,
            company_description: '',
            industry: '',
            company_size: 'startup' as const,
            headquarters_location: '',
            verification_status: 'pending' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          // In a real app, this would be stored in company_profiles table
          console.log('Company profile created:', companyData)
        }

        return { 
          data: { user, session: { user } }, 
          error: null 
        }
      }

      // Real Supabase authentication
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
      if (isDevMode) {
        // Mock authentication for development
        console.log('Development mode: Signing in user')
        
        const userData = mockStorage.users.get(email)
        if (!userData) {
          return { 
            data: null, 
            error: new Error('Invalid login credentials') 
          }
        }

        mockStorage.currentUser = userData.user
        return { 
          data: { user: userData.user, session: { user: userData.user } }, 
          error: null 
        }
      }

      // Real Supabase authentication
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
      if (isDevMode) {
        // Mock sign out for development
        mockStorage.currentUser = null
        return { error: null }
      }

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
      if (isDevMode) {
        return mockStorage.currentUser
      }

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
      if (isDevMode) {
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
    if (isDevMode) {
      // Mock auth state change for development
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
    return supabase.auth.onAuthStateChange(callback)
  },

  // Development helper to get current mock user
  getCurrentMockUser() {
    if (isDevMode) {
      return mockStorage.currentUser
    }
    return null
  },

  // Development helper to get mock profile
  getMockProfile(userId: string) {
    if (isDevMode) {
      return mockStorage.profiles.get(userId)
    }
    return null
  }
}