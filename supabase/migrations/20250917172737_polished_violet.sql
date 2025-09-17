/*
  # Helper Functions for DEA PDI System

  1. Functions to support application logic
  2. Safe functions that don't cause RLS recursion
  3. Utility functions for data processing
*/

-- Function to check if user is manager of another user (using direct foreign key)
CREATE OR REPLACE FUNCTION is_manager_of(manager_uuid uuid, employee_uuid uuid)
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
    WHERE user_id = employee_uuid 
    AND gestor_id = manager_uuid
  );
END;
$$;

-- Function to get user's current career stage
CREATE OR REPLACE FUNCTION get_user_current_stage(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_track_id uuid;
  first_stage_id uuid;
BEGIN
  -- Get user's career track
  SELECT trilha_id INTO user_track_id
  FROM profiles 
  WHERE user_id = user_uuid;
  
  -- If no track assigned, return null
  IF user_track_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get first stage of the track (for now, assume user is at first stage)
  SELECT id INTO first_stage_id
  FROM career_stages 
  WHERE trilha_id = user_track_id 
  ORDER BY ordem ASC 
  LIMIT 1;
  
  RETURN first_stage_id;
END;
$$;

-- Function to calculate competency progress for a user
CREATE OR REPLACE FUNCTION calculate_competency_progress(user_uuid uuid, competency_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  self_score numeric := 0;
  manager_score numeric := 0;
  result jsonb;
BEGIN
  -- Get self assessment score
  SELECT COALESCE(nota, 0) INTO self_score
  FROM assessments 
  WHERE competency_id = competency_uuid 
    AND avaliado_id = user_uuid 
    AND tipo = 'self'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Get manager assessment score
  SELECT COALESCE(nota, 0) INTO manager_score
  FROM assessments 
  WHERE competency_id = competency_uuid 
    AND avaliado_id = user_uuid 
    AND tipo = 'manager'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Build result
  result := jsonb_build_object(
    'self_score', self_score,
    'manager_score', manager_score,
    'divergence', self_score - manager_score,
    'has_assessments', (self_score > 0 OR manager_score > 0)
  );
  
  RETURN result;
END;
$$;

-- Function to get user statistics for dashboard
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_role_val user_role;
  stats jsonb;
  objectives_count integer := 0;
  achievements_count integer := 0;
  assessments_count integer := 0;
  team_members_count integer := 0;
BEGIN
  -- Get user role from JWT or profiles table
  SELECT role INTO user_role_val
  FROM profiles 
  WHERE user_id = user_uuid;
  
  -- Count PDI objectives
  SELECT COUNT(*) INTO objectives_count
  FROM pdi_objectives 
  WHERE colaborador_id = user_uuid 
    AND objetivo_status IN ('pendente', 'em_andamento');
  
  -- Count achievements
  SELECT COUNT(*) INTO achievements_count
  FROM achievements 
  WHERE user_id = user_uuid;
  
  -- Count completed assessments
  SELECT COUNT(DISTINCT competency_id) INTO assessments_count
  FROM assessments 
  WHERE avaliado_id = user_uuid;
  
  -- If manager, count team members
  IF user_role_val = 'gestor' THEN
    SELECT COUNT(*) INTO team_members_count
    FROM profiles 
    WHERE gestor_id = user_uuid;
  END IF;
  
  -- Build stats object
  stats := jsonb_build_object(
    'role', user_role_val,
    'objectives_count', objectives_count,
    'achievements_count', achievements_count,
    'assessments_count', assessments_count,
    'team_members_count', team_members_count
  );
  
  RETURN stats;
END;
$$;

-- Function to create automatic achievements
CREATE OR REPLACE FUNCTION check_and_create_achievements(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completed_objectives integer;
  completed_assessments integer;
BEGIN
  -- Count completed PDI objectives
  SELECT COUNT(*) INTO completed_objectives
  FROM pdi_objectives 
  WHERE colaborador_id = user_uuid 
    AND objetivo_status = 'concluido';
  
  -- Count completed assessments
  SELECT COUNT(DISTINCT competency_id) INTO completed_assessments
  FROM assessments 
  WHERE avaliado_id = user_uuid 
    AND nota >= 7;
  
  -- Achievement: First PDI objective completed
  IF completed_objectives >= 1 THEN
    INSERT INTO achievements (user_id, titulo, descricao)
    SELECT user_uuid, 'Primeiro Objetivo', 'Completou seu primeiro objetivo PDI'
    WHERE NOT EXISTS (
      SELECT 1 FROM achievements 
      WHERE user_id = user_uuid AND titulo = 'Primeiro Objetivo'
    );
  END IF;
  
  -- Achievement: 5 objectives completed
  IF completed_objectives >= 5 THEN
    INSERT INTO achievements (user_id, titulo, descricao)
    SELECT user_uuid, 'Aprendiz Dedicado', 'Completou 5 objetivos de desenvolvimento'
    WHERE NOT EXISTS (
      SELECT 1 FROM achievements 
      WHERE user_id = user_uuid AND titulo = 'Aprendiz Dedicado'
    );
  END IF;
  
  -- Achievement: High competency scores
  IF completed_assessments >= 3 THEN
    INSERT INTO achievements (user_id, titulo, descricao)
    SELECT user_uuid, 'Competente', 'Alcançou nota alta em 3 competências'
    WHERE NOT EXISTS (
      SELECT 1 FROM achievements 
      WHERE user_id = user_uuid AND titulo = 'Competente'
    );
  END IF;
END;
$$;

-- Trigger to automatically check achievements when PDI objectives are completed
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.objetivo_status = 'concluido' AND OLD.objetivo_status != 'concluido' THEN
    PERFORM check_and_create_achievements(NEW.colaborador_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pdi_objectives_achievement_trigger
  AFTER UPDATE ON pdi_objectives
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements();

-- Trigger to check achievements when assessments are created/updated
CREATE OR REPLACE FUNCTION trigger_check_achievements_assessment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_create_achievements(NEW.avaliado_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessments_achievement_trigger
  AFTER INSERT OR UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_achievements_assessment();