/*
  # Create Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `nome` (text, user's full name)
      - `email` (text, user's email)
      - `role` (enum, user role: admin, rh, gestor, colaborador)
      - `status` (enum, user status: ativo, inativo)
      - `data_admissao` (date, admission date)
      - `data_desligamento` (date, termination date)
      - `time_id` (uuid, team reference)
      - `gestor_id` (uuid, manager reference)
      - `bio` (text, user biography)
      - `localizacao` (text, user location)
      - `formacao` (text, user education)
      - `trilha_id` (uuid, career track reference)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for user access control
    - Users can read/update their own profile
    - Managers can read their team members' profiles
    - HR and Admin have broader access
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'rh', 'gestor', 'colaborador');
CREATE TYPE user_status AS ENUM ('ativo', 'inativo');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  role user_role DEFAULT 'colaborador' NOT NULL,
  status user_status DEFAULT 'ativo' NOT NULL,
  data_admissao date DEFAULT CURRENT_DATE,
  data_desligamento date,
  time_id uuid,
  gestor_id uuid REFERENCES auth.users(id),
  bio text,
  localizacao text,
  formacao text,
  trilha_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);
CREATE INDEX IF NOT EXISTS profiles_gestor_id_idx ON profiles(gestor_id);
CREATE INDEX IF NOT EXISTS profiles_time_id_idx ON profiles(time_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies using JWT claims to avoid recursion
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view team profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    gestor_id = auth.uid() OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh')
  );

CREATE POLICY "HR and Admin can manage profiles"
  ON profiles FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh'))
  WITH CHECK ((auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh'));

CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);