/*
  # Row Level Security Setup

  1. Enable RLS on all tables
  2. Create safe, non-recursive policies using JWT claims
  3. Avoid any policies that query the same table they protect
*/

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdi_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES (Safe, non-recursive)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team profiles" ON profiles
  FOR SELECT USING (gestor_id = auth.uid());

CREATE POLICY "HR and Admin can manage all profiles" ON profiles
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh')
  );

-- TEAMS TABLE POLICIES
CREATE POLICY "All can view teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage teams" ON teams
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role = 'admin'
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- CAREER TRACKS AND STAGES POLICIES
CREATE POLICY "All can view career tracks" ON career_tracks
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage career tracks" ON career_tracks
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role = 'admin'
  );

CREATE POLICY "All can view career stages" ON career_stages
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage career stages" ON career_stages
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role = 'admin'
  );

-- COMPETENCIES POLICIES
CREATE POLICY "All can view competencies" ON competencies
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage competencies" ON competencies
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role = 'admin'
  );

-- ASSESSMENTS POLICIES
CREATE POLICY "Users can view related assessments" ON assessments
  FOR SELECT USING (
    avaliado_id = auth.uid() OR 
    avaliador_id = auth.uid() OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh')
  );

CREATE POLICY "Users can create assessments" ON assessments
  FOR INSERT WITH CHECK (
    avaliador_id = auth.uid() AND
    (avaliado_id = auth.uid() OR 
     (auth.jwt() ->> 'app_role')::user_role IN ('gestor', 'admin', 'rh'))
  );

CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE USING (avaliador_id = auth.uid());

-- PDI OBJECTIVES POLICIES
CREATE POLICY "Users can view related objectives" ON pdi_objectives
  FOR SELECT USING (
    colaborador_id = auth.uid() OR 
    mentor_id = auth.uid() OR 
    created_by = auth.uid() OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh', 'gestor')
  );

CREATE POLICY "Users can create objectives" ON pdi_objectives
  FOR INSERT WITH CHECK (
    colaborador_id = auth.uid() OR 
    created_by = auth.uid() OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh', 'gestor')
  );

CREATE POLICY "Users can update related objectives" ON pdi_objectives
  FOR UPDATE USING (
    colaborador_id = auth.uid() OR 
    created_by = auth.uid() OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh', 'gestor')
  );

-- PDI COMMENTS POLICIES
CREATE POLICY "Users can view objective comments" ON pdi_comments
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pdi_objectives 
      WHERE id = objective_id AND 
      (colaborador_id = auth.uid() OR mentor_id = auth.uid() OR created_by = auth.uid())
    ) OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh', 'gestor')
  );

CREATE POLICY "Users can create comments" ON pdi_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON pdi_comments
  FOR DELETE USING (user_id = auth.uid());

-- HR RECORDS POLICIES
CREATE POLICY "HR can manage all records" ON hr_records
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role = 'rh'
  );

CREATE POLICY "Users can view own records" ON hr_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own records" ON hr_records
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND created_by = auth.uid()
  );

-- HR TESTS POLICIES
CREATE POLICY "HR can manage all tests" ON hr_tests
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role = 'rh'
  );

CREATE POLICY "Users can view own tests" ON hr_tests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own tests" ON hr_tests
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND solicitado_por = auth.uid()
  );

CREATE POLICY "Users can update own tests" ON hr_tests
  FOR UPDATE USING (user_id = auth.uid());

-- ACTION GROUPS POLICIES
CREATE POLICY "Members can view groups" ON action_groups
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM action_group_members 
      WHERE group_id = id AND user_id = auth.uid()
    ) OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'gestor')
  );

CREATE POLICY "Users can create groups" ON action_groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators can manage groups" ON action_groups
  FOR UPDATE USING (
    created_by = auth.uid() OR
    (auth.jwt() ->> 'app_role')::user_role = 'admin'
  );

-- ACTION GROUP MEMBERS POLICIES
CREATE POLICY "Members can view group membership" ON action_group_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = group_id AND created_by = auth.uid()
    ) OR
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'gestor')
  );

CREATE POLICY "Group creators can manage members" ON action_group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = group_id AND created_by = auth.uid()
    ) OR
    (auth.jwt() ->> 'app_role')::user_role = 'admin'
  );

CREATE POLICY "Users can join groups" ON action_group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ACHIEVEMENTS POLICIES
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "HR and Admin can manage achievements" ON achievements
  FOR ALL USING (
    (auth.jwt() ->> 'app_role')::user_role IN ('admin', 'rh')
  );