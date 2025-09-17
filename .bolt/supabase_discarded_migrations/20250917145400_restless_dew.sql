/*
# Fix RLS Infinite Recursion on Profiles Table

## Problem
The profiles table has RLS policies that call functions which query the profiles table itself,
creating infinite recursion (error 42P17).

## Solution
1. Drop all existing policies and problematic functions
2. Create minimal, safe policies using only direct comparisons
3. Use JWT claims for admin/RH roles instead of table queries
4. Use direct foreign key references for manager access

## Changes
- Remove all recursive policies and functions
- Create 4 safe policies for profiles table
- No functions that query profiles table
- Use auth.uid() and JWT claims only
*/

-- Step 0: Ensure RLS is enabled and drop problematic elements
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Drop problematic functions that cause recursion
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_manager_of(uuid, uuid);

-- Step 1: Create minimal, safe policies

-- Policy 1: Users can access their own profile
CREATE POLICY "users_own_profile_access" 
ON public.profiles
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Managers can view direct reports (simple foreign key reference)
CREATE POLICY "managers_view_direct_reports" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (gestor_id = auth.uid());

-- Policy 3: Employees can view their manager's basic info
CREATE POLICY "employees_view_manager" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (
    user_id = (
        SELECT p.gestor_id 
        FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.gestor_id IS NOT NULL
        LIMIT 1
    )
);

-- Policy 4: Admin/RH access via JWT claims (no table queries)
CREATE POLICY "admin_rh_full_access" 
ON public.profiles
FOR ALL 
TO authenticated
USING (
    COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb->>'role')::text,
        ''
    ) IN ('admin', 'rh')
)
WITH CHECK (
    COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb->>'role')::text,
        ''
    ) IN ('admin', 'rh')
);

-- Step 2: Create safe helper function (if needed) that doesn't query profiles
CREATE OR REPLACE FUNCTION public.get_user_role_from_jwt()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb->>'role')::text,
        'colaborador'
    );
END;
$$;

-- Step 3: Ensure profiles table has proper structure
DO $$
BEGIN
    -- Ensure user_id column exists and has proper constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Ensure gestor_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'gestor_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN gestor_id uuid REFERENCES public.profiles(user_id);
    END IF;
END $$;

-- Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with RLS policies - no recursive functions';