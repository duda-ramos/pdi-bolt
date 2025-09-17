/*
  # Emergency Fix for RLS Infinite Recursion on Profiles Table

  This migration completely removes all RLS policies that cause infinite recursion
  and replaces them with safe, non-recursive policies.

  ## Problem
  The current RLS policies on the profiles table are causing infinite recursion
  because they query the same table they are protecting.

  ## Solution
  1. Drop ALL existing policies on profiles table
  2. Create minimal, safe policies using only auth.uid() and direct foreign keys
  3. Avoid any function calls that might query the profiles table
*/

-- Step 1: Disable RLS temporarily to ensure we can make changes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "basic_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "users_own_profile_full_access" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_team_profiles" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_direct_reports" ON profiles;
DROP POLICY IF EXISTS "employees_view_manager" ON profiles;
DROP POLICY IF EXISTS "admin_rh_can_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_rh_can_modify_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_direct_reports" ON profiles;
DROP POLICY IF EXISTS "team_members_can_view_related_profiles" ON profiles;

-- Step 3: Drop problematic functions that cause recursion
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_manager_of(uuid, uuid);

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create ONLY the most basic, safe policy for self-access
CREATE POLICY "users_own_profile_only" ON profiles
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Create a simple policy for managers to view direct reports
-- This uses only a direct foreign key relationship, no function calls
CREATE POLICY "managers_view_direct_reports_simple" ON profiles
  FOR SELECT
  TO authenticated
  USING (gestor_id = auth.uid());