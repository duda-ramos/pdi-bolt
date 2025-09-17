/*
  # Fix get_user_role function - Resolve 2BP01 error

  1. Security
    - Replace get_user_role function maintaining exact same signature
    - Add SECURITY DEFINER, STABLE and proper search_path
    - Maintain GRANT EXECUTE for authenticated users
  
  2. Function Logic
    - Keep same parameter name and type: user_uuid uuid
    - Improve error handling and performance
    - Add proper null checks and default values
*/

-- Replace the existing function with improved logic but same signature
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
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
        RAISE WARNING 'Error in get_user_role for user %: %', user_uuid, SQLERRM;
        RETURN 'colaborador'::user_role;
END;
$$;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO service_role;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_role(uuid) IS 'Returns the role of a user by user_id. Returns colaborador as default for safety.';