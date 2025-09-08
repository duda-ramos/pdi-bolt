import React from 'react';
import { Award, Star, Trophy, Target, Users, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

const AchievementsList: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Aprendiz Dedicado',
      description: 'Complete 5 objetivos de aprendizado',
      icon: '🎓',
      unlocked: true,
      unlockedAt: '2024-01-15',
      progress: 5,
      total: 5
    },
    {
      id: '2',
      name: 'Mentor Colaborativo',
      description: 'Ajude 3 colegas em seus objetivos',
      icon: '🤝',
      unlocked: true,
      unlockedAt: '2024-01-10',
      progress: 3,
      total: 3
    },
    {
      id: '3',
      name: 'Inovador',
      description: 'Implemente uma melhoria significativa',
      icon: '💡',
      unlocked: true,
      unlockedAt: '2024-01-05',
      progress: 1,
      total: 1
    },
    {
      id: '4',
      name: 'Especialista',
      description: 'Alcance nível 9+ em uma competência técnica',
      icon: '⚡',
      unlocked: false,
      progress: 8,
      total: 9
    },
    {
      id: '5',
      name: 'Líder Natural',
      description: 'Coordene 2 grupos de ação com sucesso',
      icon: '👑',
      unlocked: false,
      progress: 1,
      total: 2
    },
    {
      id: '6',
      name: 'Mestre PDI',
      description: 'Complete 10 objetivos PDI',
      icon: '🏆',
      unlocked: false,
      progress: 7,
      total: 10
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Conquistas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            onClick={() => {
              if (achievement.unlocked) {
                alert(`Conquista: ${achievement.name}\n${achievement.description}\nDesbloqueada em: ${achievement.unlockedAt}`);
              } else {
                alert(`Progresso: ${achievement.progress}/${achievement.total}\n${achievement.description}`);
              }
            }}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
              achievement.unlocked
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`font-medium ${
                    achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h4>
                  {achievement.unlocked && (
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                
                <p className={`text-sm mb-3 ${
                  achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress */}
                {achievement.progress !== undefined && achievement.total !== undefined && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Progresso</span>
                      <span className="text-gray-900 font-medium">
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          achievement.unlocked ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-yellow-600">
                    Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsList;