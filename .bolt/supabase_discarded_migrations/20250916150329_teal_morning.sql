/*
  # Add helper functions for RLS policies

  1. Helper Functions
    - get_user_role: Get user role safely
    - is_user_active: Check if user is active
    - can_access_user_data: Centralized access control

  2. Security
    - All functions use SECURITY DEFINER
    - Proper search_path configuration
    - Grant appropriate permissions
*/

-- Helper function to get user role safely
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
  SELECT role INTO user_role_result
  FROM profiles
  WHERE user_id = user_uuid AND status = 'ativo';
  
  RETURN COALESCE(user_role_result, 'colaborador'::user_role);
END;
$$;

-- Helper function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = user_uuid 
    AND status = 'ativo'
  );
END;
$$;

-- Helper function for centralized access control
CREATE OR REPLACE FUNCTION can_access_user_data(accessor_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  accessor_role user_role;
BEGIN
  -- Get accessor role
  accessor_role := get_user_role(accessor_id);
  
  -- Admin and RH can access all data
  IF accessor_role IN ('admin', 'rh') THEN
    RETURN true;
  END IF;
  
  -- Users can access their own data
  IF accessor_id = target_user_id THEN
    RETURN true;
  END IF;
  
  -- Managers can access their direct reports' data
  IF accessor_role = 'gestor' AND is_manager_of(accessor_id, target_user_id) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_user_data(uuid, uuid) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_role(uuid) IS 'Safely retrieves user role, defaults to colaborador if not found';
COMMENT ON FUNCTION is_user_active(uuid) IS 'Checks if user exists and has active status';
COMMENT ON FUNCTION can_access_user_data(uuid, uuid) IS 'Centralized function to check if accessor can view target user data';