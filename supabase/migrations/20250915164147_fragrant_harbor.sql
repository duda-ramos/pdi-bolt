/*
  # Emergency Fix for Profiles RLS Infinite Recursion

  This migration completely removes all RLS policies from the profiles table
  and creates only the most basic policy to allow users to access their own profiles.
  This breaks the infinite recursion cycle.

  ## Changes
  1. Drop ALL existing policies on profiles table
  2. Create single, simple policy for own profile access
  3. Temporarily disable complex access patterns until recursion is resolved

  ## Security Impact
  - Users can only access their own profiles
  - Manager and team access temporarily disabled
  - Admin access temporarily disabled
*/

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "users_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "managers_view_reports" ON profiles;
DROP POLICY IF EXISTS "team_members_view_profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage profiles" ON profiles;
DROP POLICY IF EXISTS "HR can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Gestor can view managed profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Managers can view direct reports" ON profiles;
DROP POLICY IF EXISTS "Team members can view related profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create the most basic policy possible - users can only access their own profile
CREATE POLICY "basic_own_profile_access" 
ON profiles 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);