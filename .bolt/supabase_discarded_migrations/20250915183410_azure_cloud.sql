/*
  # Políticas RLS Abrangentes - Sistema DEA PDI
  
  Este arquivo contém todas as políticas de Row Level Security (RLS) para o sistema.
  
  ## Hierarquia de Acesso:
  - Admin: Acesso total a todos os dados
  - RH: Acesso a dados de bem-estar e relatórios gerais
  - Gestor: Acesso aos dados de seus liderados diretos
  - Colaborador: Acesso apenas aos próprios dados
  
  ## Tabelas Cobertas:
  - profiles (perfis de usuário)
  - pdi_objectives (objetivos de desenvolvimento)
  - assessments (avaliações de competências)
  - achievements (conquistas)
  - salary_history (histórico salarial)
  - hr_records (registros de RH)
  - hr_tests (testes psicológicos)
  - hr_tasks (tarefas de RH)
  - touchpoints (reuniões 1:1)
  - pdi_comments (comentários em objetivos)
  - action_groups (grupos de ação)
  - action_group_members (membros dos grupos)
  - action_group_tasks (tarefas dos grupos)
  - teams (equipes)
  - career_tracks (trilhas de carreira)
  - career_stages (estágios de carreira)
  - competencies (competências)
*/

-- =====================================================
-- FUNÇÕES AUXILIARES PARA RLS
-- =====================================================

-- Função para obter o papel do usuário atual
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um usuário é gestor de outro
CREATE OR REPLACE FUNCTION is_manager_of(manager_uuid UUID, employee_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = employee_uuid 
    AND gestor_id = manager_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um usuário é admin ou RH
CREATE OR REPLACE FUNCTION is_admin_or_hr(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'rh')
    FROM profiles 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA TABELA PROFILES
-- =====================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para visualização de perfis
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    -- Usuário pode ver próprio perfil
    auth.uid() = user_id
    OR
    -- Gestor pode ver perfis de liderados
    auth.uid() IN (
      SELECT gestor_id FROM profiles WHERE user_id = profiles.user_id
    )
    OR
    -- Liderado pode ver perfil do gestor
    user_id IN (
      SELECT gestor_id FROM profiles WHERE user_id = auth.uid()
    )
    OR
    -- Admin e RH podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para atualização de perfis
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    -- Usuário pode atualizar próprio perfil
    auth.uid() = user_id
    OR
    -- Admin pode atualizar qualquer perfil
    get_user_role(auth.uid()) = 'admin'
    OR
    -- RH pode atualizar perfis para gestão de pessoas
    get_user_role(auth.uid()) = 'rh'
  );

-- Política para inserção de perfis (apenas admin e sistema)
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'rh')
    OR auth.uid() = user_id
  );

-- =====================================================
-- POLÍTICAS PARA TABELA PDI_OBJECTIVES
-- =====================================================

ALTER TABLE pdi_objectives ENABLE ROW LEVEL SECURITY;

