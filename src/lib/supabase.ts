import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'dea-pdi-app'
    }
  }
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        nome,
        email,
        role,
        status,
        data_admissao,
        data_desligamento,
        time_id,
        gestor_id,
        bio,
        localizacao,
        formacao,
        trilha_id,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .maybeSingle()
  
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  
    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Helper function to create user profile
export const createUserProfile = async (userId: string, email: string, profileData: {
  nome: string;
  role: 'admin' | 'gestor' | 'colaborador' | 'rh';
}) => {
  try {
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, user_id, nome, email, role')
      .eq('user_id', userId)
      .single()
    
    // If profile exists, return it
    if (existingProfile && !checkError) {
      console.log('Profile already exists, returning existing profile')
      return existingProfile
    }
    
    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        nome: profileData.nome,
        role: profileData.role,
        status: 'ativo',
        data_admissao: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      })
      .select()
      .single()
    
    if (error) {
      // Handle unique constraint violation (profile already exists)
      if (error.code === '23505') {
        console.log('Profile already exists (unique constraint), fetching existing profile')
        const { data: existingData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (fetchError) {
          console.error('Error fetching existing profile:', fetchError)
          throw fetchError
        }
        
        return existingData
      }
      
      console.error('Error creating user profile:', error)
      throw error
    }
    
    console.log('Profile created successfully:', data)
    return data
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    throw error
  }
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}