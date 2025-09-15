# Security Configuration Guide

## Matriz de Acesso por Tabela e Função

| Tabela | Admin | RH | Gestor | Colaborador |
|--------|-------|----|---------| ------------|
| **profiles** | CRUD total | CRUD total | R próprio + liderados, U próprio | R próprio + gestor, U próprio |
| **pdi_objectives** | CRUD total | CRUD total | CRUD liderados | CRUD próprios |
| **assessments** | CRUD total | CRUD total | CRUD liderados | CRUD próprios |
| **achievements** | CRUD total | CRU total | R liderados | R próprios |
| **salary_history** | CRUD total | CRUD total | R liderados* | R próprios |
| **hr_records** | CRUD total | CRUD total | - | R próprios, C agendamentos |
| **hr_tests** | CRUD total | CRUD total | - | RU próprios |
| **hr_tasks** | CRUD total | CRUD total | - | R próprias, U conclusão |
| **touchpoints** | CRUD total | CRUD total | CRUD próprios | R próprios |
| **pdi_comments** | CRUD total | CRUD total | CRUD em obj. liderados | CRUD em obj. próprios |
| **action_groups** | CRUD total | - | CRUD próprios + R todos | R participação |
| **action_group_members** | CRUD total | - | CRUD próprios grupos | R própria participação |
| **action_group_tasks** | CRUD total | - | CRUD próprios grupos | RU próprias tarefas |
| **teams** | CRUD total | - | R todos | R todos |
| **career_tracks** | CRUD total | - | R todos | R todos |
| **career_stages** | CRUD total | - | R todos | R todos |
| **competencies** | CRUD total | - | R todos | R todos |

*Legenda: C=Create, R=Read, U=Update, D=Delete*
*salary_history para gestores: apenas se necessário para gestão*

## Políticas RLS Implementadas

### Funções Auxiliares
- `get_user_role(uuid)`: Retorna o papel do usuário
- `is_manager_of(manager_uuid, employee_uuid)`: Verifica relação hierárquica
- `is_admin_or_hr(uuid)`: Verifica se é admin ou RH

### Princípios das Políticas
1. **Menor Privilégio**: Cada usuário tem acesso apenas ao necessário
2. **Não Recursão**: Políticas evitam loops infinitos
3. **Performance**: Índices otimizam consultas RLS
4. **Auditabilidade**: Todas as ações são rastreáveis

### Tabelas Críticas com RLS
- ✅ `profiles` - Dados pessoais e profissionais
- ✅ `pdi_objectives` - Objetivos de desenvolvimento
- ✅ `assessments` - Avaliações de competências
- ✅ `achievements` - Conquistas dos usuários
- ✅ `salary_history` - Informações salariais sensíveis
- ✅ `hr_records` - Registros de consultas RH
- ✅ `hr_tests` - Testes psicológicos
- ✅ `hr_tasks` - Tarefas de RH
- ✅ `touchpoints` - Reuniões 1:1
- ✅ `pdi_comments` - Comentários em objetivos
- ✅ `action_groups` - Grupos de ação
- ✅ `action_group_members` - Membros dos grupos
- ✅ `action_group_tasks` - Tarefas dos grupos

### Tabelas Organizacionais (Acesso Público Interno)
- ✅ `teams` - Estrutura organizacional
- ✅ `career_tracks` - Trilhas de carreira
- ✅ `career_stages` - Estágios de carreira
- ✅ `competencies` - Competências organizacionais

## Environment Variables

### Development
Use `.env` file for development with your development Supabase project credentials.

### Production
Create `.env.production` file with your production Supabase project credentials:

```env
VITE_SUPABASE_URL=https://pbjwtnhpcwkplnyzkrtu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiand0bmhwY3drcGxueXprcnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDE3OTMsImV4cCI6MjA3MTg3Nzc5M30.yisHwRskz-2wpS4fbqarBxPdBSGxFxYiIfF-YOvinq0
```

## Row Level Security (RLS) Checklist

Ensure the following tables have RLS enabled and proper policies:

### Critical Tables (Must have RLS)
- [ ] `profiles` - User profile data
- [ ] `pdi_objectives` - Personal development objectives
- [ ] `assessments` - Competency assessments
- [ ] `hr_records` - HR consultation records
- [ ] `hr_tests` - Psychological tests and results
- [ ] `salary_history` - Salary information
- [ ] `touchpoints` - Manager-employee meetings
- [ ] `pdi_comments` - Comments on PDI objectives
- [ ] `achievements` - User achievements

### Standard Tables (Should have RLS)
- [ ] `teams` - Team information
- [ ] `career_tracks` - Career progression tracks
- [ ] `career_stages` - Career stages
- [ ] `competencies` - Competency definitions
- [ ] `action_groups` - Action groups
- [ ] `action_group_members` - Group membership
- [ ] `action_group_tasks` - Group tasks

## RLS Policy Examples

Todas as políticas RLS foram implementadas no arquivo `supabase/policies.sql`.

### Testes de RLS

Para testar as políticas RLS:

1. **Teste de Isolamento de Dados:**
```sql
-- Como colaborador, deve ver apenas próprios dados
SELECT * FROM pdi_objectives; -- Deve retornar apenas objetivos do usuário
```

2. **Teste de Acesso Hierárquico:**
```sql
-- Como gestor, deve ver dados de liderados
SELECT * FROM profiles WHERE gestor_id = auth.uid(); -- Deve retornar liderados
```

3. **Teste de Violação de Acesso:**
```sql
-- Tentativa de acesso não autorizado deve falhar
SELECT * FROM salary_history WHERE user_id != auth.uid(); -- Deve retornar vazio para colaborador
```

### Monitoramento de Segurança

1. **Logs de Acesso**: Monitore tentativas de acesso negado
2. **Auditoria Regular**: Revise políticas mensalmente
3. **Testes Automatizados**: Execute testes de RLS no CI/CD
4. **Alertas**: Configure alertas para tentativas de violação

## Security Best Practices

1. **Never expose service_role keys** in frontend code
2. **Always use RLS** for user data tables
3. **Validate user permissions** in application logic
4. **Use HTTPS** in production
5. **Implement proper error handling** to avoid information leakage
6. **Regular security audits** of RLS policies
7. **Monitor access logs** in Supabase dashboard

## Verification Steps

1. Test RLS policies by attempting unauthorized access
2. Verify environment variables are correctly set
3. Check that no sensitive keys are exposed in client code
4. Ensure all API endpoints respect user permissions
5. Test authentication flows thoroughly

## Testes de RLS Automatizados

Execute os testes de RLS regularmente:

```bash
# Executar testes de políticas RLS
npm run test:rls
```

Os testes verificam:
- Isolamento de dados por usuário
- Acesso hierárquico correto
- Prevenção de escalação de privilégios
- Performance das consultas com RLS

## Emergency Procedures

If a security breach is suspected:

1. Immediately revoke and regenerate API keys
2. Review and tighten RLS policies
3. Check access logs for suspicious activity
4. Update all environment variables
5. Notify affected users if necessary