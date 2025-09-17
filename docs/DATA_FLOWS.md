# Fluxos de Dados - Sistema DEA PDI

## 1. Fluxo de Autenticação Detalhado

### 1.1 Inicialização da Aplicação
```typescript
// src/contexts/AuthContext.tsx
useEffect(() => {
  const getInitialSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.user) {
      await loadUserProfile(session.user);
    } else {
      setLoading(false);
    }
  };
  
  getInitialSession();
  
  // Listener para mudanças de estado
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    }
  );
}, []);
```

### 1.2 Processo de Login
```
1. Usuário preenche LoginForm (email/password)
2. AuthContext.login() → supabase.auth.signInWithPassword()
3. Supabase Auth valida credenciais
4. Se válido: onAuthStateChange dispara 'SIGNED_IN'
5. loadUserProfile() busca dados em profiles table
6. getUserProfile() executa query com RLS
7. Perfil carregado → setUser() → App renderiza dashboard
```

### 1.3 Processo de Signup
```
1. Usuário preenche formulário (email/password/nome/role)
2. AuthContext.signup() → supabase.auth.signUp()
3. Supabase cria usuário na tabela auth.users
4. createUserProfile() insere registro na tabela profiles
5. Se email confirmation necessária → usuário recebe email
6. Após confirmação → login automático ou manual
```

### 1.4 Carregamento de Perfil
```typescript
const loadUserProfile = async (supabaseUser: SupabaseUser) => {
  // Timeout de 15s para evitar travamento
  const profilePromise = getUserProfile(supabaseUser.id);
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Profile loading timeout')), 15000)
  );
  
  const profile = await Promise.race([profilePromise, timeoutPromise]);
  
  if (profile) {
    const user: User = {
      id: profile.user_id,
      nome: profile.nome,
      email: profile.email,
      role: profile.role,
      // ... outros campos
      avatar: generateAvatarUrl(profile.nome)
    };
    
    setUser(user);
    setLoading(false);
  }
};
```

## 2. Fluxos de Dados por Funcionalidade

### 2.1 Dashboard
```typescript
// src/pages/Dashboard.tsx
// Dados são carregados por componentes específicos:

// DashboardStats - métricas baseadas no role do usuário
const getStatsForRole = () => {
  switch (user?.role) {
    case 'colaborador': return [objetivos, conquistas, progresso, competências];
    case 'gestor': return [liderados, avaliações, pdis, bonificações];
    case 'rh': return [agenda, acompanhamentos, testes, colaboradores];
    case 'admin': return [usuários, trilhas, avaliações, grupos];
  }
};

// RecentActivity - atividades recentes do usuário
// QuickActions - ações rápidas baseadas no role
```

### 2.2 Gestão de Equipes (Teams)
```typescript
// src/pages/Teams.tsx
const fetchTeams = async () => {
  // 1. Buscar equipes
  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, nome, descricao, created_by, created_at')
    .order('created_at', { ascending: false });

  // 2. Enriquecer com dados do líder
  const teamsWithLeaders = await Promise.all(
    teamsData.map(async (team) => {
      const { data: leaderData } = await supabase
        .from('profiles')
        .select('nome')
        .eq('user_id', team.created_by)
        .single();

      // 3. Contar membros
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('time_id', team.id);

      return { ...team, leader_name: leaderData?.nome, member_count: count };
    })
  );
};
```

### 2.3 PDI (Plano de Desenvolvimento Individual)
```typescript
// src/components/pdi/PDIObjectives.tsx
const fetchObjectives = async () => {
  // 1. Buscar objetivos do usuário
  const { data } = await supabase
    .from('pdi_objectives')
    .select('*')
    .eq('colaborador_id', user.id)
    .order('created_at', { ascending: false });

  // 2. Enriquecer com dados relacionados
  const enrichedObjectives = await Promise.all(
    data.map(async (objective) => {
      let enriched = { ...objective };

      // Competência relacionada
      if (objective.competency_id) {
        const { data: competency } = await supabase
          .from('competencies')
          .select('nome')
          .eq('id', objective.competency_id)
          .single();
        enriched.competency_name = competency?.nome;
      }

      // Mentor
      if (objective.mentor_id) {
        const { data: mentor } = await supabase
          .from('profiles')
          .select('nome')
          .eq('user_id', objective.mentor_id)
          .single();
        enriched.mentor_name = mentor?.nome;
      }

      // Contagem de comentários
      const { count } = await supabase
        .from('pdi_comments')
        .select('*', { count: 'exact', head: true })
        .eq('objective_id', objective.id);
      enriched.comments_count = count || 0;

      return enriched;
    })
  );
};
```

