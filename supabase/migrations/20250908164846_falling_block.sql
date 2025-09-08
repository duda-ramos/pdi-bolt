/*
  # Correção das Políticas RLS

  1. Políticas Corrigidas
    - Remove políticas conflitantes existentes
    - Cria políticas que permitem operações corretas para usuários autenticados
    - Permite que usuários criem e gerenciem seus próprios perfis
    - Permite que admins/gestores/RH visualizem outros perfis

  2. Segurança
    - Mantém RLS habilitado em todas as tabelas
    - Políticas baseadas em auth.uid() para identificação do usuário
    - Controle de acesso baseado em roles

  3. Tabelas Afetadas
    - profiles: Políticas de CRUD para perfis de usuário
    - pdi_objectives: Políticas para objetivos PDI
*/

-- Remove políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Gestor can view managed profiles" ON profiles;
DROP POLICY IF EXISTS "Gestor can update managed profiles" ON profiles;
DROP POLICY IF EXISTS "RH can view all profiles" ON profiles;
DROP POLICY IF EXISTS "RH can update all profiles" ON profiles;

-- Cria novas políticas para a tabela profiles
CREATE POLICY "Enable insert for authenticated users creating own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users on own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users on own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for admin users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Enable select for gestor users on managed profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'gestor'
      AND (
        profiles.gestor_id = auth.uid() OR
        auth.uid() = profiles.user_id
      )
    )
  );

CREATE POLICY "Enable select for RH users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'rh'
    )
  );

CREATE POLICY "Enable update for admin users"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Enable update for gestor users on managed profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'gestor'
      AND profiles.gestor_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for RH users"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'rh'
    )
  );

-- Remove políticas existentes da tabela pdi_objectives
DROP POLICY IF EXISTS "Users can manage own PDI objectives" ON pdi_objectives;
DROP POLICY IF EXISTS "Users can view related PDI objectives" ON pdi_objectives;

-- Cria novas políticas para a tabela pdi_objectives
CREATE POLICY "Enable insert for users creating own objectives"
  ON pdi_objectives
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = colaborador_id OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('admin', 'rh', 'gestor')
    )
  );

CREATE POLICY "Enable select for users on related objectives"
  ON pdi_objectives
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = colaborador_id OR
    auth.uid() = mentor_id OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('admin', 'rh')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'gestor'
      AND EXISTS (
        SELECT 1 FROM profiles managed 
        WHERE managed.user_id = pdi_objectives.colaborador_id 
        AND managed.gestor_id = auth.uid()
      )
    )
  );

CREATE POLICY "Enable update for users on own objectives"
  ON pdi_objectives
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = colaborador_id OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('admin', 'rh')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'gestor'
      AND EXISTS (
        SELECT 1 FROM profiles managed 
        WHERE managed.user_id = pdi_objectives.colaborador_id 
        AND managed.gestor_id = auth.uid()
      )
    )
  );

CREATE POLICY "Enable delete for authorized users"
  ON pdi_objectives
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = colaborador_id OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('admin', 'rh')
    )
  );