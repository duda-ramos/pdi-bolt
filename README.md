# DEA PDI - Sistema de Desenvolvimento Individual

Sistema completo de gestão de desenvolvimento pessoal e profissional para empresas.

## 🚀 Funcionalidades

- **Gestão de Perfis**: Controle de usuários com diferentes roles (admin, rh, gestor, colaborador)
- **Trilhas de Carreira**: Sistema de progressão profissional com estágios e competências
- **PDI (Plano de Desenvolvimento Individual)**: Criação e acompanhamento de objetivos pessoais
- **Avaliações de Competência**: Sistema de autoavaliação e avaliação por gestores
- **Gestão de Equipes**: Organização e acompanhamento de equipes
- **Saúde Mental**: Módulo de RH para acompanhamento psicológico
- **Grupos de Ação**: Colaboração em projetos e iniciativas
- **Sistema de Conquistas**: Gamificação do desenvolvimento profissional

## 🛠 Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **Lucide React** para ícones

### Backend
- **Supabase** (PostgreSQL + Auth + RLS)
- **Row Level Security** para controle de acesso
- **Triggers automáticos** para sistema de conquistas

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Git

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd pdi-bolt
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Supabase**
   - Crie um novo projeto no [Supabase](https://supabase.com)
   - Execute as migrações na ordem:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_enable_rls_policies.sql`
     - `supabase/migrations/003_sample_data.sql`
     - `supabase/migrations/004_helper_functions.sql`

4. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Supabase.

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- `profiles` - Perfis de usuário
- `teams` - Equipes
- `career_tracks` - Trilhas de carreira
- `career_stages` - Estágios das trilhas
- `competencies` - Competências por estágio
- `assessments` - Avaliações de competência
- `pdi_objectives` - Objetivos PDI
- `pdi_comments` - Comentários nos objetivos
- `hr_records` - Registros de RH
- `hr_tests` - Testes psicológicos
- `action_groups` - Grupos de ação
- `achievements` - Sistema de conquistas

### Roles de Usuário
- **admin**: Acesso total ao sistema
- **rh**: Gestão de bem-estar e recursos humanos
- **gestor**: Gestão de equipe e avaliações
- **colaborador**: Acesso ao próprio desenvolvimento

## 🔒 Segurança

- **Row Level Security (RLS)** ativo em todas as tabelas
- **Políticas não-recursivas** para evitar loops infinitos
- **Controle baseado em JWT claims** para performance
- **Dados confidenciais** protegidos (registros de RH)

## 🎯 Como Usar

1. **Primeiro Acesso**
   - Crie uma conta através da tela de signup
   - Escolha seu role apropriado
   - Complete seu perfil

2. **Colaboradores**
   - Acesse "PDI" para criar objetivos de desenvolvimento
   - Use "Competências" para autoavaliação
   - Acompanhe seu progresso na trilha de carreira

3. **Gestores**
   - Gerencie sua equipe em "Equipes"
   - Avalie competências dos liderados
   - Aprove objetivos PDI

4. **RH**
   - Acesse "Bem-estar" para acompanhamento psicológico
   - Aplique testes e faça consultas
   - Monitore a saúde mental da organização

5. **Administradores**
   - Configure trilhas de carreira
   - Gerencie usuários e permissões
   - Acesse relatórios globais

## 🏆 Sistema de Conquistas

O sistema possui conquistas automáticas que são desbloqueadas quando:
- Objetivos PDI são completados
- Avaliações altas são recebidas
- Marcos de desenvolvimento são atingidos

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablets
- Smartphones

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
npm run test         # Executar testes
```

### Estrutura de Pastas
```
src/
├── components/      # Componentes reutilizáveis
├── contexts/        # React Contexts
├── hooks/          # Custom hooks
├── lib/            # Configurações e utilitários
├── pages/          # Páginas principais
├── types/          # Definições TypeScript
└── utils/          # Funções utilitárias
```

## 🚀 Deploy

O sistema está configurado para deploy no Bolt Hosting com Supabase como backend.

## 📄 Licença

Este projeto é proprietário e confidencial.