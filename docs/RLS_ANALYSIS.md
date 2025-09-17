# Análise de Row Level Security (RLS) - Sistema DEA PDI

## Visão Geral

O sistema utiliza Row Level Security (RLS) do PostgreSQL via Supabase para controlar acesso aos dados baseado no usuário autenticado e seu role. Esta análise documenta o estado atual das políticas RLS e identifica pontos de melhoria.

## Tabelas Críticas e Status RLS

### ✅ Tabelas com RLS Ativo

#### 1. `profiles` - Perfis de Usuário
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- Política básica de acesso ao próprio perfil
CREATE POLICY "basic_own_profile_access" ON profiles
  FOR ALL USING (uid() = user_id) WITH CHECK (uid() = user_id);
```

**Análise**:
- ✅ Usuários podem acessar apenas seu próprio perfil
- ⚠️ Gestores não conseguem ver perfis de liderados
- ⚠️ RH não consegue acessar perfis para gestão

#### 2. `salary_history` - Histórico Salarial
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- Admin e RH podem gerenciar histórico salarial
CREATE POLICY "Admin can manage salary history" ON salary_history
  FOR ALL TO public USING (get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]));

-- Usuários podem ver próprio histórico
CREATE POLICY "Users can view own salary history" ON salary_history
  FOR SELECT TO public USING (user_id = uid());

-- Gestores podem ver histórico de liderados
CREATE POLICY "Gestor can view managed salary history" ON salary_history
  FOR SELECT TO public USING ((get_user_role(uid()) = 'gestor'::user_role) AND is_manager_of(uid(), user_id));
```

**Análise**:
- ✅ Controle granular por role
- ✅ Gestores podem ver liderados
- ✅ Dados sensíveis protegidos

#### 3. `teams` - Equipes
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- Admin pode gerenciar equipes
CREATE POLICY "Admin can manage teams" ON teams
  FOR ALL TO public USING (get_user_role(uid()) = 'admin'::user_role);

-- Todos podem visualizar equipes
CREATE POLICY "All can view teams" ON teams
  FOR SELECT TO public USING (true);
```

**Análise**:
- ✅ Visualização aberta (apropriado para transparência organizacional)
- ✅ Criação restrita a admins
- ⚠️ Gestores não podem criar equipes

#### 4. `pdi_objectives` - Objetivos PDI
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- Usuários podem ver objetivos relacionados
CREATE POLICY "Enable select for users on related objectives" ON pdi_objectives
  FOR SELECT TO authenticated USING (
    (uid() = colaborador_id) OR 
    (uid() = mentor_id) OR 
    (uid() = created_by) OR 
    (get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])) OR
    (get_user_role(uid()) = 'gestor'::user_role AND is_manager_of(uid(), colaborador_id))
  );

-- Usuários podem criar objetivos
CREATE POLICY "Enable insert for users creating own objectives" ON pdi_objectives
  FOR INSERT TO authenticated WITH CHECK (
    (uid() = colaborador_id) OR 
    (uid() = created_by) OR 
    (get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role, 'gestor'::user_role]))
  );
```

**Análise**:
- ✅ Controle granular e bem estruturado
- ✅ Suporte a mentoria e hierarquia
- ✅ Permite gestores criarem objetivos para liderados

#### 5. `assessments` - Avaliações de Competência
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- Usuários podem ver avaliações relacionadas
CREATE POLICY "Users can view related assessments" ON assessments
  FOR SELECT TO public USING (
    (avaliado_id = uid()) OR 
    (avaliador_id = uid()) OR 
    (get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])) OR
    (get_user_role(uid()) = 'gestor'::user_role AND is_manager_of(uid(), avaliado_id))
  );

-- Usuários podem criar avaliações
CREATE POLICY "Users can create assessments" ON assessments
  FOR INSERT TO public WITH CHECK (
    (avaliador_id = uid()) AND 
    ((avaliado_id = uid()) OR (get_user_role(uid()) = 'gestor'::user_role AND is_manager_of(uid(), avaliado_id)))
  );
```

**Análise**:
- ✅ Autoavaliação e avaliação por gestor
- ✅ RH e admin têm acesso completo
- ✅ Previne avaliações não autorizadas

#### 6. `hr_records` - Registros de RH
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- RH pode gerenciar todos os registros
CREATE POLICY "HR can manage records" ON hr_records
  FOR ALL TO public USING (get_user_role(uid()) = 'rh'::user_role);

-- RH e usuário podem ver registros
CREATE POLICY "HR and user can view records" ON hr_records
  FOR SELECT TO public USING (
    (user_id = uid()) OR 
    (get_user_role(uid()) = 'rh'::user_role)
  );
```

**Análise**:
- ✅ Confidencialidade médica respeitada
- ✅ Apenas RH e próprio usuário têm acesso
- ✅ Controle adequado para dados sensíveis

#### 7. `hr_tests` - Testes Psicológicos
**Status**: ✅ RLS Ativo  
**Políticas Similares**: Como `hr_records`

#### 8. `touchpoints` - Reuniões 1:1
**Status**: ✅ RLS Ativo  
**Políticas Identificadas**:
```sql
-- Gestor pode gerenciar touchpoints
CREATE POLICY "Gestor can manage touchpoints" ON touchpoints
  FOR ALL TO public USING (
    (gestor_id = uid()) OR 
    (get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]))
  );

-- Usuários podem ver touchpoints relacionados
CREATE POLICY "Users can view related touchpoints" ON touchpoints
  FOR SELECT TO public USING (
    (colaborador_id = uid()) OR 
    (gestor_id = uid()) OR 
    (get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]))
  );
```

**Análise**:
- ✅ Gestores controlam reuniões com liderados
- ✅ Colaboradores veem suas reuniões
- ✅ RH tem visibilidade para acompanhamento

