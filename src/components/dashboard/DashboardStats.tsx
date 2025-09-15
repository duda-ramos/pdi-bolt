import React from 'react';
import { Target, Award, TrendingUp, Users, Brain, CheckCircle } from 'lucide-react';
import StatCard from '../common/StatCard';
import { useAuth } from '../../contexts/AuthContext';

const DashboardStats: React.FC = () => {
  const { user } = useAuth();

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'colaborador':
        return [
          { title: 'Objetivos Ativos', value: '4', icon: Target, color: 'blue' as const },
          { title: 'Conquistas', value: '12', icon: Award, color: 'yellow' as const },
          { title: 'Progresso PDI', value: '67%', icon: TrendingUp, color: 'green' as const },
          { title: 'Competências', value: '8/12', icon: CheckCircle, color: 'indigo' as const }
        ];
      
      case 'gestor':
        return [
          { title: 'Liderados', value: '8', icon: Users, color: 'blue' as const },
          { title: 'Avaliações Pendentes', value: '3', icon: Target, color: 'yellow' as const },
          { title: 'PDIs Aprovados', value: '5', icon: CheckCircle, color: 'green' as const },
          { title: 'Bonificações', value: '2', icon: Award, color: 'indigo' as const }
        ];
      
      case 'rh':
        return [
          { title: 'Agenda Clínica', value: '6', icon: Brain, color: 'blue' as const },
          { title: 'Acompanhamentos', value: '12', icon: Target, color: 'yellow' as const },
          { title: 'Testes Pendentes', value: '4', icon: CheckCircle, color: 'green' as const },
          { title: 'Colaboradores', value: '45', icon: Users, color: 'indigo' as const }
        ];
      
      case 'admin':
        return [
          { title: 'Usuários Ativos', value: '45', icon: Users, color: 'blue' as const },
          { title: 'Trilhas Ativas', value: '8', icon: TrendingUp, color: 'green' as const },
          { title: 'Avaliações Completas', value: '38', icon: CheckCircle, color: 'indigo' as const },
          { title: 'Grupos de Ação', value: '6', icon: Target, color: 'yellow' as const }
        ];
      
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
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