/*
  # Fix hr_tests INSERT policy

  1. Security
    - Add INSERT policy for hr_tests table
    - Allow users to create tests for themselves
    - Allow HR users to create tests for any user
    - Use function-based approach to avoid recursion issues

  2. Changes
    - Create INSERT policy that checks user permissions safely
    - Ensure users can start their own tests
    - Ensure HR role can manage all tests
*/

-- Create INSERT policy for hr_tests
CREATE POLICY "Users and HR can insert hr_tests"
  ON hr_tests
  FOR INSERT
  WITH CHECK (
    -- User can create tests for themselves
    user_id = auth.uid() 
    OR 
    -- HR users can create tests for anyone
    get_user_role(auth.uid()) = 'rh'
  );