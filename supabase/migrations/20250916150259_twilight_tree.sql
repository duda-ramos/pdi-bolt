/*
  # Fix is_manager_of function error 42P13

  1. Function Updates
    - Replace is_manager_of function with proper parameter handling
    - Add security definer and stable properties
    - Set proper search_path for security

  2. Security
    - Maintain RLS policies functionality
    - Ensure proper grants for authenticated users
    - Keep function stable and secure
*/

-- Option A: Replace the existing function with corrected parameter names
CREATE OR REPLACE FUNCTION is_manager_of(manager_user_id uuid, employee_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check if manager_user_id is the direct manager of employee_user_id
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = employee_user_id 
    AND gestor_id = manager_user_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_manager_of(uuid, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION is_manager_of(uuid, uuid) IS 'Checks if the first user is the direct manager of the second user';