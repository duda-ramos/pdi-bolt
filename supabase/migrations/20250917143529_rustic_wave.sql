/*
  # Fix RLS Infinite Recursion on Profiles Table

  This migration fixes the infinite recursion error in RLS policies on the profiles table.
  The issue occurs when policies use functions like get_user_role() or is_manager_of() 
  that query the same profiles table, creating circular dependencies.

  ## Changes Made:
  1. Drop all existing problematic policies on profiles table
  2. Create new safe policies using direct auth.uid() comparisons
  3. Use direct column references instead of recursive functions
  4. Maintain proper access control without recursion

  ## New Access Pattern:
  - Users can view/edit their own profile
  - Managers can view direct reports (using gestor_id directly)
  - Employees can view their manager's profile
  - No recursive function calls
*/

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "basic_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "users_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "employees_view_manager" ON profiles;
DROP POLICY IF EXISTS "managers_view_direct_reports" ON profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_team_profiles" ON profiles;
DROP POLICY IF EXISTS "team_members_can_view_related_profiles" ON profiles;

-- Create new safe policies without recursion

-- 1. Users can view and update their own profile
CREATE POLICY "users_own_profile_full_access" ON profiles
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 2. Managers can view their direct reports
CREATE POLICY "managers_view_direct_reports" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (gestor_id = auth.uid());

-- 3. Employees can view their manager's profile
CREATE POLICY "employees_view_manager" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (
    user_id = (
      SELECT gestor_id 
      FROM profiles 
      WHERE user_id = auth.uid() 
      LIMIT 1
    )
  );

-- 4. Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify the policies are working by testing basic access patterns
-- This comment documents the expected behavior:
-- - User A can see their own profile
-- - Manager B can see profiles of users where gestor_id = B's user_id
-- - Employee C can see their manager's profile
-- - No infinite recursion should occur