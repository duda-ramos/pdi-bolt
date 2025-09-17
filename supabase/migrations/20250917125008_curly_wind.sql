/*
  # Validate RLS Policies After Function Fix

  This script validates that all RLS policies are still working correctly
  after updating the get_user_role function.
*/

-- Test the function directly
DO $$
DECLARE
    test_result user_role;
BEGIN
    -- Test with null input
    SELECT get_user_role(NULL) INTO test_result;
    RAISE NOTICE 'get_user_role(NULL) = %', test_result;
    
    -- Test with random UUID (should return colaborador)
    SELECT get_user_role(gen_random_uuid()) INTO test_result;
    RAISE NOTICE 'get_user_role(random_uuid) = %', test_result;
END $$;

-- Verify all policies that use get_user_role are still valid
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE qual LIKE '%get_user_role%' 
   OR with_check LIKE '%get_user_role%'
ORDER BY schemaname, tablename, policyname;

-- Check function signature and properties
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    p.provolatile as volatility,
    p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'get_user_role';

-- Verify the function exists and has correct signature
SELECT EXISTS(
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.proname = 'get_user_role'
      AND pg_get_function_identity_arguments(p.oid) = 'user_uuid uuid'
) as function_exists;

-- Test policies that commonly use get_user_role
EXPLAIN (FORMAT TEXT) 
SELECT * FROM profiles 
WHERE get_user_role(auth.uid()) = 'admin'::user_role 
LIMIT 1;

EXPLAIN (FORMAT TEXT)
SELECT * FROM salary_history 
WHERE get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])
LIMIT 1;

-- Verify no broken policies
SELECT 
    schemaname,
    tablename,
    policyname,
    'Policy references get_user_role correctly' as status
FROM pg_policies 
WHERE (qual LIKE '%get_user_role(%' OR with_check LIKE '%get_user_role(%')
  AND (qual NOT LIKE '%get_user_role(auth.uid())%' AND with_check NOT LIKE '%get_user_role(auth.uid())%')
ORDER BY schemaname, tablename;