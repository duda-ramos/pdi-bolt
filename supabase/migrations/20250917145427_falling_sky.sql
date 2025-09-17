/*
# Rollback Script for RLS Policies Fix

This script safely reverts the changes made by the migration.
Run this if you need to restore the previous state.
*/

-- Step 1: Disable RLS temporarily for safe changes
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the new policies we created
DROP POLICY IF EXISTS "users_own_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "managers_view_direct_reports" ON public.profiles;
DROP POLICY IF EXISTS "employees_view_manager" ON public.profiles;
DROP POLICY IF EXISTS "admin_rh_full_access" ON public.profiles;

-- Step 3: Drop the new helper function
DROP FUNCTION IF EXISTS public.get_user_role_from_jwt();

-- Step 4: Restore original functions (if they existed)
-- Note: You would need to restore the original function definitions here
-- This is a placeholder - replace with actual original functions if needed

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- WARNING: This function may cause recursion if used in profiles policies
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE user_id = user_uuid 
        LIMIT 1
    );
END;
$$;

-- Step 5: Restore original policies (if they existed)
-- Note: Replace these with the actual original policies

CREATE POLICY "users_own_profile_full_access" 
ON public.profiles
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "managers_view_direct_reports" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (gestor_id = auth.uid());

CREATE POLICY "employees_view_manager" 
ON public.profiles
FOR SELECT 
TO authenticated
USING (
    user_id = (
        SELECT profiles_1.gestor_id
        FROM profiles profiles_1
        WHERE profiles_1.user_id = uid()
        LIMIT 1
    )
);

-- Step 6: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify rollback
SELECT 'Rollback verification' as status,
       count(*) as policies_count
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';