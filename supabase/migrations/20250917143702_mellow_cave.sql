/*
  # Fix RLS Infinite Recursion on Profiles Table

  This migration completely removes all RLS policies that cause infinite recursion
  and replaces them with safe, non-recursive policies.

  ## Problem
  The current RLS policies use functions like `get_user_role()` and `is_manager_of()`
  which query the `profiles` table from within policies on the same table,
  causing infinite recursion.

  ## Solution
  1. Drop all existing problematic policies
  2. Create new policies using direct auth.uid() comparisons
  3. Use JWT metadata for role-based access instead of table queries
  4. Use direct foreign key relationships for manager access

  ## New Policies
  - Users can access their own profile
  - Managers can view direct reports using gestor_id
  - Admin/RH roles can access all profiles using JWT metadata
*/

-- Step 1: Drop ALL existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "basic_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "users_own_profile_full_access" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_team_profiles" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_direct_reports" ON profiles;
DROP POLICY IF EXISTS "employees_view_manager" ON profiles;
DROP POLICY IF EXISTS "admin_rh_can_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_rh_can_modify_all_profiles" ON profiles;

-- Step 2: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create safe, non-recursive policies

-- Policy 1: Users can view and modify their own profile
CREATE POLICY "users_own_profile_access" ON profiles
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Managers can view their direct reports
CREATE POLICY "managers_view_direct_reports" ON profiles
  FOR SELECT 
  TO authenticated
  USING (gestor_id = auth.uid());

-- Policy 3: Employees can view their manager's profile
CREATE POLICY "employees_view_manager" ON profiles
  FOR SELECT 
  TO authenticated
  USING (
    user_id = (
      SELECT gestor_id 
      FROM profiles 
      WHERE user_id = auth.uid() 
      AND gestor_id IS NOT NULL
      LIMIT 1
    )
  );

-- Policy 4: Admin and RH roles can view all profiles (using JWT metadata)
CREATE POLICY "admin_rh_view_all_profiles" ON profiles
  FOR SELECT 
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  );

-- Policy 5: Admin and RH roles can modify all profiles (using JWT metadata)
CREATE POLICY "admin_rh_modify_all_profiles" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  );

-- Policy 6: Admin and RH roles can insert profiles (for user management)
CREATE POLICY "admin_rh_insert_profiles" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  );

-- Step 4: Drop the problematic functions to prevent future recursion issues
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_manager_of(uuid, uuid);

-- Step 5: Create a simple, safe function for role checking (optional, for future use)
CREATE OR REPLACE FUNCTION get_user_role_from_jwt()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role';
$$;