### 2.4 Competências e Avaliações
```typescript
// src/pages/Competencies.tsx
const fetchCompetencies = async () => {
  // 1. Buscar trilha do usuário
  let userTrackId = user.trilha_id;
  if (!userTrackId) {
    const { data: tracks } = await supabase
      .from('career_tracks')
      .select('id')
      .limit(1);
    userTrackId = tracks?.[0]?.id;
  }

  // 2. Buscar estágios da trilha
  const { data: stages } = await supabase
    .from('career_stages')
    .select('id')
    .eq('trilha_id', userTrackId);

  // 3. Buscar competências dos estágios
  const { data: competenciesData } = await supabase
    .from('competencies')
    .select('*')
    .in('stage_id', stageIds);

  // 4. Buscar avaliações do usuário
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('avaliado_id', user.id)
    .in('competency_id', competencyIds);

  // 5. Processar e combinar dados
  const processedCompetencies = competenciesData.map(comp => {
    const compAssessments = assessments.filter(a => a.competency_id === comp.id);
    const selfAssessment = compAssessments.find(a => a.tipo === 'self');
    const managerAssessment = compAssessments.find(a => a.tipo === 'manager');
    
    return {
      id: comp.id,
      name: comp.nome,
      type: comp.tipo === 'hard_skill' ? 'Hard' : 'Soft',
      selfScore: selfAssessment?.nota || 0,
      managerScore: managerAssessment?.nota || 0,
      divergence: (selfAssessment?.nota || 0) - (managerAssessment?.nota || 0),
      hasAssessments: compAssessments.length > 0
    };
  });
};
```

### 2.5 Saúde Mental e Bem-estar (RH)
```typescript
// src/pages/MentalHealth.tsx
const fetchHRData = async () => {
  // 1. Buscar registros de RH
  const { data: records } = await supabase
    .from('hr_records')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // 2. Enriquecer com nomes (respeitando confidencialidade)
  const enrichedRecords = await Promise.all(
    records.map(async (record) => {
      let displayName = 'Paciente Confidencial';
      
      // Mostrar nome real apenas para RH ou próprio usuário
      if (user.role === 'rh' || record.user_id === user.id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('nome')
          .eq('user_id', record.user_id)
          .single();
        displayName = userData?.nome || displayName;
      }

      return {
        ...record,
        display_name: displayName,
        confidential: user.role !== 'rh' && record.user_id !== user.id
      };
    })
  );

  // 3. Calcular estatísticas baseadas no role
  if (user.role === 'rh') {
    // RH vê estatísticas globais
    const { count: appointmentsCount } = await supabase
      .from('hr_records')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'sessao');
    // ... outras estatísticas
  } else {
    // Usuários veem apenas suas próprias estatísticas
    const { count: userAppointments } = await supabase
      .from('hr_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('tipo', 'sessao');
  }
};
```

## 3. Padrões de Acesso a Dados

### 3.1 Padrão de Enriquecimento de Dados
```typescript
// Padrão comum: buscar dados principais + enriquecer com relacionamentos
const fetchAndEnrichData = async () => {
  // 1. Query principal
  const { data: mainData } = await supabase.from('table').select('*');
  
  // 2. Enriquecimento paralelo
  const enrichedData = await Promise.all(
    mainData.map(async (item) => {
      const [relatedData1, relatedData2] = await Promise.all([
        supabase.from('related1').select('*').eq('id', item.related1_id).single(),
        supabase.from('related2').select('*').eq('id', item.related2_id)
      ]);
      
      return { ...item, related1: relatedData1.data, related2: relatedData2.data };
    })
  );
};
```

### 3.2 Padrão de Filtragem por Role
```typescript
// Diferentes queries baseadas no role do usuário
const fetchDataByRole = async () => {
  let query = supabase.from('table').select('*');
  
  switch (user.role) {
    case 'admin':
      // Admin vê tudo
      break;
    case 'rh':
      // RH vê dados de bem-estar
      query = query.in('tipo', ['sessao', 'teste', 'acompanhamento']);
      break;
    case 'gestor':
      // Gestor vê sua equipe
      query = query.eq('gestor_id', user.id);
      break;
    case 'colaborador':
      // Colaborador vê apenas seus dados
      query = query.eq('user_id', user.id);
      break;
  }
  
  const { data } = await query;
  return data;
};
```

### 3.3 Padrão de Tratamento de Erros
```typescript
const safeDataFetch = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.from('table').select('*');
    
    if (error) throw error;
    
    setData(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Erro ao carregar dados. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
```

## 4. Otimizações Identificadas

### 4.1 Problemas de Performance
- **N+1 Queries**: Múltiplas queries sequenciais para enriquecer dados
- **Falta de Índices**: Queries podem ser lentas sem índices adequados
- **Sem Cache**: Dados são sempre buscados do servidor
- **Timeout Longo**: 15s pode ser muito para UX

### 4.2 Melhorias Sugeridas
- **Joins no Supabase**: Usar `select('*, profiles(*)')` para relacionamentos
- **React Query**: Cache e sincronização de dados
- **Lazy Loading**: Componentes e dados sob demanda
- **Debounce**: Para buscas e filtros
- **Paginação**: Para listas grandes