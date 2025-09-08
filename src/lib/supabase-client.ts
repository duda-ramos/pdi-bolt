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
      .single()
  
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
    // Use service role key for initial profile creation to bypass RLS
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        nome: profileData.nome,
        role: profileData.role,
        status: 'ativo'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
    
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