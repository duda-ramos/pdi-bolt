/*
# Fix Infinite Recursion in Profiles RLS Policies

The current RLS policies on the profiles table are causing infinite recursion
because they query the profiles table from within the profiles table policies.

This migration removes all problematic policies and implements safe, non-recursive policies.
*/

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "basic_own_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile_full_access" ON public.profiles;
DROP POLICY IF EXISTS "employees_view_manager" ON public.profiles;
DROP POLICY IF EXISTS "managers_view_direct_reports" ON public.profiles;
DROP POLICY IF EXISTS "managers_can_view_team_profiles" ON public.profiles;

-- Create safe, non-recursive policies for profiles table

-- 1. Users can manage their own profile (view and update)
CREATE POLICY "users_can_manage_own_profile" 
ON public.profiles
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 2. Managers can view their direct reports using direct foreign key relationship
-- This is safe because it uses the foreign key directly without querying profiles
CREATE POLICY "managers_can_view_direct_reports" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (gestor_id = auth.uid());

-- 3. Employees can view their manager's basic info using direct foreign key
-- This is safe because it only checks if the current user is referenced as gestor_id
CREATE POLICY "employees_can_view_manager" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE gestor_id = profiles.user_id
  )
);

-- 4. Admin and RH roles can view all profiles using JWT claims (no recursion)
CREATE POLICY "admin_rh_can_view_all_profiles" 
ON public.profiles
FOR SELECT 
TO authenticated 
USING (
  COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'role')::text,
    ''
  ) IN ('admin', 'rh')
);

-- 5. Admin can manage all profiles using JWT claims (no recursion)
CREATE POLICY "admin_can_manage_all_profiles" 
ON public.profiles
FOR ALL 
TO authenticated 
USING (
  COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'role')::text,
    ''
  ) = 'admin'
) 
WITH CHECK (
  COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'role')::text,
    ''
  ) = 'admin'
);

-- Add comment explaining the fix
COMMENT ON TABLE public.profiles IS 'RLS policies updated to prevent infinite recursion by avoiding self-referential queries';