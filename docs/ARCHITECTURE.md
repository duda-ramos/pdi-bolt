# Arquitetura do Sistema DEA PDI

## Visão Geral

O sistema DEA PDI é uma aplicação de desenvolvimento individual corporativo construída com:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **Deploy**: Bolt Hosting (Frontend) + Supabase (Backend)
- **Autenticação**: Supabase Auth com RLS
- **Autorização**: Row Level Security (RLS) baseada em roles

## Arquitetura de Alto Nível

```
┌─────────────────┐    HTTPS/WSS    ┌──────────────────┐
│   Frontend      │◄──────────────►│   Supabase       │
│   (React SPA)   │                 │   (Backend)      │
│                 │                 │                  │
│ • Components    │                 │ • PostgreSQL     │
│ • Pages         │                 │ • Auth           │
│ • Contexts      │                 │ • RLS Policies   │
│ • Hooks         │                 │ • Edge Functions │
└─────────────────┘                 └──────────────────┘
        │                                    │
        │                                    │
        ▼                                    ▼
┌─────────────────┐                 ┌──────────────────┐
│   Bolt Hosting  │                 │   Supabase       │
│   (CDN/Static)  │                 │   (Cloud)        │
└─────────────────┘                 └──────────────────┘
```

## Estrutura do Frontend

### Organização de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── auth/           # Autenticação (LoginForm)
│   ├── common/         # Componentes base (Badge, StatCard, etc.)
│   ├── dashboard/      # Dashboard específicos
│   ├── Layout/         # Layout (Header, Sidebar)
│   └── [feature]/      # Componentes por feature
├── contexts/           # React Contexts (AuthContext)
├── hooks/              # Custom hooks
├── lib/                # Configurações e utilitários
├── pages/              # Páginas principais
├── types/              # Definições TypeScript
└── utils/              # Funções utilitárias
```

### Componentes Principais
- **AuthContext**: Gerenciamento global de autenticação
- **Sidebar**: Navegação baseada em roles
- **ErrorBoundary**: Tratamento de erros React
- **Pages**: Dashboard, Profile, Career, Competencies, PDI, Teams, MentalHealth, ActionGroups, Settings

## Estrutura do Backend (Supabase)

### Schema Principal
```sql
-- Usuários e Perfis
profiles (user_id, nome, email, role, status, ...)
teams (id, nome, descricao, created_by)
salary_history (user_id, valor, data_inicio, data_fim)

-- Carreira e Competências  
career_tracks (id, nome, descricao)
career_stages (trilha_id, nome, ordem, etapa, salario_min, salario_max)
competencies (stage_id, nome, tipo, peso)
assessments (competency_id, avaliado_id, avaliador_id, tipo, nota)

-- PDI (Plano de Desenvolvimento Individual)
pdi_objectives (colaborador_id, titulo, descricao, status, data_inicio, data_fim)
pdi_comments (objective_id, user_id, comentario)
achievements (user_id, titulo, descricao, conquistado_em)

-- RH e Bem-estar
hr_records (user_id, titulo, conteudo, tipo, data_sessao)
hr_tests (user_id, nome_teste, resultado, realizado_em)
hr_tasks (user_id, titulo, descricao, concluida)
touchpoints (colaborador_id, gestor_id, feedback, data_reuniao)

-- Grupos de Ação
action_groups (nome, descricao, created_by)
action_group_members (group_id, user_id)
action_group_tasks (group_id, titulo, responsavel_id, concluida)
```

### Roles e Hierarquia
```
admin     -> Acesso total ao sistema
rh        -> Gestão de bem-estar, testes psicológicos, consultas
gestor    -> Gestão de equipe, avaliações, aprovação de PDIs
colaborador -> Autoavaliação, PDI pessoal, visualização limitada
```

## Fluxos Principais

### 1. Fluxo de Autenticação
```
1. Usuário acessa aplicação
2. AuthContext verifica sessão (getSession)
3. Se não autenticado → LoginForm
4. Login/Signup via Supabase Auth
5. Carregamento do perfil (getUserProfile)
6. Redirecionamento para Dashboard baseado no role
```

### 2. Fluxo de Dados (CRUD)
```
1. Componente React faz chamada via supabase client
2. Supabase aplica RLS policies baseadas no usuário autenticado
3. Query executada no PostgreSQL
4. Dados retornados respeitando permissões
5. Estado atualizado no React
```

### 3. Fluxo de Autorização (RLS)
```
1. Usuário faz request para tabela protegida
2. Supabase identifica user_id da sessão (auth.uid())
3. Políticas RLS são avaliadas:
   - Verificação de role (get_user_role)
   - Verificação de hierarquia (is_manager_of)
   - Verificação de propriedade (user_id = auth.uid())
4. Query executada apenas se políticas permitirem
```

## Tecnologias e Dependências

### Frontend Core
- **React 18.3.1**: Framework principal
- **TypeScript 5.5.3**: Tipagem estática
- **Vite 5.4.2**: Build tool e dev server
- **Tailwind CSS 3.4.1**: Framework CSS

### Supabase Integration
- **@supabase/supabase-js 2.57.2**: Cliente oficial
- **Singleton pattern**: Uma instância do cliente

### UI e UX
- **lucide-react 0.344.0**: Ícones
- **Componentes customizados**: Badge, StatCard, ProgressBar, etc.

### Qualidade e Testes
- **ESLint + TypeScript ESLint**: Linting
- **Vitest 3.2.4**: Framework de testes
- **@testing-library/react**: Testes de componentes

## Configuração de Ambientes

### Desenvolvimento (.env)
```env
VITE_SUPABASE_URL=https://pbjwtnhpcwkplnyzkrtu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Build e Deploy
- **Build**: `npm run build` → pasta `dist/`
- **Preview**: `npm run preview` para testar build
- **Deploy**: Bolt Hosting (automático via Git)

## Pontos de Atenção para Produção

### Segurança ⚠️
- RLS deve estar ativo em TODAS as tabelas críticas
- Chave service_role NUNCA deve ser exposta no frontend
- Validação de entrada em todos os formulários
- Sanitização de dados sensíveis (salários, dados de RH)

### Performance ⚠️
- Queries podem ser otimizadas com índices
- Lazy loading de componentes não implementado
- Imagens não otimizadas automaticamente
- Sem cache de dados do Supabase

### Monitoramento ⚠️
- Sem logging estruturado
- Sem métricas de performance
- Sem alertas automáticos
- ErrorBoundary básico implementado

### Escalabilidade ⚠️
- Frontend estático é naturalmente escalável
- Supabase gerencia escalabilidade do backend
- Sem otimizações específicas para alto volume