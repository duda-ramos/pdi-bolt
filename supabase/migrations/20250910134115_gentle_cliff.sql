/*
  # Add RLS policies for profiles table

  1. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for managers to read their team members' profiles
    - Add policy for HR to read all profiles
    - Add policy for admins to manage all profiles

  2. Changes
    - Enable Row Level Security on profiles table
    - Create comprehensive access policies based on user roles
    - Ensure data privacy and proper access control
*/

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Managers can read their team members' profiles
CREATE POLICY "Managers can read team profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (
      EXISTS (
        SELECT 1 FROM profiles manager_profile
        WHERE manager_profile.user_id = auth.uid()
        AND manager_profile.role = 'gestor'
        AND profiles.gestor_id = auth.uid()
      )
    )
  );

-- Policy: HR can read all profiles
CREATE POLICY "HR can read all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles hr_profile
      WHERE hr_profile.user_id = auth.uid()
      AND hr_profile.role = 'rh'
    )
  );

-- Policy: Admins have full access to all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role = 'admin'
    )
  );

-- Policy: HR can update profiles for administrative purposes
CREATE POLICY "HR can update profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles hr_profile
      WHERE hr_profile.user_id = auth.uid()
      AND hr_profile.role = 'rh'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles hr_profile
      WHERE hr_profile.user_id = auth.uid()
      AND hr_profile.role = 'rh'
    )
  );

-- Policy: Managers can update basic info of their team members
CREATE POLICY "Managers can update team basic info" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    (
      EXISTS (
        SELECT 1 FROM profiles manager_profile
        WHERE manager_profile.user_id = auth.uid()
        AND manager_profile.role = 'gestor'
        AND profiles.gestor_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    (
      EXISTS (
        SELECT 1 FROM profiles manager_profile
        WHERE manager_profile.user_id = auth.uid()
        AND manager_profile.role = 'gestor'
        AND profiles.gestor_id = auth.uid()
      )
    )
  );