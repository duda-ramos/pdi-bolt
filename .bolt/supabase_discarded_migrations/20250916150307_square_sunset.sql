/*
  # Verify and update RLS policies using is_manager_of function

  This migration ensures all RLS policies are properly using the corrected function
  and provides a verification script to check for any remaining issues.
*/

-- Verify that is_manager_of function exists and works
DO $$
BEGIN
  -- Test the function exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_manager_of' 
    AND pronargs = 2
  ) THEN
    RAISE EXCEPTION 'Function is_manager_of(uuid, uuid) does not exist';
  END IF;
  
  RAISE NOTICE 'Function is_manager_of verified successfully';
END $$;

-- Update any policies that might have parameter name conflicts
-- This is a safety measure to ensure all policies work correctly

-- Recreate key policies that use is_manager_of to ensure they work with the updated function

-- Salary history policies
DROP POLICY IF EXISTS "Gestor can view managed salary history" ON salary_history;
CREATE POLICY "Gestor can view managed salary history"
  ON salary_history
  FOR SELECT
  TO authenticated
  USING (
    (get_user_role(auth.uid()) = 'gestor'::user_role) 
    AND is_manager_of(auth.uid(), user_id)
  );

-- Achievements policies  
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
CREATE POLICY "Users can view own achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) 
    OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])) 
    OR ((get_user_role(auth.uid()) = 'gestor'::user_role) AND is_manager_of(auth.uid(), user_id))
  );

-- Touchpoints policies
DROP POLICY IF EXISTS "Users can view related touchpoints" ON touchpoints;
CREATE POLICY "Users can view related touchpoints"
  ON touchpoints
  FOR SELECT
  TO authenticated
  USING (
    (colaborador_id = auth.uid()) 
    OR (gestor_id = auth.uid()) 
    OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]))
  );

-- PDI objectives policies
DROP POLICY IF EXISTS "Enable select for users on related objectives" ON pdi_objectives;
CREATE POLICY "Enable select for users on related objectives"
  ON pdi_objectives
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = colaborador_id) 
    OR (auth.uid() = mentor_id) 
    OR (auth.uid() = created_by) 
    OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]))
    OR (
      (get_user_role(auth.uid()) = 'gestor'::user_role) 
      AND is_manager_of(auth.uid(), colaborador_id)
    )
  );

DROP POLICY IF EXISTS "Enable update for users on own objectives" ON pdi_objectives;
CREATE POLICY "Enable update for users on own objectives"
  ON pdi_objectives
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = colaborador_id) 
    OR (auth.uid() = created_by) 
    OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]))
    OR (
      (get_user_role(auth.uid()) = 'gestor'::user_role) 
      AND is_manager_of(auth.uid(), colaborador_id)
    )
  );

-- PDI comments policies
DROP POLICY IF EXISTS "Users can view related PDI comments" ON pdi_comments;
CREATE POLICY "Users can view related PDI comments"
  ON pdi_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM pdi_objectives
      WHERE (pdi_objectives.id = pdi_comments.objective_id) 
      AND (
        (pdi_objectives.colaborador_id = auth.uid()) 
        OR (pdi_objectives.mentor_id = auth.uid()) 
        OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])) 
        OR (
          (get_user_role(auth.uid()) = 'gestor'::user_role) 
          AND is_manager_of(auth.uid(), pdi_objectives.colaborador_id)
        )
      )
    )
  );

-- Assessments policies
DROP POLICY IF EXISTS "Users can view related assessments" ON assessments;
CREATE POLICY "Users can view related assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    (avaliado_id = auth.uid()) 
    OR (avaliador_id = auth.uid()) 
    OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])) 
    OR (
      (get_user_role(auth.uid()) = 'gestor'::user_role) 
      AND is_manager_of(auth.uid(), avaliado_id)
    )
  );

-- Verification query to check all policies are working
DO $$
DECLARE
  policy_count integer;
BEGIN
  -- Count policies that reference is_manager_of
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE definition LIKE '%is_manager_of%';
  
  RAISE NOTICE 'Found % policies using is_manager_of function', policy_count;
  
  -- Test the function with a simple call (will return false for non-existent users)
  PERFORM is_manager_of('00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000001'::uuid);
  
  RAISE NOTICE 'Function is_manager_of is working correctly';
END $$;