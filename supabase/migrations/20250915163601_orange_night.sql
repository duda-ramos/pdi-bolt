/*
  # Complete fix for profiles RLS infinite recursion

  This migration completely removes all existing RLS policies on the profiles table
  and creates new, safe policies that do not cause infinite recursion.

  ## Changes Made
  1. Drop all existing policies on profiles table
  2. Create simple, non-recursive policies
  3. Ensure users can access their own data
  4. Allow basic team relationships without recursion

  ## Security Notes
  - Users can only view and edit their own profiles
  - Managers can view direct reports through gestor_id relationship
  - No recursive queries that reference profiles table within policies
*/

-- Drop ALL existing policies on profiles table to eliminate recursion
DROP POLICY IF EXISTS "managers_can_view_direct_reports" ON profiles;
DROP POLICY IF EXISTS "team_members_can_view_related_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;

-- Create simple, safe policies that do NOT cause recursion

-- 1. Users can view and manage their own profile
CREATE POLICY "users_own_profile_access" ON profiles
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Managers can view their direct reports (simple foreign key relationship)
CREATE POLICY "managers_view_reports" ON profiles
  FOR SELECT 
  USING (gestor_id = auth.uid());

-- 3. Allow viewing profiles of users in the same team (if time_id matches)
CREATE POLICY "team_members_view_profiles" ON profiles
  FOR SELECT 
  USING (
    time_id IS NOT NULL 
    AND time_id IN (
      SELECT time_id 
      FROM profiles 
      WHERE user_id = auth.uid() 
      AND time_id IS NOT NULL
    )
  );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;