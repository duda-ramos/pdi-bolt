import { supabase } from '../../lib/supabase';

export const dashboardService = {
  async getStats(userId: string, userRole: string) {
    const stats: Record<string, any> = {};

    switch (userRole) {
      case 'colaborador':
        // Objetivos ativos
        const { count: activeObjectives } = await supabase
          .from('pdi_objectives')
          .select('*', { count: 'exact', head: true })
          .eq('colaborador_id', userId)
          .in('objetivo_status', ['pendente', 'em_andamento']);

        // Conquistas
        const { count: achievements } = await supabase
          .from('achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Progresso PDI (média dos objetivos)
        const { data: objectives } = await supabase
          .from('pdi_objectives')
          .select('pontos_extra')
          .eq('colaborador_id', userId);

        const avgProgress = objectives?.length 
          ? Math.round(objectives.reduce((sum, obj) => sum + (obj.pontos_extra || 0), 0) / objectives.length)
          : 0;

        // Competências avaliadas
        const { data: competencies } = await supabase
          .from('assessments')
          .select('competency_id')
          .eq('avaliado_id', userId);

        const uniqueCompetencies = new Set(competencies?.map(c => c.competency_id)).size;

        stats.activeObjectives = activeObjectives || 0;
        stats.achievements = achievements || 0;
        stats.progress = `${avgProgress}%`;
        stats.competencies = uniqueCompetencies;
        break;

      case 'gestor':
        // Liderados
        const { count: teamMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('gestor_id', userId);

        // Avaliações pendentes
        const { count: pendingAssessments } = await supabase
          .from('pdi_objectives')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'proposto_colaborador')
          .in('colaborador_id', 
            supabase.from('profiles').select('user_id').eq('gestor_id', userId)
          );

        stats.teamMembers = teamMembers || 0;
        stats.pendingAssessments = pendingAssessments || 0;
        break;

      case 'rh':
        // Agenda clínica
        const { count: appointments } = await supabase
          .from('hr_records')
          .select('*', { count: 'exact', head: true })
          .eq('tipo', 'sessao')
          .gte('data_sessao', new Date().toISOString().split('T')[0]);

        // Colaboradores ativos
        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        stats.appointments = appointments || 0;
        stats.activeUsers = activeUsers || 0;
        break;

      case 'admin':
        // Usuários ativos
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        // Trilhas ativas
        const { count: activeTracks } = await supabase
          .from('career_tracks')
          .select('*', { count: 'exact', head: true });

        stats.totalUsers = totalUsers || 0;
        stats.activeTracks = activeTracks || 0;
        break;
    }

    return stats;
  },

  async getRecentActivity(userId: string, userRole: string) {
    const activities: any[] = [];

    // PDI Objectives
    const { data: pdiActivities } = await supabase
      .from('pdi_objectives')
      .select(`
        id, titulo, objetivo_status, updated_at,
        profiles!colaborador_id(nome)
      `)
      .or(
        userRole === 'admin' || userRole === 'rh' 
          ? undefined 
          : `colaborador_id.eq.${userId},mentor_id.eq.${userId}`
      )
      .order('updated_at', { ascending: false })
      .limit(10);

    pdiActivities?.forEach(activity => {
      activities.push({
        id: activity.id,
        type: 'pdi',
        title: `Objetivo PDI: ${activity.titulo}`,
        description: `Status: ${activity.objetivo_status}`,
        timestamp: activity.updated_at,
        user: activity.profiles?.nome
      });
    });

    // Assessments
    const { data: assessmentActivities } = await supabase
      .from('assessments')
      .select(`
        id, nota, tipo, created_at,
        competencies(nome),
        profiles!avaliado_id(nome)
      `)
      .or(
        userRole === 'admin' || userRole === 'rh'
          ? undefined
          : `avaliado_id.eq.${userId},avaliador_id.eq.${userId}`
      )
      .order('created_at', { ascending: false })
      .limit(10);

    assessmentActivities?.forEach(activity => {
      activities.push({
        id: activity.id,
        type: 'assessment',
        title: `Avaliação: ${activity.competencies?.nome}`,
        description: `Nota: ${activity.nota}/10 (${activity.tipo})`,
        timestamp: activity.created_at,
        user: activity.profiles?.nome
      });
    });

    // Sort by timestamp and return top 20
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  }
};