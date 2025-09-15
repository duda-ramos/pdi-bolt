/**
 * Supabase Client Singleton
 * 
 * Este arquivo garante que apenas uma instância do cliente Supabase seja criada
 * para evitar problemas de múltiplas instâncias e conflitos de estado.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

// Validação e configuração das variáveis de ambiente
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  console.log('🔍 Supabase Environment Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabaseAnonKey?.length || 0
  })

  // Usar valores padrão para desenvolvimento se as variáveis não estiverem definidas
  const defaultUrl = 'https://pbjwtnhpcwkplnyzkrtu.supabase.co'
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiand0bmhwY3drcGxueXprcnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDE3OTMsImV4cCI6MjA3MTg3Nzc5M30.yisHwRskz-2wpS4fbqarBxPdBSGxFxYiIfF-YOvinq0'

  const finalUrl = supabaseUrl || defaultUrl
  const finalKey = supabaseAnonKey || defaultKey

  console.log('🚀 Using Supabase URL:', finalUrl)

  return { url: finalUrl, key: finalKey }
}

// Função para obter a instância singleton do cliente Supabase
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    console.log('🔧 Creating new Supabase client instance...')
    
    const { url, key } = getSupabaseConfig()
    
    try {
      supabaseInstance = createClient<Database>(url, key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false // Desabilitar para evitar problemas de roteamento
        },
        global: {
          headers: {
            'X-Client-Info': 'dea-pdi-app'
          }
        }
      })
      
      console.log('✅ Supabase client created successfully')
    } catch (error) {
      console.error('❌ Error creating Supabase client:', error)
      throw error
    }
  } else {
    console.log('♻️ Reusing existing Supabase client instance')
  }
  
  return supabaseInstance
}

// Export da instância para compatibilidade com código existente
export const supabase = getSupabaseClient()

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    console.log('👤 Getting current user...')
    const client = getSupabaseClient()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error) {
      console.error('❌ Error getting current user:', error)
      return null
    }
    
    console.log('✅ Current user retrieved:', user ? `${user.email} (${user.id})` : 'No user')
    return user
  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error)
    return null
  }
}

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    console.log('📋 Getting user profile for:', userId)
    const client = getSupabaseClient()
    
    const { data, error } = await client
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
      console.error('❌ Error getting user profile:', error)
      return null
    }
  
    console.log('✅ User profile retrieved:', data ? `${data.nome} (${data.role})` : 'No profile')
    return data
  } catch (error) {
    console.error('❌ Error in getUserProfile:', error)
    return null
  }
}

// Helper function to create user profile
export const createUserProfile = async (userId: string, email: string, profileData: {
  nome: string;
  role: 'admin' | 'gestor' | 'colaborador' | 'rh';
}) => {
  try {
    console.log('🆕 Creating user profile for:', userId, profileData)
    const client = getSupabaseClient()
    
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await client
      .from('profiles')
      .select('id, user_id, nome, email, role')
      .eq('user_id', userId)
      .single()
    
    // If profile exists, return it
    if (existingProfile && !checkError) {
      console.log('✅ Profile already exists, returning existing profile')
      return existingProfile
    }
    
    // Create new profile
    const { data, error } = await client
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
        console.log('✅ Profile already exists (unique constraint), fetching existing profile')
        const { data: existingData, error: fetchError } = await client
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        detectSessionInUrl: false, // Desabilitar para evitar problemas de roteamento
        flowType: 'pkce'
          console.error('❌ Error fetching existing profile:', fetchError)
          throw fetchError
        }
        
        return existingData
      },
      // Garantir URLs válidas para redirecionamento
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
      }
      
      console.error('❌ Error creating user profile:', error)
      throw error
    }
    
    console.log('✅ Profile created successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error in createUserProfile:', error)
    throw error
  }
}

// Helper function to sign out
export const signOut = async () => {
  try {
    console.log('🚪 Signing out...')
    const client = getSupabaseClient()
    const { error } = await client.auth.signOut()
    
    if (error) {
      console.error('❌ Error signing out:', error)
      throw error
    }
    
    console.log('✅ Sign out successful')
  } catch (error) {
    console.error('❌ Error in signOut:', error)
    throw error
  }
}

// Reset singleton (útil para testes ou reinicializações)
export const resetSupabaseClient = () => {
  console.log('🔄 Resetting Supabase client instance')
  supabaseInstance = null
}