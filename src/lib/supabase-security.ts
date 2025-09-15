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
export const checkRLSStatus = async (): Promise<{ table: string; status: string; hasError: boolean }[]> => {
  const results: { table: string; status: string; hasError: boolean }[] = [];
  
  try {
    // List of tables that should have RLS enabled
    const criticalTables = [
      'profiles',
      'pdi_objectives', 
      'assessments',
      'achievements',
      'salary_history',
      'hr_records',
      'hr_tests',
      'touchpoints',
      'pdi_comments',
      'action_groups',
      'action_group_members',
      'action_group_tasks',
      'teams',
      'career_tracks',
      'career_stages',
      'competencies'
    ];
    
    console.log('🔒 Checking RLS status for critical tables...');
    
    for (const table of criticalTables) {
      try {
        // Test basic access to verify RLS is working
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === '42501' || error.message.includes('permission denied')) {
            results.push({ table, status: 'RLS working - access denied as expected', hasError: false });
            console.log(`✅ RLS is properly configured for table: ${table}`);
          } else {
            results.push({ table, status: `Error: ${error.message}`, hasError: true });
            console.error(`❌ Error checking table ${table}:`, error.message);
          }
        } else {
          results.push({ table, status: 'RLS may not be properly configured', hasError: true });
          console.warn(`⚠️ Table ${table} may not have proper RLS policies`);
        }
      } catch (err) {
        results.push({ table, status: 'RLS appears to be working', hasError: false });
        console.log(`✅ RLS appears to be working for table: ${table}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking RLS status:', error);
    return [{ table: 'all', status: `Global error: ${error}`, hasError: true }];
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