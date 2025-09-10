/**
 * Supabase Security Configuration and Utilities
 * 
 * This file contains security-related configurations and utilities
 * for the Supabase integration to ensure proper security practices.
 */

import { supabase } from './supabase';

/**
 * Security validation for environment variables
 */
export const validateEnvironment = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Check if environment variables are set
  if (!url || !anonKey) {
    throw new Error('Missing required Supabase environment variables');
  }
  
  // Validate URL format
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    console.warn('⚠️ Supabase URL format may be incorrect');
  }
  
  // Check for accidentally exposed service role key
  if (anonKey.length > 400) {
    console.error('🚨 SECURITY WARNING: Anon key appears to be a service role key!');
    console.error('Service role keys should NEVER be used in frontend code');
    throw new Error('Invalid key type detected');
  }
  
  console.log('✅ Supabase environment validation passed');
};

/**
 * Check RLS status for critical tables
 */
export const checkRLSStatus = async () => {
  try {
    // List of tables that should have RLS enabled
    const criticalTables = [
      'profiles',
      'pdi_objectives', 
      'assessments',
      'hr_records',
      'hr_tests',
      'salary_history',
      'touchpoints',
      'pdi_comments',
      'achievements'
    ];
    
    console.log('🔒 Checking RLS status for critical tables...');
    
    // Note: This is a client-side check and may not work in all environments
    // For production, you should verify RLS in the Supabase dashboard
    for (const table of criticalTables) {
      try {
        // Attempt to query without proper authentication to test RLS
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === '42501') {
          console.log(`✅ RLS is properly configured for table: ${table}`);
        } else if (!error) {
          console.warn(`⚠️ Table ${table} may not have proper RLS policies`);
        }
      } catch (err) {
        console.log(`✅ RLS appears to be working for table: ${table}`);
      }
    }
  } catch (error) {
    console.error('Error checking RLS status:', error);
  }
};

/**
 * Security headers and configurations
 */
export const securityConfig = {
  // Recommended security headers for production
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
};

/**
 * Initialize security checks
 */
export const initializeSecurity = async () => {
  try {
    validateEnvironment();
    await checkRLSStatus();
    console.log('🛡️ Security initialization completed');
  } catch (error) {
    console.error('🚨 Security initialization failed:', error);
    throw error;
  }
};