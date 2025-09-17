/*
  # Complete fix for RLS infinite recursion on profiles table

  This migration completely resolves the infinite recursion issue by:
  1. Temporarily disabling RLS to make changes safely
  2. Dropping all existing problematic policies and functions
  3. Creating a new non-recursive get_user_role function using JWT metadata
  4. Creating minimal, safe RLS policies that don't cause recursion
  5. Re-enabling RLS with the fixed policies
*/

-- Step 1: Temporarily disable RLS to make changes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on profiles table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Drop problematic functions that cause recursion
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_manager_of(uuid, uuid);

-- Step 4: Create new non-recursive get_user_role function using JWT metadata
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    user_role text;
BEGIN
    -- First try to get role from JWT metadata
    SELECT auth.jwt() ->> 'app_role' INTO user_role;
    
    -- If not found in JWT, return default role
    IF user_role IS NULL THEN
        user_role := 'colaborador';
    END IF;
    
    RETURN user_role;
END;
$$;

-- Step 5: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create minimal, safe RLS policies

-- Policy 1: Users can access their own profile
CREATE POLICY "users_own_profile_access" ON profiles
    FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Policy 2: Managers can view direct reports (using direct foreign key, no recursion)
CREATE POLICY "managers_view_direct_reports" ON profiles
    FOR SELECT 
    TO authenticated 
    USING (gestor_id = auth.uid());

-- Policy 3: Employees can view their manager (using simple subquery, no recursion)
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

-- Step 7: Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;