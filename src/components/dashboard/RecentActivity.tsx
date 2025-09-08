import React from 'react';
import { CheckCircle, MessageCircle, Award, TrendingUp, Clock } from 'lucide-react';
import Badge from '../common/Badge';

interface Activity {
  id: string;
  type: 'pdi' | 'assessment' | 'achievement' | 'feedback';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

const RecentActivity: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'Nova Conquista Desbloqueada!',
      description: 'Conquistou "Mentor Colaborativo" por ajudar 3 colegas',
      timestamp: '2 horas atrás',
      icon: <Award className="w-4 h-4" />,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: '2',
      type: 'pdi',
      title: 'Objetivo PDI Completado',
      description: 'Finalizou "Curso de React Avançado" - aguardando aprovação',
      timestamp: '1 dia atrás',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: '3',
      type: 'feedback',
      title: 'Novo Feedback Recebido',
      description: 'Carlos Santos deixou comentários no seu PDI',
      timestamp: '2 dias atrás',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '4',
      type: 'assessment',
      title: 'Avaliação Disponível',
      description: 'Nova avaliação de competências técnicas liberada',
      timestamp: '3 dias atrás',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-indigo-600 bg-indigo-100'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${activity.color}`}>
              {activity.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        onClick={() => {
          alert('Carregando todas as atividades...');
        }}
      >
        Ver todas as atividades
      </button>
    </div>
  );
};

export default RecentActivity;