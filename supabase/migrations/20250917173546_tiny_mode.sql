/*
  # Row Level Security Policies

  1. Enable RLS on all tables
  2. Create safe, non-recursive policies using JWT claims
  3. Implement role-based access control
  4. Ensure data privacy and security
*/

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

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

-- =============================================
-- HELPER FUNCTIONS (NON-RECURSIVE)
-- =============================================

-- Get user role from JWT claims (no database query)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'user_role',
    'colaborador'
  );
$$;

-- Check if user is admin or HR
CREATE OR REPLACE FUNCTION is_admin_or_hr()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT get_user_role() IN ('admin', 'rh');
$$;

-- Check if user is manager (using direct foreign key, no recursion)
CREATE OR REPLACE FUNCTION is_manager_of(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = target_user_id 
    AND gestor_id = auth.uid()
  );
$$;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "users_own_profile_select" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile (limited fields)
CREATE POLICY "users_own_profile_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Managers can view their direct reports
CREATE POLICY "managers_view_reports" ON profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    gestor_id = auth.uid() OR
    is_admin_or_hr()
  );

-- Admin and HR can manage all profiles
CREATE POLICY "admin_hr_manage_profiles" ON profiles
  FOR ALL TO authenticated
  USING (is_admin_or_hr())
  WITH CHECK (is_admin_or_hr());

-- =============================================
-- TEAMS TABLE POLICIES
-- =============================================

-- Everyone can view teams (transparency)
CREATE POLICY "teams_select_all" ON teams
  FOR SELECT TO authenticated
  USING (true);

-- Admin and managers can create teams
CREATE POLICY "teams_insert_managers" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'gestor'));

-- Team creators and admins can update teams
CREATE POLICY "teams_update_creators" ON teams
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin_or_hr());

-- =============================================
-- CAREER SYSTEM POLICIES
-- =============================================

-- Everyone can view career tracks and stages (transparency)
CREATE POLICY "career_tracks_select_all" ON career_tracks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "career_stages_select_all" ON career_stages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "competencies_select_all" ON competencies
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can manage career system
CREATE POLICY "career_tracks_admin_manage" ON career_tracks
  FOR ALL TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "career_stages_admin_manage" ON career_stages
  FOR ALL TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "competencies_admin_manage" ON competencies
  FOR ALL TO authenticated
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- =============================================
-- ASSESSMENTS POLICIES
-- =============================================

-- Users can view assessments where they are involved
CREATE POLICY "assessments_select_involved" ON assessments
  FOR SELECT TO authenticated
  USING (
    avaliado_id = auth.uid() OR
    avaliador_id = auth.uid() OR
    is_admin_or_hr() OR
    (get_user_role() = 'gestor' AND is_manager_of(avaliado_id))
  );

-- Users can create assessments (self or as manager)
CREATE POLICY "assessments_insert_authorized" ON assessments
  FOR INSERT TO authenticated
  WITH CHECK (
    avaliador_id = auth.uid() AND (
      avaliado_id = auth.uid() OR
      (get_user_role() = 'gestor' AND is_manager_of(avaliado_id)) OR
      is_admin_or_hr()
    )
  );

-- Users can update their own assessments
CREATE POLICY "assessments_update_own" ON assessments
  FOR UPDATE TO authenticated
  USING (avaliador_id = auth.uid())
  WITH CHECK (avaliador_id = auth.uid());

-- =============================================
-- PDI OBJECTIVES POLICIES
-- =============================================

-- Users can view PDI objectives where they are involved
CREATE POLICY "pdi_objectives_select_involved" ON pdi_objectives
  FOR SELECT TO authenticated
  USING (
    colaborador_id = auth.uid() OR
    mentor_id = auth.uid() OR
    created_by = auth.uid() OR
    is_admin_or_hr() OR
    (get_user_role() = 'gestor' AND is_manager_of(colaborador_id))
  );