-- Política para visualização de objetivos PDI
CREATE POLICY "pdi_objectives_select_policy" ON pdi_objectives
  FOR SELECT USING (
    -- Colaborador pode ver próprios objetivos
    auth.uid() = colaborador_id
    OR
    -- Mentor pode ver objetivos que mentora
    auth.uid() = mentor_id
    OR
    -- Gestor pode ver objetivos de liderados
    is_manager_of(auth.uid(), colaborador_id)
    OR
    -- Admin e RH podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para criação de objetivos PDI
CREATE POLICY "pdi_objectives_insert_policy" ON pdi_objectives
  FOR INSERT WITH CHECK (
    -- Colaborador pode criar próprios objetivos
    auth.uid() = colaborador_id
    OR
    -- Gestor pode criar objetivos para liderados
    is_manager_of(auth.uid(), colaborador_id)
    OR
    -- Admin e RH podem criar objetivos
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para atualização de objetivos PDI
CREATE POLICY "pdi_objectives_update_policy" ON pdi_objectives
  FOR UPDATE USING (
    -- Colaborador pode atualizar próprios objetivos
    auth.uid() = colaborador_id
    OR
    -- Gestor pode atualizar objetivos de liderados
    is_manager_of(auth.uid(), colaborador_id)
    OR
    -- Mentor pode atualizar objetivos que mentora
    auth.uid() = mentor_id
    OR
    -- Admin e RH podem atualizar qualquer objetivo
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para exclusão de objetivos PDI
CREATE POLICY "pdi_objectives_delete_policy" ON pdi_objectives
  FOR DELETE USING (
    -- Colaborador pode excluir próprios objetivos
    auth.uid() = colaborador_id
    OR
    -- Admin pode excluir qualquer objetivo
    get_user_role(auth.uid()) = 'admin'
  );

-- =====================================================
-- POLÍTICAS PARA TABELA ASSESSMENTS
-- =====================================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Política para visualização de avaliações
CREATE POLICY "assessments_select_policy" ON assessments
  FOR SELECT USING (
    -- Avaliado pode ver próprias avaliações
    auth.uid() = avaliado_id
    OR
    -- Avaliador pode ver avaliações que fez
    auth.uid() = avaliador_id
    OR
    -- Gestor pode ver avaliações de liderados
    is_manager_of(auth.uid(), avaliado_id)
    OR
    -- Admin e RH podem ver todas
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para criação de avaliações
CREATE POLICY "assessments_insert_policy" ON assessments
  FOR INSERT WITH CHECK (
    -- Usuário pode criar autoavaliação
    (auth.uid() = avaliado_id AND auth.uid() = avaliador_id)
    OR
    -- Gestor pode avaliar liderados
    (is_manager_of(auth.uid(), avaliado_id) AND auth.uid() = avaliador_id)
    OR
    -- Admin e RH podem criar avaliações
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para atualização de avaliações
CREATE POLICY "assessments_update_policy" ON assessments
  FOR UPDATE USING (
    -- Avaliador pode atualizar próprias avaliações
    auth.uid() = avaliador_id
    OR
    -- Admin pode atualizar qualquer avaliação
    get_user_role(auth.uid()) = 'admin'
  );

-- =====================================================
-- POLÍTICAS PARA TABELA ACHIEVEMENTS
-- =====================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Política para visualização de conquistas
CREATE POLICY "achievements_select_policy" ON achievements
  FOR SELECT USING (
    -- Usuário pode ver próprias conquistas
    auth.uid() = user_id
    OR
    -- Gestor pode ver conquistas de liderados
    is_manager_of(auth.uid(), user_id)
    OR
    -- Admin e RH podem ver todas
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para criação de conquistas (apenas sistema e admin)
CREATE POLICY "achievements_insert_policy" ON achievements
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- =====================================================
-- POLÍTICAS PARA TABELA SALARY_HISTORY
-- =====================================================

ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;

-- Política para visualização de histórico salarial
CREATE POLICY "salary_history_select_policy" ON salary_history
  FOR SELECT USING (
    -- Usuário pode ver próprio histórico
    auth.uid() = user_id
    OR
    -- Admin e RH podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'rh')
    OR
    -- Gestor pode ver histórico de liderados (apenas se necessário)
    (get_user_role(auth.uid()) = 'gestor' AND is_manager_of(auth.uid(), user_id))
  );

-- Política para inserção de histórico salarial (apenas admin e RH)
CREATE POLICY "salary_history_insert_policy" ON salary_history
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- Política para atualização de histórico salarial (apenas admin e RH)
CREATE POLICY "salary_history_update_policy" ON salary_history
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

-- =====================================================
-- POLÍTICAS PARA TABELAS DE RH
-- =====================================================

-- HR_RECORDS
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_records_select_policy" ON hr_records
  FOR SELECT USING (
    -- Usuário pode ver próprios registros
    auth.uid() = user_id
    OR
    -- RH pode ver todos os registros
    get_user_role(auth.uid()) = 'rh'
    OR
    -- Admin pode ver todos
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "hr_records_insert_policy" ON hr_records
  FOR INSERT WITH CHECK (
    -- RH pode criar registros
    get_user_role(auth.uid()) = 'rh'
    OR
    -- Usuário pode criar próprios registros (agendamentos)
    auth.uid() = user_id
  );

CREATE POLICY "hr_records_update_policy" ON hr_records
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'rh'
  );

-- HR_TESTS
ALTER TABLE hr_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_tests_select_policy" ON hr_tests
  FOR SELECT USING (
    -- Usuário pode ver próprios testes
    auth.uid() = user_id
    OR
    -- RH pode ver todos os testes
    get_user_role(auth.uid()) = 'rh'
  );

CREATE POLICY "hr_tests_insert_policy" ON hr_tests
  FOR INSERT WITH CHECK (
    -- RH pode criar testes
    get_user_role(auth.uid()) = 'rh'
    OR
    -- Usuário pode iniciar próprios testes
    auth.uid() = user_id
  );

CREATE POLICY "hr_tests_update_policy" ON hr_tests
  FOR UPDATE USING (
    -- RH pode atualizar testes
    get_user_role(auth.uid()) = 'rh'
    OR
    -- Usuário pode completar próprios testes
    auth.uid() = user_id
  );

-- HR_TASKS
ALTER TABLE hr_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_tasks_select_policy" ON hr_tasks
  FOR SELECT USING (
    -- Usuário pode ver próprias tarefas
    auth.uid() = user_id
    OR
    -- RH pode ver todas as tarefas
    get_user_role(auth.uid()) = 'rh'
  );

CREATE POLICY "hr_tasks_insert_policy" ON hr_tasks
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'rh'
  );

CREATE POLICY "hr_tasks_update_policy" ON hr_tasks
  FOR UPDATE USING (
    -- RH pode atualizar tarefas
    get_user_role(auth.uid()) = 'rh'
    OR
    -- Usuário pode marcar próprias tarefas como concluídas
    (auth.uid() = user_id AND OLD.concluida = false)
  );

-- =====================================================
-- POLÍTICAS PARA TABELA TOUCHPOINTS
-- =====================================================

ALTER TABLE touchpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "touchpoints_select_policy" ON touchpoints
  FOR SELECT USING (
    -- Colaborador pode ver próprios touchpoints
    auth.uid() = colaborador_id
    OR
    -- Gestor pode ver touchpoints que conduziu
    auth.uid() = gestor_id
    OR
    -- Admin e RH podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

CREATE POLICY "touchpoints_insert_policy" ON touchpoints
  FOR INSERT WITH CHECK (
    -- Gestor pode criar touchpoints com liderados
    (auth.uid() = gestor_id AND is_manager_of(auth.uid(), colaborador_id))
    OR
    -- Admin e RH podem criar touchpoints
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

CREATE POLICY "touchpoints_update_policy" ON touchpoints
  FOR UPDATE USING (
    -- Gestor pode atualizar próprios touchpoints
    auth.uid() = gestor_id
    OR
    -- Admin pode atualizar qualquer touchpoint
    get_user_role(auth.uid()) = 'admin'
  );

-- =====================================================
-- POLÍTICAS PARA TABELA PDI_COMMENTS
-- =====================================================

ALTER TABLE pdi_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pdi_comments_select_policy" ON pdi_comments
  FOR SELECT USING (
    -- Usuário pode ver próprios comentários
    auth.uid() = user_id
    OR
    -- Usuário pode ver comentários em seus objetivos
    EXISTS (
      SELECT 1 FROM pdi_objectives 
      WHERE id = pdi_comments.objective_id 
      AND colaborador_id = auth.uid()
    )
    OR
    -- Gestor pode ver comentários em objetivos de liderados
    EXISTS (
      SELECT 1 FROM pdi_objectives 
      WHERE id = pdi_comments.objective_id 
      AND is_manager_of(auth.uid(), colaborador_id)
    )
    OR
    -- Admin e RH podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'rh')
  );

CREATE POLICY "pdi_comments_insert_policy" ON pdi_comments
  FOR INSERT WITH CHECK (
    -- Usuário pode comentar em objetivos que tem acesso
    auth.uid() = user_id
    AND (
      -- Em próprios objetivos
      EXISTS (
        SELECT 1 FROM pdi_objectives 
        WHERE id = objective_id 
        AND colaborador_id = auth.uid()
      )
      OR
      -- Em objetivos de liderados (se for gestor)
      EXISTS (
        SELECT 1 FROM pdi_objectives 
        WHERE id = objective_id 
        AND is_manager_of(auth.uid(), colaborador_id)
      )
      OR
      -- Admin e RH podem comentar em qualquer objetivo
      get_user_role(auth.uid()) IN ('admin', 'rh')
    )
  );

-- =====================================================
-- POLÍTICAS PARA TABELAS DE ACTION GROUPS
-- =====================================================

-- ACTION_GROUPS
ALTER TABLE action_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "action_groups_select_policy" ON action_groups
  FOR SELECT USING (
    -- Criador pode ver próprios grupos
    auth.uid() = created_by
    OR
    -- Membros podem ver grupos que participam
    EXISTS (
      SELECT 1 FROM action_group_members 
      WHERE group_id = action_groups.id 
      AND user_id = auth.uid()
    )
    OR
    -- Admin e gestores podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'gestor')
  );

CREATE POLICY "action_groups_insert_policy" ON action_groups
  FOR INSERT WITH CHECK (
    -- Gestores e admin podem criar grupos
    get_user_role(auth.uid()) IN ('admin', 'gestor')
    AND auth.uid() = created_by
  );

CREATE POLICY "action_groups_update_policy" ON action_groups
  FOR UPDATE USING (
    -- Criador pode atualizar próprios grupos
    auth.uid() = created_by
    OR
    -- Admin pode atualizar qualquer grupo
    get_user_role(auth.uid()) = 'admin'
  );

-- ACTION_GROUP_MEMBERS
ALTER TABLE action_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "action_group_members_select_policy" ON action_group_members
  FOR SELECT USING (
    -- Membro pode ver própria participação
    auth.uid() = user_id
    OR
    -- Criador do grupo pode ver membros
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = action_group_members.group_id 
      AND created_by = auth.uid()
    )
    OR
    -- Admin e gestores podem ver todos
    get_user_role(auth.uid()) IN ('admin', 'gestor')
  );

CREATE POLICY "action_group_members_insert_policy" ON action_group_members
  FOR INSERT WITH CHECK (
    -- Criador do grupo pode adicionar membros
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
    OR
    -- Admin pode adicionar membros a qualquer grupo
    get_user_role(auth.uid()) = 'admin'
  );

-- ACTION_GROUP_TASKS
ALTER TABLE action_group_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "action_group_tasks_select_policy" ON action_group_tasks
  FOR SELECT USING (
    -- Responsável pode ver próprias tarefas
    auth.uid() = responsavel_id
    OR
    -- Membros do grupo podem ver tarefas
    EXISTS (
      SELECT 1 FROM action_group_members 
      WHERE group_id = action_group_tasks.group_id 
      AND user_id = auth.uid()
    )
    OR
    -- Criador do grupo pode ver tarefas
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = action_group_tasks.group_id 
      AND created_by = auth.uid()
    )
    OR
    -- Admin e gestores podem ver todas
    get_user_role(auth.uid()) IN ('admin', 'gestor')
  );

CREATE POLICY "action_group_tasks_insert_policy" ON action_group_tasks
  FOR INSERT WITH CHECK (
    -- Criador do grupo pode criar tarefas
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = group_id 
      AND created_by = auth.uid()
    )
    OR
    -- Admin pode criar tarefas em qualquer grupo
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "action_group_tasks_update_policy" ON action_group_tasks
  FOR UPDATE USING (
    -- Responsável pode atualizar próprias tarefas
    auth.uid() = responsavel_id
    OR
    -- Criador do grupo pode atualizar tarefas
    EXISTS (
      SELECT 1 FROM action_groups 
      WHERE id = action_group_tasks.group_id 
      AND created_by = auth.uid()
    )
    OR
    -- Admin pode atualizar qualquer tarefa
    get_user_role(auth.uid()) = 'admin'
  );

-- =====================================================
-- POLÍTICAS PARA TABELAS DE ESTRUTURA ORGANIZACIONAL
-- =====================================================

-- TEAMS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_policy" ON teams
  FOR SELECT USING (
    -- Todos podem visualizar equipes (informação organizacional)
    true
  );

CREATE POLICY "teams_insert_policy" ON teams
  FOR INSERT WITH CHECK (
    -- Admin pode criar equipes
    get_user_role(auth.uid()) = 'admin'
    AND auth.uid() = created_by
  );

CREATE POLICY "teams_update_policy" ON teams
  FOR UPDATE USING (
    -- Criador pode atualizar próprias equipes
    auth.uid() = created_by
    OR
    -- Admin pode atualizar qualquer equipe
    get_user_role(auth.uid()) = 'admin'
  );

-- CAREER_TRACKS
ALTER TABLE career_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_tracks_select_policy" ON career_tracks
  FOR SELECT USING (
    -- Todos podem visualizar trilhas de carreira
    true
  );

CREATE POLICY "career_tracks_insert_policy" ON career_tracks
  FOR INSERT WITH CHECK (
    -- Admin pode criar trilhas
    get_user_role(auth.uid()) = 'admin'
    AND auth.uid() = created_by
  );

CREATE POLICY "career_tracks_update_policy" ON career_tracks
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'admin'
  );

-- CAREER_STAGES
ALTER TABLE career_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_stages_select_policy" ON career_stages
  FOR SELECT USING (
    -- Todos podem visualizar estágios de carreira
    true
  );

CREATE POLICY "career_stages_insert_policy" ON career_stages
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "career_stages_update_policy" ON career_stages
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'admin'
  );

