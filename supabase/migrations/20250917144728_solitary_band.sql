/*
  # Fix RLS Infinite Recursion on Profiles Table

  This migration completely resolves the infinite recursion error by:
  1. Dropping ALL existing policies that could cause recursion
  2. Dropping problematic functions that query profiles table
  3. Creating minimal, safe policies using direct comparisons only
  4. Using JWT metadata for role-based access instead of table queries

  ## Changes Made
  - Removed all recursive policies and functions
  - Added basic self-access policy
  - Added manager access via direct foreign key
  - Added admin/RH access via JWT metadata
*/

-- Step 1: Temporarily disable RLS to make changes safely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 3: Drop problematic functions that cause recursion
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_manager_of(uuid, uuid);

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create minimal, safe policies

-- Policy 1: Users can access their own profile
CREATE POLICY "users_own_profile_access" ON profiles
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Managers can view direct reports (non-recursive)
CREATE POLICY "managers_view_direct_reports" ON profiles
  FOR SELECT 
  USING (gestor_id = auth.uid());

-- Policy 3: Admin and RH can view all profiles (using JWT metadata)
CREATE POLICY "admin_rh_view_all_profiles" ON profiles
  FOR SELECT 
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  );

-- Policy 4: Admin and RH can modify all profiles (using JWT metadata)
CREATE POLICY "admin_rh_modify_all_profiles" ON profiles
  FOR UPDATE 
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'rh')
  );

-- Verify policies were created
SELECT 
  policyname, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;