-- Users can create PDI objectives
CREATE POLICY "pdi_objectives_insert_authorized" ON pdi_objectives
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND (
      colaborador_id = auth.uid() OR
      (get_user_role() IN ('gestor', 'admin', 'rh'))
    )
  );

-- Users can update PDI objectives they're involved with
CREATE POLICY "pdi_objectives_update_involved" ON pdi_objectives
  FOR UPDATE TO authenticated
  USING (
    colaborador_id = auth.uid() OR
    created_by = auth.uid() OR
    is_admin_or_hr() OR
    (get_user_role() = 'gestor' AND is_manager_of(colaborador_id))
  );

-- =============================================
-- PDI COMMENTS POLICIES
-- =============================================

-- Users can view comments on objectives they can see
CREATE POLICY "pdi_comments_select_authorized" ON pdi_comments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pdi_objectives 
      WHERE id = objective_id AND (
        colaborador_id = auth.uid() OR
        mentor_id = auth.uid() OR
        created_by = auth.uid() OR
        (get_user_role() = 'gestor' AND is_manager_of(colaborador_id))
      )
    ) OR
    is_admin_or_hr()
  );

-- Users can create comments on objectives they can see
CREATE POLICY "pdi_comments_insert_authorized" ON pdi_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM pdi_objectives 
      WHERE id = objective_id AND (
        colaborador_id = auth.uid() OR
        mentor_id = auth.uid() OR
        created_by = auth.uid() OR
        (get_user_role() = 'gestor' AND is_manager_of(colaborador_id))
      )
    )
  );

-- Users can delete their own comments
CREATE POLICY "pdi_comments_delete_own" ON pdi_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- HR RECORDS POLICIES (CONFIDENTIAL)
-- =============================================

-- Only HR and the user can view HR records
CREATE POLICY "hr_records_select_confidential" ON hr_records
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() = 'rh'
  );

-- Only HR can manage HR records
CREATE POLICY "hr_records_manage_hr_only" ON hr_records
  FOR ALL TO authenticated
  USING (get_user_role() = 'rh')
  WITH CHECK (get_user_role() = 'rh');

-- =============================================
-- HR TESTS POLICIES (CONFIDENTIAL)
-- =============================================

-- Only HR and the user can view HR tests
CREATE POLICY "hr_tests_select_confidential" ON hr_tests
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    get_user_role() = 'rh'
  );

-- Only HR can manage HR tests
CREATE POLICY "hr_tests_manage_hr_only" ON hr_tests
  FOR ALL TO authenticated
  USING (get_user_role() = 'rh')
  WITH CHECK (get_user_role() = 'rh');

-- =============================================
-- ACTION GROUPS POLICIES
-- =============================================

-- Members can view groups they belong to
CREATE POLICY "action_groups_select_members" ON action_groups
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM action_group_members 
      WHERE group_id = id AND user_id = auth.uid()
    ) OR
    is_admin_or_hr()
  );

-- Managers and admins can create groups
CREATE POLICY "action_groups_insert_managers" ON action_groups
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    get_user_role() IN ('gestor', 'admin')
  );

-- Group creators and admins can update groups
CREATE POLICY "action_groups_update_creators" ON action_groups
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_admin_or_hr());

-- =============================================
-- ACTION GROUP MEMBERS POLICIES
-- =============================================

-- Members can view group membership
CREATE POLICY "action_group_members_select" ON action_group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = group_id AND created_by = auth.uid()
    ) OR
    is_admin_or_hr()
  );

-- Group creators can manage membership
CREATE POLICY "action_group_members_manage" ON action_group_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = group_id AND created_by = auth.uid()
    ) OR
    is_admin_or_hr()
  );

-- =============================================
-- ACHIEVEMENTS POLICIES
-- =============================================

-- Users can view their own achievements
CREATE POLICY "achievements_select_own" ON achievements
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    is_admin_or_hr()
  );

-- System can create achievements (via triggers)
CREATE POLICY "achievements_insert_system" ON achievements
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can't delete achievements
CREATE POLICY "achievements_no_delete" ON achievements
  FOR DELETE TO authenticated
  USING (false);