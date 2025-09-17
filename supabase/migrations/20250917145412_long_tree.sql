/*
# RLS Verification Tests for Profiles Table

Run these tests to verify that RLS policies work correctly without recursion.
Each test should complete without infinite recursion errors.
*/

-- Test Setup: Create test users and data
DO $$
DECLARE
    test_user_id uuid := '87d72edc-7ba6-4efd-bf91-f3048dc871fa';
    test_manager_id uuid := gen_random_uuid();
    test_admin_id uuid := gen_random_uuid();
BEGIN
    -- Ensure test profiles exist (insert if not exists)
    INSERT INTO public.profiles (user_id, nome, email, role, status)
    VALUES 
        (test_user_id, 'Test User', 'user@test.com', 'colaborador', 'ativo'),
        (test_manager_id, 'Test Manager', 'manager@test.com', 'gestor', 'ativo'),
        (test_admin_id, 'Test Admin', 'admin@test.com', 'admin', 'ativo')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Set manager relationship
    UPDATE public.profiles 
    SET gestor_id = test_manager_id 
    WHERE user_id = test_user_id;
    
    RAISE NOTICE 'Test data setup complete';
END $$;

-- Test 1: User accessing own profile (should work)
BEGIN;
    -- Simulate authenticated user
    SELECT set_config('request.jwt.claim.sub', '87d72edc-7ba6-4efd-bf91-f3048dc871fa', true);
    SELECT set_config('role', 'authenticated', true);
    
    -- This should return 1 row without recursion
    SELECT 'Test 1: Own profile access' as test_name, 
           count(*) as result_count,
           'Should be 1' as expected
    FROM public.profiles 
    WHERE user_id = '87d72edc-7ba6-4efd-bf91-f3048dc871fa';
ROLLBACK;

-- Test 2: Manager accessing direct report (should work)
BEGIN;
    -- Get manager ID for the test user
    SELECT gestor_id INTO @manager_id 
    FROM public.profiles 
    WHERE user_id = '87d72edc-7ba6-4efd-bf91-f3048dc871fa';
    
    -- Simulate manager session
    SELECT set_config('request.jwt.claim.sub', @manager_id::text, true);
    SELECT set_config('role', 'authenticated', true);
    
    -- Manager should see direct report
    SELECT 'Test 2: Manager viewing report' as test_name,
           count(*) as result_count,
           'Should be 1' as expected
    FROM public.profiles 
    WHERE user_id = '87d72edc-7ba6-4efd-bf91-f3048dc871fa';
ROLLBACK;

-- Test 3: Admin access via JWT claims (should work)
BEGIN;
    -- Simulate admin with JWT claims
    SELECT set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
    SELECT set_config('request.jwt.claims', '{"role": "admin"}', true);
    SELECT set_config('role', 'authenticated', true);
    
    -- Admin should see all profiles
    SELECT 'Test 3: Admin access' as test_name,
           count(*) as result_count,
           'Should be > 0' as expected
    FROM public.profiles;
ROLLBACK;

-- Test 4: Unauthorized access (should return 0 rows)
BEGIN;
    -- Simulate different user trying to access profile
    SELECT set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
    SELECT set_config('role', 'authenticated', true);
    
    -- Should return 0 rows
    SELECT 'Test 4: Unauthorized access' as test_name,
           count(*) as result_count,
           'Should be 0' as expected
    FROM public.profiles 
    WHERE user_id = '87d72edc-7ba6-4efd-bf91-f3048dc871fa';
ROLLBACK;

-- Test 5: Reproduce exact frontend query
BEGIN;
    -- Simulate exact frontend request
    SELECT set_config('request.jwt.claim.sub', '87d72edc-7ba6-4efd-bf91-f3048dc871fa', true);
    SELECT set_config('role', 'authenticated', true);
    
    -- Exact query from frontend (should not cause recursion)
    SELECT 'Test 5: Frontend query reproduction' as test_name,
           id, user_id, nome, email, role, status, 
           data_admissao, data_desligamento, time_id, gestor_id,
           bio, localizacao, formacao, trilha_id, created_at, updated_at
    FROM public.profiles 
    WHERE user_id = '87d72edc-7ba6-4efd-bf91-f3048dc871fa';
ROLLBACK;

-- Test 6: Verify no infinite recursion in policies
SELECT 'Test 6: Policy verification' as test_name,
       policyname,
       qual as using_clause,
       with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY policyname;

-- Test 7: Verify no problematic functions exist
SELECT 'Test 7: Function verification' as test_name,
       proname as function_name,
       prosrc as function_body
FROM pg_proc 
WHERE proname IN ('get_user_role', 'is_manager_of')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');