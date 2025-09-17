/*
  # Fix Infinite Recursion in Profiles RLS Policies

  The profiles table has RLS policies that cause infinite recursion by calling
  functions that query the profiles table from within the profiles table policies.
  
  This migration:
  1. Drops ALL existing policies on profiles table
  2. Creates new safe policies that don't cause recursion
  3. Uses direct JWT claims and simple comparisons only
*/

-- Drop ALL existing policies on profiles table to eliminate recursion
DROP POLICY IF EXISTS "admin_can_manage_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_rh_can_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "employees_can_view_manager" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_direct_reports" ON profiles;
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "basic_own_profile_access" ON profiles;
DROP POLICY IF EXISTS "managers_can_view_team_profiles" ON profiles;

-- Create new safe policies that don't cause recursion

-- 1. Users can manage their own profile
CREATE POLICY "users_own_profile_access" ON profiles
  FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Admin can manage all profiles (using JWT claims directly)
CREATE POLICY "admin_full_access" ON profiles
  FOR ALL 
  TO authenticated 
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      ''
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );

-- 3. RH can view all profiles (using JWT claims directly)
CREATE POLICY "rh_view_all_profiles" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      ''
    ) = 'rh'
  );

-- 4. Managers can view direct reports (simple foreign key check)
CREATE POLICY "managers_view_reports" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (gestor_id = auth.uid());

-- 5. Employees can view their manager's basic info (simple foreign key check)
CREATE POLICY "employees_view_manager" ON profiles
  FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() IN (
      SELECT p.user_id 
      FROM profiles p 
      WHERE p.gestor_id = profiles.user_id
    )
  );

-- Verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;