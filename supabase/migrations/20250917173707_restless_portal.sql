/*
  # Helper Functions and Triggers

  1. Achievement system with automatic triggers
  2. Dashboard statistics functions
  3. Utility functions for the application
*/

-- =============================================
-- ACHIEVEMENT SYSTEM
-- =============================================

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_titulo text,
  p_descricao text,
  p_icone text DEFAULT '🏆',
  p_objetivo_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user already has this achievement
  IF NOT EXISTS (
    SELECT 1 FROM achievements 
    WHERE user_id = p_user_id AND titulo = p_titulo
  ) THEN
    INSERT INTO achievements (user_id, titulo, descricao, icone, objetivo_id)
    VALUES (p_user_id, p_titulo, p_descricao, p_icone, p_objetivo_id);
  END IF;
END;
$$;

-- Trigger function for PDI objective completion
CREATE OR REPLACE FUNCTION check_pdi_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_count integer;
BEGIN
  -- Check if objective was completed
  IF NEW.objetivo_status = 'concluido' AND OLD.objetivo_status != 'concluido' THEN
    
    -- Award completion achievement
    PERFORM award_achievement(
      NEW.colaborador_id,
      'Objetivo Concluído',
      'Completou um objetivo de desenvolvimento pessoal',
      '✅',
      NEW.id
    );
    
    -- Count total completed objectives
    SELECT COUNT(*) INTO completed_count
    FROM pdi_objectives
    WHERE colaborador_id = NEW.colaborador_id 
    AND objetivo_status = 'concluido';
    
    -- Award milestone achievements
    IF completed_count = 5 THEN
      PERFORM award_achievement(
        NEW.colaborador_id,
        'Aprendiz Dedicado',
        'Completou 5 objetivos de desenvolvimento',
        '🎓'
      );
    ELSIF completed_count = 10 THEN
      PERFORM award_achievement(
        NEW.colaborador_id,
        'Mestre do PDI',
        'Completou 10 objetivos de desenvolvimento',
        '🏆'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for PDI achievements
DROP TRIGGER IF EXISTS pdi_achievement_trigger ON pdi_objectives;
CREATE TRIGGER pdi_achievement_trigger
  AFTER UPDATE ON pdi_objectives
  FOR EACH ROW
  EXECUTE FUNCTION check_pdi_achievements();

-- Trigger function for assessment achievements
CREATE OR REPLACE FUNCTION check_assessment_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  high_scores_count integer;
BEGIN
  -- Check for high scores (9+ rating)
  IF NEW.nota >= 9 AND NEW.tipo = 'manager' THEN
    PERFORM award_achievement(
      NEW.avaliado_id,
      'Excelência Reconhecida',
      'Recebeu avaliação 9+ do gestor em uma competência',
      '⭐'
    );
    
    -- Count total high scores
    SELECT COUNT(*) INTO high_scores_count
    FROM assessments
    WHERE avaliado_id = NEW.avaliado_id 
    AND tipo = 'manager'
    AND nota >= 9;
    
    -- Award expertise achievement
    IF high_scores_count >= 5 THEN
      PERFORM award_achievement(
        NEW.avaliado_id,
        'Especialista',
        'Alcançou excelência em 5 competências',
        '🚀'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for assessment achievements
DROP TRIGGER IF EXISTS assessment_achievement_trigger ON assessments;
CREATE TRIGGER assessment_achievement_trigger
  AFTER INSERT OR UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION check_assessment_achievements();

-- =============================================
-- DASHBOARD STATISTICS FUNCTIONS
-- =============================================

-- Get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_role text;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM profiles WHERE user_id = p_user_id;
  
  CASE user_role
    WHEN 'colaborador' THEN
      SELECT jsonb_build_object(
        'active_objectives', (
          SELECT COUNT(*) FROM pdi_objectives 
          WHERE colaborador_id = p_user_id 
          AND objetivo_status IN ('pendente', 'em_andamento')
        ),
        'achievements', (
          SELECT COUNT(*) FROM achievements WHERE user_id = p_user_id
        ),
        'pdi_progress', (
          SELECT COALESCE(
            ROUND(
              (COUNT(*) FILTER (WHERE objetivo_status = 'concluido')::decimal / 
               NULLIF(COUNT(*), 0)) * 100
            ), 0
          )
          FROM pdi_objectives WHERE colaborador_id = p_user_id
        ),
        'competencies_assessed', (
          SELECT COUNT(DISTINCT competency_id) 
          FROM assessments 
          WHERE avaliado_id = p_user_id
        )
      ) INTO result;
      
    WHEN 'gestor' THEN
      SELECT jsonb_build_object(
        'team_members', (
          SELECT COUNT(*) FROM profiles WHERE gestor_id = p_user_id
        ),
        'pending_assessments', (
          SELECT COUNT(*) FROM assessments a
          JOIN profiles p ON p.user_id = a.avaliado_id
          WHERE p.gestor_id = p_user_id AND a.tipo = 'manager' AND a.nota IS NULL
        ),
        'approved_pdis', (
          SELECT COUNT(*) FROM pdi_objectives po
          JOIN profiles p ON p.user_id = po.colaborador_id
          WHERE p.gestor_id = p_user_id AND po.status = 'aprovado'
        ),
        'team_achievements', (
          SELECT COUNT(*) FROM achievements a
          JOIN profiles p ON p.user_id = a.user_id
          WHERE p.gestor_id = p_user_id
        )
      ) INTO result;
      
    WHEN 'rh' THEN
      SELECT jsonb_build_object(
        'scheduled_appointments', (
          SELECT COUNT(*) FROM hr_records 
          WHERE tipo = 'sessao' AND data_sessao >= CURRENT_DATE
        ),
        'active_followups', (
          SELECT COUNT(*) FROM hr_records 
          WHERE tipo = 'acompanhamento' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        'pending_tests', (
          SELECT COUNT(*) FROM hr_tests WHERE realizado_em IS NULL
        ),
        'total_employees', (
          SELECT COUNT(*) FROM profiles WHERE status = 'ativo'
        )
      ) INTO result;
      
    WHEN 'admin' THEN
      SELECT jsonb_build_object(
        'active_users', (
          SELECT COUNT(*) FROM profiles WHERE status = 'ativo'
        ),
        'active_tracks', (
          SELECT COUNT(*) FROM career_tracks
        ),
        'completed_assessments', (
          SELECT COUNT(*) FROM assessments WHERE nota IS NOT NULL
        ),
        'active_groups', (
          SELECT COUNT(*) FROM action_groups WHERE status = 'ativo'
        )
      ) INTO result;
      
    ELSE
      result := '{}'::jsonb;
  END CASE;
  
  RETURN result;
END;
$$;

-- Get competency progress for user
CREATE OR REPLACE FUNCTION get_competency_progress(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_track_id uuid;
BEGIN
  -- Get user's career track
  SELECT trilha_id INTO user_track_id FROM profiles WHERE user_id = p_user_id;
  
  IF user_track_id IS NULL THEN
    RETURN '{"error": "No career track assigned"}'::jsonb;
  END IF;
  
  -- Get competency progress by area
  SELECT jsonb_agg(
    jsonb_build_object(
      'area', cs.nome,
      'total_competencies', comp_stats.total,
      'assessed_competencies', comp_stats.assessed,
      'high_scores', comp_stats.high_scores,
      'progress_percentage', 
        CASE 
          WHEN comp_stats.total > 0 THEN 
            ROUND((comp_stats.assessed::decimal / comp_stats.total) * 100)
          ELSE 0 
        END
    )
  ) INTO result
  FROM career_stages cs
  LEFT JOIN (
    SELECT 
      c.stage_id,
      COUNT(*) as total,
      COUNT(a.id) as assessed,
      COUNT(*) FILTER (WHERE a.nota >= 7) as high_scores
    FROM competencies c
    LEFT JOIN assessments a ON a.competency_id = c.id 
      AND a.avaliado_id = p_user_id 
      AND a.tipo = 'manager'
    GROUP BY c.stage_id
  ) comp_stats ON comp_stats.stage_id = cs.id
  WHERE cs.trilha_id = user_track_id;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get user's current career stage
CREATE OR REPLACE FUNCTION get_user_current_stage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  user_track_id uuid;
BEGIN
  -- Get user's career track
  SELECT trilha_id INTO user_track_id FROM profiles WHERE user_id = p_user_id;
  
  IF user_track_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- For now, return the first stage (in a real system, this would be based on assessments)
  SELECT jsonb_build_object(
    'id', cs.id,
    'name', cs.nome,
    'order', cs.ordem,
    'phase', cs.etapa,
    'salary_min', cs.salario_min,
    'salary_max', cs.salario_max,
    'flexible_salary', cs.flexivel_salario
  ) INTO result
  FROM career_stages cs
  WHERE cs.trilha_id = user_track_id
  ORDER BY cs.ordem
  LIMIT 1;
  
  RETURN result;
END;
$$;

-- Function to check if user can access another user's data
CREATE OR REPLACE FUNCTION can_access_user_data(p_accessor_id uuid, p_target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  accessor_role text;
BEGIN
  -- Get accessor's role
  SELECT role INTO accessor_role FROM profiles WHERE user_id = p_accessor_id;
  
  -- Admin and HR can access anyone's data
  IF accessor_role IN ('admin', 'rh') THEN
    RETURN true;
  END IF;
  
  -- Users can access their own data
  IF p_accessor_id = p_target_id THEN
    RETURN true;
  END IF;
  
  -- Managers can access their direct reports' data
  IF accessor_role = 'gestor' AND EXISTS (
    SELECT 1 FROM profiles WHERE user_id = p_target_id AND gestor_id = p_accessor_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;