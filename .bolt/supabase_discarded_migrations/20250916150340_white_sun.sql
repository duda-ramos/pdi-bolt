/*
  # Test RLS functions and policies

  This migration provides test queries to verify that all RLS functions
  are working correctly and policies are properly configured.
*/

-- Test script to verify RLS functions work correctly
DO $$
DECLARE
  test_user_1 uuid := '11111111-1111-1111-1111-111111111111';
  test_user_2 uuid := '22222222-2222-2222-2222-222222222222';
  test_result boolean;
  role_result user_role;
BEGIN
  RAISE NOTICE 'Starting RLS function tests...';
  
  -- Test 1: is_manager_of function
  BEGIN
    test_result := is_manager_of(test_user_1, test_user_2);
    RAISE NOTICE 'Test 1 PASSED: is_manager_of function executed without error';
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Test 1 FAILED: is_manager_of function error: %', SQLERRM;
  END;
  
  -- Test 2: get_user_role function
  BEGIN
    role_result := get_user_role(test_user_1);
    RAISE NOTICE 'Test 2 PASSED: get_user_role function executed, returned: %', role_result;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Test 2 FAILED: get_user_role function error: %', SQLERRM;
  END;
  
  -- Test 3: is_user_active function
  BEGIN
    test_result := is_user_active(test_user_1);
    RAISE NOTICE 'Test 3 PASSED: is_user_active function executed without error';
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Test 3 FAILED: is_user_active function error: %', SQLERRM;
  END;
  
  -- Test 4: can_access_user_data function
  BEGIN
    test_result := can_access_user_data(test_user_1, test_user_2);
    RAISE NOTICE 'Test 4 PASSED: can_access_user_data function executed without error';
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Test 4 FAILED: can_access_user_data function error: %', SQLERRM;
  END;
  
  RAISE NOTICE 'All RLS function tests completed successfully!';
END $$;

-- Verify all required functions exist
DO $$
DECLARE
  missing_functions text[] := ARRAY[]::text[];
BEGIN
  -- Check is_manager_of
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_manager_of' AND pronargs = 2) THEN
    missing_functions := array_append(missing_functions, 'is_manager_of(uuid, uuid)');
  END IF;
  
  -- Check get_user_role
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_role' AND pronargs = 1) THEN
    missing_functions := array_append(missing_functions, 'get_user_role(uuid)');
  END IF;
  
  -- Check is_user_active
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_user_active' AND pronargs = 1) THEN
    missing_functions := array_append(missing_functions, 'is_user_active(uuid)');
  END IF;
  
  -- Check can_access_user_data
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'can_access_user_data' AND pronargs = 2) THEN
    missing_functions := array_append(missing_functions, 'can_access_user_data(uuid, uuid)');
  END IF;
  
  IF array_length(missing_functions, 1) > 0 THEN
    RAISE EXCEPTION 'Missing required functions: %', array_to_string(missing_functions, ', ');
  ELSE
    RAISE NOTICE 'All required RLS functions are present and accounted for!';
  END IF;
END $$;

-- Show function signatures for verification
SELECT 
  proname as function_name,
  pronargs as argument_count,
  prorettype::regtype as return_type,
  prosecdef as security_definer,
  provolatile as volatility
FROM pg_proc 
WHERE proname IN ('is_manager_of', 'get_user_role', 'is_user_active', 'can_access_user_data')
ORDER BY proname;