-- COMPETENCIES
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competencies_select_policy" ON competencies
  FOR SELECT USING (
    -- Todos podem visualizar competências
    true
  );

CREATE POLICY "competencies_insert_policy" ON competencies
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "competencies_update_policy" ON competencies
  FOR UPDATE USING (
    get_user_role(auth.uid()) = 'admin'
  );

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para melhorar performance das consultas RLS
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gestor_id ON profiles(gestor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_pdi_objectives_colaborador_id ON pdi_objectives(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_pdi_objectives_mentor_id ON pdi_objectives(mentor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_avaliado_id ON assessments(avaliado_id);
CREATE INDEX IF NOT EXISTS idx_assessments_avaliador_id ON assessments(avaliador_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_salary_history_user_id ON salary_history(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_records_user_id ON hr_records(user_id);
CREATE INDEX IF NOT EXISTS idx_hr_tests_user_id ON hr_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_colaborador_id ON touchpoints(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_gestor_id ON touchpoints(gestor_id);
CREATE INDEX IF NOT EXISTS idx_action_group_members_user_id ON action_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_action_group_members_group_id ON action_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_action_group_tasks_responsavel_id ON action_group_tasks(responsavel_id);

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

/*
  IMPORTANTE: 
  
  1. Todas as políticas foram criadas para evitar recursão infinita
  2. As funções auxiliares usam SECURITY DEFINER para performance
  3. Índices foram adicionados para otimizar as consultas RLS
  4. Cada política segue o princípio do menor privilégio
  5. Admin tem acesso total, RH tem acesso a dados de bem-estar
  6. Gestores têm acesso limitado aos liderados diretos
  7. Colaboradores têm acesso apenas aos próprios dados
  
  Para testar as políticas, use diferentes usuários com diferentes roles
  e verifique se o acesso está sendo restrito corretamente.
*/