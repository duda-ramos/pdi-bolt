import React from 'react';
import React, { useState, useEffect } from 'react';
import { CheckCircle, MessageCircle, Award, TrendingUp, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/supabase/dashboard';

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    
    try {
      const data = await dashboardService.getRecentActivity(user.id, user.role);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'pdi': return <CheckCircle className="w-4 h-4" />;
      case 'assessment': return <TrendingUp className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'pdi': return 'text-green-600 bg-green-100';
      case 'assessment': return 'text-indigo-600 bg-indigo-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return `${Math.floor(diffInHours / 24)} dias atrás`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              {activity.user && (
                <p className="text-xs text-gray-500">por {activity.user}</p>
              )}
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>Nenhuma atividade recente encontrada.</p>
          </div>
        )}
      </div>
      )}
      
      <button 
        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        onClick={() => {
          loadActivities();
        }}
      >
        Atualizar atividades
      </button>
    </div>
  );
};

export default RecentActivity;