### ✅ Tabelas com RLS Parcial

#### 9. `career_tracks` e `career_stages` - Trilhas de Carreira
**Status**: ✅ RLS Ativo (Leitura Aberta)  
**Políticas**:
```sql
-- Admin pode gerenciar trilhas
CREATE POLICY "Admin can manage career tracks" ON career_tracks
  FOR ALL TO public USING (get_user_role(uid()) = 'admin'::user_role);

-- Todos podem visualizar trilhas
CREATE POLICY "All can view career tracks" ON career_tracks
  FOR SELECT TO public USING (true);
```

**Análise**:
- ✅ Informações de carreira são transparentes
- ✅ Apenas admins podem modificar estrutura
- ✅ Apropriado para o contexto organizacional

#### 10. `competencies` - Competências
**Status**: ✅ RLS Ativo (Similar às trilhas)

### ✅ Tabelas com RLS Complexo

#### 11. `action_groups` - Grupos de Ação
**Status**: ✅ RLS Ativo  
**Análise**:
- ✅ Membros podem ver grupos que participam
- ✅ Gestores e admins podem gerenciar
- ✅ Controle adequado para colaboração

## Funções Auxiliares RLS

### 1. `get_user_role(uuid)`
```sql
-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$;
```

**Status**: ✅ Implementada e funcional  
**Uso**: Amplamente utilizada nas políticas RLS

### 2. `is_manager_of(uuid, uuid)`
```sql
-- Função para verificar hierarquia
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
```

**Status**: ✅ Implementada e funcional  
**Uso**: Crítica para políticas de gestão

## Riscos e Vulnerabilidades Identificados

### 🔴 Riscos Críticos

#### 1. Função `get_user_role` - Possível Recursão
**Problema**: A função pode causar recursão infinita se mal implementada  
**Impacto**: Falha nas políticas RLS, possível negação de serviço  
**Mitigação**: Verificar implementação e adicionar proteções

#### 2. Perfis de Gestores - Visibilidade Limitada
**Problema**: Gestores não conseguem ver perfis básicos de liderados  
**Impacto**: Dificuldade na gestão de equipe  
**Mitigação**: Adicionar política específica para gestores

### 🟡 Riscos Médios

#### 3. Dados de Carreira - Transparência Excessiva
**Problema**: Todos veem trilhas e salários de todos os níveis  
**Impacto**: Possível desconforto organizacional  
**Mitigação**: Avaliar se transparência é desejada

#### 4. Comentários PDI - Falta de Moderação
**Problema**: Não há controle sobre conteúdo de comentários  
**Impacto**: Possível uso inadequado  
**Mitigação**: Implementar moderação ou auditoria

### 🟢 Riscos Baixos

#### 5. Performance de Queries RLS
**Problema**: Políticas complexas podem impactar performance  
**Impacto**: Lentidão na aplicação  
**Mitigação**: Monitorar e otimizar queries

## Recomendações de Melhoria

### 1. Políticas Adicionais Necessárias

```sql
-- Permitir gestores verem perfis básicos de liderados
CREATE POLICY "managers_can_view_team_profiles" ON profiles
  FOR SELECT TO authenticated USING (
    uid() = user_id OR 
    is_manager_of(uid(), user_id) OR
    get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])
  );

-- Auditoria de mudanças sensíveis
CREATE POLICY "audit_sensitive_changes" ON salary_history
  FOR INSERT TO authenticated WITH CHECK (
    get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role]) AND
    created_by = uid()
  );
```

### 2. Funções de Segurança Adicionais

```sql
-- Verificar se usuário está ativo
CREATE OR REPLACE FUNCTION is_user_active(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT status = 'ativo' 
    FROM profiles 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Verificar permissão de acesso a dados de usuário
CREATE OR REPLACE FUNCTION can_access_user_data(target_user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    uid() = target_user_uuid OR
    is_manager_of(uid(), target_user_uuid) OR
    get_user_role(uid()) = ANY (ARRAY['admin'::user_role, 'rh'::user_role])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 3. Monitoramento e Auditoria

```sql
-- Tabela de auditoria para mudanças sensíveis
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Trigger para auditoria automática
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values)
  VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Checklist de Validação RLS

### ✅ Testes de Segurança Necessários

- [ ] **Teste de Isolamento**: Usuário A não consegue ver dados de usuário B
- [ ] **Teste de Hierarquia**: Gestor consegue ver dados de liderados, mas não de outros
- [ ] **Teste de Role**: Admin/RH conseguem ver dados apropriados
- [ ] **Teste de Negação**: Usuários sem permissão recebem erro ou dados vazios
- [ ] **Teste de Performance**: Políticas não causam lentidão excessiva
- [ ] **Teste de Funções**: `get_user_role` e `is_manager_of` funcionam corretamente
- [ ] **Teste de Edge Cases**: Usuários inativos, sem role, etc.

### ✅ Validação de Produção

- [ ] **Backup de Políticas**: Todas as políticas estão documentadas
- [ ] **Rollback Plan**: Plano para reverter políticas se necessário
- [ ] **Monitoramento**: Logs de acesso negado configurados
- [ ] **Alertas**: Alertas para tentativas de acesso suspeitas
- [ ] **Documentação**: Políticas documentadas para equipe

## Conclusão

O sistema possui uma base sólida de RLS com políticas bem estruturadas para a maioria dos casos de uso. Os principais pontos de atenção são:

1. **Melhorar visibilidade para gestores** sem comprometer segurança
2. **Adicionar auditoria** para mudanças sensíveis
3. **Testar performance** das políticas em produção
4. **Implementar monitoramento** proativo de segurança

A arquitetura RLS atual é adequada para produção com as melhorias recomendadas.