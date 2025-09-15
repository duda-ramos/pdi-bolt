// Mock data for fallback scenarios
export const mockProfiles = [
  {
    id: 'mock-user-1',
    user_id: 'mock-user-1',
    nome: 'João Silva',
    email: 'joao@empresa.com',
    role: 'colaborador' as const,
    status: 'ativo' as const,
    data_admissao: '2023-01-15',
    bio: 'Desenvolvedor Frontend com 3 anos de experiência',
    localizacao: 'São Paulo, SP',
    formacao: 'Ciência da Computação',
    trilha_id: 'mock-track-1',
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

export const mockPDIObjectives = [
  {
    id: 'mock-obj-1',
    colaborador_id: 'mock-user-1',
    competency_id: 'mock-comp-1',
    titulo: 'Aprender React Avançado',
    descricao: 'Dominar hooks avançados, context API e performance optimization',
    status: 'aprovado' as const,
    objetivo_status: 'em_andamento' as const,
    data_inicio: '2024-01-01',
    data_fim: '2024-03-31',
    mentor_id: 'mock-mentor-1',
    pontos_extra: 65,
    created_by: 'mock-user-1',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'mock-obj-2',
    colaborador_id: 'mock-user-1',
    competency_id: 'mock-comp-2',
    titulo: 'Certificação AWS',
    descricao: 'Obter certificação AWS Solutions Architect Associate',
    status: 'aprovado' as const,
    objetivo_status: 'pendente' as const,
    data_inicio: '2024-02-01',
    data_fim: '2024-06-30',
    mentor_id: null,
    pontos_extra: 20,
    created_by: 'mock-user-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

export const mockAchievements = [
  {
    id: 'mock-ach-1',
    user_id: 'mock-user-1',
    titulo: 'Primeiro Objetivo',
    descricao: 'Completou seu primeiro objetivo PDI',
    conquistado_em: '2023-12-15T10:00:00Z',
    objective_id: 'mock-obj-completed',
    created_by: 'system'
  },
  {
    id: 'mock-ach-2',
    user_id: 'mock-user-1',
    titulo: 'Aprendiz Dedicado',
    descricao: 'Completou 5 objetivos de aprendizado',
    conquistado_em: '2024-01-10T10:00:00Z',
    objective_id: null,
    created_by: 'system'
  }
];

export const mockTeams = [
  {
    id: 'mock-team-1',
    nome: 'Desenvolvimento Frontend',
    descricao: 'Equipe responsável pelo desenvolvimento da interface do usuário',
    created_by: 'mock-manager-1',
    created_at: '2023-06-01T10:00:00Z',
    leader_name: 'Maria Santos',
    member_count: 5
  },
  {
    id: 'mock-team-2',
    nome: 'UX/UI Design',
    descricao: 'Equipe de design e experiência do usuário',
    created_by: 'mock-manager-2',
    created_at: '2023-07-01T10:00:00Z',
    leader_name: 'Carlos Lima',
    member_count: 3
  }
];

export const mockCompetencies = [
  {
    id: 'mock-comp-1',
    name: 'React Development',
    type: 'Hard' as const,
    selfScore: 7,
    managerScore: 6,
    divergence: 1,
    description: 'Desenvolvimento de aplicações React modernas',
    hasAssessments: true
  },
  {
    id: 'mock-comp-2',
    name: 'Comunicação',
    type: 'Soft' as const,
    selfScore: 8,
    managerScore: 8,
    divergence: 0,
    description: 'Habilidades de comunicação interpessoal',
    hasAssessments: true
  },
  {
    id: 'mock-comp-3',
    name: 'TypeScript',
    type: 'Hard' as const,
    selfScore: 0,
    managerScore: 0,
    divergence: 0,
    description: 'Desenvolvimento com TypeScript',
    hasAssessments: false
  }
];

export const mockCareerTrack = {
  id: 'mock-track-1',
  nome: 'Desenvolvedor Frontend',
  descricao: 'Trilha de carreira para desenvolvimento frontend',
  created_at: '2023-01-01T10:00:00Z'
};

export const mockCareerStages = [
  {
    id: 'mock-stage-1',
    trilha_id: 'mock-track-1',
    nome: 'Junior Developer',
    ordem: 1,
    etapa: 'desenvolvimento' as const,
    salario_min: 4000,
    salario_max: 6000,
    flexivel_salario: false,
    created_at: '2023-01-01T10:00:00Z'
  },
  {
    id: 'mock-stage-2',
    trilha_id: 'mock-track-1',
    nome: 'Mid-level Developer',
    ordem: 2,
    etapa: 'desenvolvimento' as const,
    salario_min: 6000,
    salario_max: 10000,
    flexivel_salario: false,
    created_at: '2023-01-01T10:00:00Z'
  },
  {
    id: 'mock-stage-3',
    trilha_id: 'mock-track-1',
    nome: 'Senior Developer',
    ordem: 3,
    etapa: 'especializacao' as const,
    salario_min: 10000,
    salario_max: 15000,
    flexivel_salario: true,
    created_at: '2023-01-01T10:00:00Z'
  }
];

export const mockHRRecords = [
  {
    id: 'mock-hr-1',
    user_id: 'mock-user-1',
    titulo: 'Consulta Individual',
    conteudo: 'Sessão de acompanhamento psicológico',
    tipo: 'sessao',
    data_sessao: '2024-01-20',
    created_by: 'mock-hr-1',
    created_at: '2024-01-15T10:00:00Z',
    display_name: 'João Silva',
    confidential: false
  }
];

export const mockHRTests = [
  {
    id: 'mock-test-1',
    user_id: 'mock-user-1',
    nome_teste: 'Teste de Bem-estar',
    resultado: {
      score: 7,
      interpretation: 'Resultado dentro da normalidade',
      recommendations: ['Manter práticas de autocuidado']
    },
    solicitado_por: 'mock-hr-1',
    realizado_em: '2024-01-18T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    display_name: 'João Silva',
    confidential: false,
    status: 'completed' as const
  }
];

export const mockActionGroups = [
  {
    id: 'mock-group-1',
    name: 'Melhoria de Processos',
    description: 'Otimização dos processos de desenvolvimento',
    status: 'active' as const,
    members: 6,
    tasks: 8,
    completedTasks: 5,
    progress: 62,
    coordinator: 'Ana Silva'
  }
];

export const mockDashboardStats = {
  colaborador: {
    activeObjectives: 2,
    achievements: 2,
    progress: '65%',
    competencies: 3
  },
  gestor: {
    teamMembers: 5,
    pendingAssessments: 3,
    approvedPDIs: 8,
    bonuses: 2
  },
  rh: {
    appointments: 4,
    followUps: 2,
    pendingTests: 1,
    activeUsers: 25
  },
  admin: {
    totalUsers: 25,
    activeTracks: 3,
    completedAssessments: 45,
    actionGroups: 2
  }
};

export const mockRecentActivity = [
  {
    id: 'mock-activity-1',
    type: 'pdi',
    title: 'Objetivo PDI: Aprender React Avançado',
    description: 'Status: em_andamento',
    timestamp: '2024-01-15T10:00:00Z',
    user: 'João Silva'
  },
  {
    id: 'mock-activity-2',
    type: 'assessment',
    title: 'Avaliação: React Development',
    description: 'Nota: 7/10 (self)',
    timestamp: '2024-01-14T15:30:00Z',
    user: 'João Silva'
  }
];