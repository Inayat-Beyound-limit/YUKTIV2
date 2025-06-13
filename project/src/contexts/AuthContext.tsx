import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { authService, SignUpData } from '../lib/auth'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: SignUpData) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setError('Failed to load session')
        } else if (mounted) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err)
        if (mounted) {
          setError('Failed to initialize authentication')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        try {
          setUser(session?.user ?? null)
          setError(null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
        } catch (err) {
          console.error('Auth state change error:', err)
          setError('Authentication state error')
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        // Don't set error state for missing profile, it might be creating
        if (error.code !== 'PGRST116') {
          setError('Failed to load profile')
        }
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Profile fetch error:', err)
      setError('Failed to load user profile')
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.signIn(email, password)
      
      if (result.error) {
        setError(result.error.message || 'Sign in failed')
      }
      
      return result
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign in'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.signUp(email, password, userData)
      
      if (result.error) {
        setError(result.error.message || 'Sign up failed')
      }
      
      return result
    } catch (err) {
      const errorMessage = 'An unexpected error occurred during sign up'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.signOut()
      
      if (result.error) {
        setError('Sign out failed')
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (err) {
      console.error('Sign out error:', err)
      setError('An unexpected error occurred during sign out')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    if (!user) {
      const error = new Error('No user logged in')
      setError(error.message)
      return { data: null, error }
    }
    
    try {
      setError(null)
      
      const result = await authService.updateProfile(user.id, updates)
      
      if (result.error) {
        setError('Failed to update profile')
      } else if (result.data) {
        setProfile({ ...profile, ...updates })
      }
      
      return result
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating profile'
      setError(errorMessage)
      return { data: null, error: new Error(errorMessage) }
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}