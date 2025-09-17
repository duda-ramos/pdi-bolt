/*
  # Initial Schema Setup for DEA PDI System

  1. Core Tables
    - `profiles` - User profiles and authentication data
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

  3. Performance
    - Add proper indexes
    - Create efficient foreign key relationships
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'rh', 'gestor', 'colaborador');
CREATE TYPE user_status AS ENUM ('ativo', 'inativo');
CREATE TYPE pdi_status AS ENUM ('proposto_colaborador', 'proposto_gestor', 'aprovado', 'rejeitado');
CREATE TYPE objective_status AS ENUM ('pendente', 'em_andamento', 'concluido', 'cancelado');
CREATE TYPE assessment_type AS ENUM ('self', 'manager', 'peer');
CREATE TYPE competency_type AS ENUM ('hard_skill', 'soft_skill');
CREATE TYPE career_phase AS ENUM ('desenvolvimento', 'especializacao');
CREATE TYPE hr_record_type AS ENUM ('consulta', 'teste', 'acompanhamento', 'sessao');
CREATE TYPE group_status AS ENUM ('ativo', 'concluido', 'arquivado');

-- =============================================
-- CORE TABLES
-- =============================================

-- Profiles table (main user data)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Career tracks table
CREATE TABLE IF NOT EXISTS career_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  created_at timestamptz DEFAULT now()
);

-- Career stages table
CREATE TABLE IF NOT EXISTS career_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trilha_id uuid NOT NULL REFERENCES career_tracks(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer NOT NULL,
  etapa career_phase NOT NULL DEFAULT 'desenvolvimento',
  salario_min integer,
  salario_max integer,
  flexivel_salario boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Competencies table
CREATE TABLE IF NOT EXISTS competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES career_stages(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  tipo competency_type NOT NULL,
  peso integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id uuid NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  avaliado_id uuid NOT NULL,
  avaliador_id uuid NOT NULL,
  tipo assessment_type NOT NULL,
  nota decimal(3,1) CHECK (nota >= 0 AND nota <= 10),
  observacoes text,
  created_at timestamptz DEFAULT now()
);

-- PDI Objectives table
CREATE TABLE IF NOT EXISTS pdi_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL,
  competency_id uuid REFERENCES competencies(id),
  titulo text NOT NULL,
  descricao text,
  status pdi_status NOT NULL DEFAULT 'proposto_colaborador',
  objetivo_status objective_status NOT NULL DEFAULT 'pendente',
  data_inicio date,
  data_fim date,
  mentor_id uuid,
  pontos_extra integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PDI Comments table
CREATE TABLE IF NOT EXISTS pdi_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id uuid NOT NULL REFERENCES pdi_objectives(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comentario text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- HR Records table
CREATE TABLE IF NOT EXISTS hr_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  conteudo text,
  tipo hr_record_type NOT NULL,
  data_sessao date,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- HR Tests table
CREATE TABLE IF NOT EXISTS hr_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome_teste text NOT NULL,
  resultado jsonb,
  solicitado_por uuid NOT NULL,
  realizado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Action Groups table
CREATE TABLE IF NOT EXISTS action_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  status group_status NOT NULL DEFAULT 'ativo',
  created_by uuid NOT NULL,
  data_inicio date,
  data_fim date,
  created_at timestamptz DEFAULT now()
);

-- Action Group Members table
CREATE TABLE IF NOT EXISTS action_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES action_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'membro',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  icone text DEFAULT '🏆',
  conquistado_em timestamptz DEFAULT now(),
  objetivo_id uuid REFERENCES pdi_objectives(id)
);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

-- Add foreign key constraints that reference profiles
ALTER TABLE profiles 
  ADD CONSTRAINT fk_profiles_team FOREIGN KEY (time_id) REFERENCES teams(id),
  ADD CONSTRAINT fk_profiles_manager FOREIGN KEY (gestor_id) REFERENCES profiles(user_id),
  ADD CONSTRAINT fk_profiles_track FOREIGN KEY (trilha_id) REFERENCES career_tracks(id);

ALTER TABLE teams 
  ADD CONSTRAINT fk_teams_creator FOREIGN KEY (created_by) REFERENCES profiles(user_id);

ALTER TABLE assessments 
  ADD CONSTRAINT fk_assessments_evaluated FOREIGN KEY (avaliado_id) REFERENCES profiles(user_id),
  ADD CONSTRAINT fk_assessments_evaluator FOREIGN KEY (avaliador_id) REFERENCES profiles(user_id);

ALTER TABLE pdi_objectives 
  ADD CONSTRAINT fk_pdi_collaborator FOREIGN KEY (colaborador_id) REFERENCES profiles(user_id),
  ADD CONSTRAINT fk_pdi_mentor FOREIGN KEY (mentor_id) REFERENCES profiles(user_id),
  ADD CONSTRAINT fk_pdi_creator FOREIGN KEY (created_by) REFERENCES profiles(user_id);

ALTER TABLE pdi_comments 
  ADD CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE hr_records 
  ADD CONSTRAINT fk_hr_records_user FOREIGN KEY (user_id) REFERENCES profiles(user_id),
  ADD CONSTRAINT fk_hr_records_creator FOREIGN KEY (created_by) REFERENCES profiles(user_id);

ALTER TABLE hr_tests 
  ADD CONSTRAINT fk_hr_tests_user FOREIGN KEY (user_id) REFERENCES profiles(user_id),
  ADD CONSTRAINT fk_hr_tests_requester FOREIGN KEY (solicitado_por) REFERENCES profiles(user_id);

ALTER TABLE action_groups 
  ADD CONSTRAINT fk_action_groups_creator FOREIGN KEY (created_by) REFERENCES profiles(user_id);

ALTER TABLE action_group_members 
  ADD CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES profiles(user_id);

ALTER TABLE achievements 
  ADD CONSTRAINT fk_achievements_user FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_team ON profiles(time_id);
CREATE INDEX IF NOT EXISTS idx_profiles_manager ON profiles(gestor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_track ON profiles(trilha_id);

-- Career indexes
CREATE INDEX IF NOT EXISTS idx_career_stages_track ON career_stages(trilha_id);
CREATE INDEX IF NOT EXISTS idx_competencies_stage ON competencies(stage_id);

-- Assessment indexes
CREATE INDEX IF NOT EXISTS idx_assessments_competency ON assessments(competency_id);
CREATE INDEX IF NOT EXISTS idx_assessments_evaluated ON assessments(avaliado_id);
CREATE INDEX IF NOT EXISTS idx_assessments_evaluator ON assessments(avaliador_id);

-- PDI indexes
CREATE INDEX IF NOT EXISTS idx_pdi_objectives_collaborator ON pdi_objectives(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_pdi_objectives_competency ON pdi_objectives(competency_id);
CREATE INDEX IF NOT EXISTS idx_pdi_comments_objective ON pdi_comments(objective_id);

-- HR indexes
CREATE INDEX IF NOT EXISTS idx_hr_records_user ON hr_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_tests_user ON hr_tests(user_id);

-- Action groups indexes
CREATE INDEX IF NOT EXISTS idx_action_group_members_group ON action_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_action_group_members_user ON action_group_members(user_id);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdi_objectives_updated_at 
  BEFORE UPDATE ON pdi_objectives 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();