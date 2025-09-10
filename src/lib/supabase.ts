import { createClient } from '@supabase/supabase-js'
import { validateEnvironment } from './supabase-security'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables and security
try {
  validateEnvironment();
  
  // Only show debug info in development
  if (import.meta.env.DEV) {
    console.log('🔍 Supabase Debug Info:')
    console.log('URL:', supabaseUrl)
    console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined')
  }
} catch (error) {
  console.error('🚨 Supabase configuration error:', error);
  throw error;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Security configurations
  global: {
    headers: {
      'X-Client-Info': 'dea-pdi-app'
    }
  }
})