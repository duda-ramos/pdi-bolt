/*
  # Fix RLS policy for profiles table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile
    - Ensure users can only create profiles for themselves (user_id = auth.uid())
    
  2. Policy Details
    - Name: "Users can create own profile"
    - Operation: INSERT
    - Target: authenticated users
    - Condition: user_id matches auth.uid()
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());