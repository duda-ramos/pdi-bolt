/*
  # Rollback Plan for get_user_role Function

  This script provides a rollback plan in case the function update causes issues.
  It creates a wrapper function and restores the original behavior if needed.
*/

-- Backup current function (create wrapper with different name)
CREATE OR REPLACE FUNCTION get_user_role_backup(user_uuid uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    user_role_result user_role;
BEGIN
    -- Input validation
    IF user_uuid IS NULL THEN
        RETURN 'colaborador'::user_role;
    END IF;
    
    -- Get user role from profiles table
    SELECT role INTO user_role_result
    FROM profiles
    WHERE user_id = user_uuid
    AND status = 'ativo'::user_status
    LIMIT 1;
    
    -- Return result or default to colaborador
    RETURN COALESCE(user_role_result, 'colaborador'::user_role);
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return safe default
        RAISE WARNING 'Error in get_user_role_backup for user %: %', user_uuid, SQLERRM;
        RETURN 'colaborador'::user_role;
END;
$$;

-- Grant permissions to backup function
GRANT EXECUTE ON FUNCTION get_user_role_backup(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_backup(uuid) TO service_role;

-- If rollback is needed, uncomment the following:
/*
-- Step 1: Create new function with original logic (if needed)
CREATE OR REPLACE FUNCTION get_user_role_original(user_uuid uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Original simple logic (replace with actual original if different)
    RETURN (
        SELECT COALESCE(role, 'colaborador'::user_role)
        FROM profiles
        WHERE user_id = user_uuid
        LIMIT 1
    );
END;
$$;

-- Step 2: Update all policies to use original function
-- (This would require updating each policy individually)

-- Step 3: Drop the current function and rename original
DROP FUNCTION get_user_role(uuid);
ALTER FUNCTION get_user_role_original(uuid) RENAME TO get_user_role;
*/

-- Verification queries for rollback
SELECT 'Rollback verification - Functions exist:' as status;

SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as signature,
    prosecdef as security_definer
FROM pg_proc 
WHERE proname IN ('get_user_role', 'get_user_role_backup')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Test both functions return same result
DO $$
DECLARE
    test_uuid uuid := gen_random_uuid();
    result1 user_role;
    result2 user_role;
BEGIN
    SELECT get_user_role(test_uuid) INTO result1;
    SELECT get_user_role_backup(test_uuid) INTO result2;
    
    IF result1 = result2 THEN
        RAISE NOTICE 'Functions return consistent results: %', result1;
    ELSE
        RAISE WARNING 'Functions return different results: % vs %', result1, result2;
    END IF;
END $$;