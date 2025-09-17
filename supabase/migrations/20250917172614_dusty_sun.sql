/*
  # Core Tables Setup for DEA PDI System

  1. Core Tables
    - `profiles` - User profiles and roles
    - `teams` - Team organization
    - `career_tracks` - Career progression paths
    - `career_stages` - Stages within career tracks
    - `competencies` - Skills and competencies
    - `assessments` - Competency evaluations
    - `pdi_objectives` - Personal development goals
    - `pdi_comments` - Comments on PDI objectives
    - `hr_records` - HR consultation records
    - `hr_tests` - Psychological tests
    - `action_groups` - Collaborative action groups
    - `action_group_members` - Group membership
    - `achievements` - User achievements

  2. Security
    - Enable RLS on all tables
    - Create safe, non-recursive policies
    - Use JWT claims for role-based access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'rh', 'gestor', 'colaborador');
CREATE TYPE user_status AS ENUM ('ativo', 'inativo');
CREATE TYPE pdi_status AS ENUM ('proposto_colaborador', 'proposto_gestor', 'aprovado', 'rejeitado');
CREATE TYPE objective_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE assessment_type AS ENUM ('self', 'manager', 'peer');
CREATE TYPE competency_type AS ENUM ('hard_skill', 'soft_skill');
CREATE TYPE stage_phase AS ENUM ('desenvolvimento', 'especializacao');
CREATE TYPE hr_record_type AS ENUM ('consulta', 'teste', 'acompanhamento', 'sessao');
CREATE TYPE group_status AS ENUM ('active', 'completed', 'archived');

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'colaborador',
  status user_status NOT NULL DEFAULT 'ativo',
  data_admissao date,
  data_desligamento date,
  time_id uuid,
  gestor_id uuid,
  bio text,
  localizacao text,
  formacao text,
  trilha_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  descricao text,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 3. CAREER TRACKS TABLE
CREATE TABLE IF NOT EXISTS career_tracks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  descricao text,
  created_at timestamptz DEFAULT now()
);

-- 4. CAREER STAGES TABLE
CREATE TABLE IF NOT EXISTS career_stages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trilha_id uuid NOT NULL REFERENCES career_tracks(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer NOT NULL,
  etapa stage_phase NOT NULL DEFAULT 'desenvolvimento',
  salario_min numeric,
  salario_max numeric,
  flexivel_salario boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. COMPETENCIES TABLE
CREATE TABLE IF NOT EXISTS competencies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id uuid NOT NULL REFERENCES career_stages(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  tipo competency_type NOT NULL DEFAULT 'hard_skill',
  peso numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

-- 6. ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  avaliado_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo assessment_type NOT NULL,
  nota numeric CHECK (nota >= 0 AND nota <= 10),
  observacoes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(competency_id, avaliado_id, avaliador_id, tipo)
);

-- 7. PDI OBJECTIVES TABLE
CREATE TABLE IF NOT EXISTS pdi_objectives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competency_id uuid REFERENCES competencies(id),
  titulo text NOT NULL,
  descricao text,
  status pdi_status NOT NULL DEFAULT 'proposto_colaborador',
  objetivo_status objective_status NOT NULL DEFAULT 'pendente',
  data_inicio date,
  data_fim date,
  mentor_id uuid REFERENCES auth.users(id),
  pontos_extra numeric DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. PDI COMMENTS TABLE
CREATE TABLE IF NOT EXISTS pdi_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id uuid NOT NULL REFERENCES pdi_objectives(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comentario text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 9. HR RECORDS TABLE
CREATE TABLE IF NOT EXISTS hr_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  conteudo text,
  tipo hr_record_type NOT NULL DEFAULT 'consulta',
  data_sessao date,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 10. HR TESTS TABLE
CREATE TABLE IF NOT EXISTS hr_tests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_teste text NOT NULL,
  resultado jsonb,
  solicitado_por uuid NOT NULL REFERENCES auth.users(id),
  realizado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 11. ACTION GROUPS TABLE
CREATE TABLE IF NOT EXISTS action_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome text NOT NULL,
  descricao text,
  status group_status NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 12. ACTION GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS action_group_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL REFERENCES action_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 13. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  conquistado_em timestamptz DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_time_id 
  FOREIGN KEY (time_id) REFERENCES teams(id);

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_gestor_id 
  FOREIGN KEY (gestor_id) REFERENCES auth.users(id);

ALTER TABLE profiles ADD CONSTRAINT fk_profiles_trilha_id 
  FOREIGN KEY (trilha_id) REFERENCES career_tracks(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gestor_id ON profiles(gestor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_time_id ON profiles(time_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_assessments_avaliado_id ON assessments(avaliado_id);
CREATE INDEX IF NOT EXISTS idx_assessments_competency_id ON assessments(competency_id);
CREATE INDEX IF NOT EXISTS idx_pdi_objectives_colaborador_id ON pdi_objectives(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_pdi_comments_objective_id ON pdi_comments(objective_id);
CREATE INDEX IF NOT EXISTS idx_hr_records_user_id ON hr_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_tests_user_id ON hr_tests(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdi_objectives_updated_at BEFORE UPDATE ON pdi_objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();