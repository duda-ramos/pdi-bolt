import React, { useState, useEffect } from 'react';
import { Target, Award, TrendingUp, Users, Brain, CheckCircle } from 'lucide-react';
import StatCard from '../common/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { dashboardService } from '../../services/supabase/dashboard';

const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const { useMockData, setUseFallback } = useFeatureFlags();
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const data = await dashboardService.getStats(user.id, user.role, useMockData, setUseFallback);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsForRole = () => {
    if (loading) {
      return [
        { title: 'Carregando...', value: '-', icon: Target, color: 'blue' as const },
        { title: 'Carregando...', value: '-', icon: Award, color: 'yellow' as const },
        { title: 'Carregando...', value: '-', icon: TrendingUp, color: 'green' as const },
        { title: 'Carregando...', value: '-', icon: CheckCircle, color: 'indigo' as const }
      ];
    }

    switch (user?.role) {
      case 'colaborador':
        return [
          { title: 'Objetivos Ativos', value: stats.activeObjectives || 0, icon: Target, color: 'blue' as const },
          { title: 'Conquistas', value: stats.achievements || 0, icon: Award, color: 'yellow' as const },
          { title: 'Progresso PDI', value: stats.progress || '0%', icon: TrendingUp, color: 'green' as const },
          { title: 'Competências', value: stats.competencies || 0, icon: CheckCircle, color: 'indigo' as const }
        ];
      
      case 'gestor':
        return [
          { title: 'Liderados', value: stats.teamMembers || 0, icon: Users, color: 'blue' as const },
          { title: 'Avaliações Pendentes', value: stats.pendingAssessments || 0, icon: Target, color: 'yellow' as const },
          { title: 'PDIs Aprovados', value: stats.approvedPDIs || 0, icon: CheckCircle, color: 'green' as const },
          { title: 'Bonificações', value: stats.bonuses || 0, icon: Award, color: 'indigo' as const }
        ];
      
      case 'rh':
        return [
          { title: 'Agenda Clínica', value: stats.appointments || 0, icon: Brain, color: 'blue' as const },
          { title: 'Acompanhamentos', value: stats.followUps || 0, icon: Target, color: 'yellow' as const },
          { title: 'Testes Pendentes', value: stats.pendingTests || 0, icon: CheckCircle, color: 'green' as const },
          { title: 'Colaboradores', value: stats.activeUsers || 0, icon: Users, color: 'indigo' as const }
        ];
      
      case 'admin':
        return [
          { title: 'Usuários Ativos', value: stats.totalUsers || 0, icon: Users, color: 'blue' as const },
          { title: 'Trilhas Ativas', value: stats.activeTracks || 0, icon: TrendingUp, color: 'green' as const },
          { title: 'Avaliações Completas', value: stats.completedAssessments || 0, icon: CheckCircle, color: 'indigo' as const },
          { title: 'Grupos de Ação', value: stats.actionGroups || 0, icon: Target, color: 'yellow' as const }
        ];
      
      default:
        return [];
    }
  };

  const displayStats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats;