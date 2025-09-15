import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, Target, Users, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';
import { achievementsService } from '../../services/supabase/achievements';

const AchievementsList: React.FC = () => {
  const { user } = useAuth();
  const { useMockData, setUseFallback } = useFeatureFlags();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    
    try {
      const data = await achievementsService.getUserAchievements(user.id, useMockData, setUseFallback);
      setAchievements(data || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Conquistas</h3>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            onClick={() => {
              alert(`Conquista: ${achievement.titulo}\n${achievement.descricao}\nDesbloqueada em: ${new Date(achievement.conquistado_em).toLocaleDateString('pt-BR')}`);
            }}
            className="p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 border-yellow-200 bg-yellow-50"
          >
            <div className="flex items-start space-x-3">
              <div className="text-3xl">
                🏆
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-yellow-800">
                    {achievement.titulo}
                  </h4>
                  <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
                
                <p className="text-sm mb-3 text-yellow-700">
                  {achievement.descricao}
                </p>

                {achievement.pdi_objectives && (
                  <p className="text-xs text-yellow-600 mb-2">
                    Relacionado ao objetivo: {achievement.pdi_objectives.titulo}
                  </p>
                )}

                <p className="text-xs text-yellow-600">
                  Desbloqueado em {new Date(achievement.conquistado_em).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {achievements.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma conquista ainda</h3>
            <p className="text-gray-600 mb-6">Complete objetivos PDI para desbloquear suas primeiras conquistas!</p>
            <button 
              onClick={() => window.location.hash = '#pdi'}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Ver Objetivos PDI
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AchievementsList;