import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import PDIObjectives from '../components/pdi/PDIObjectives';
import PDIComments from '../components/pdi/PDIComments';
import AchievementsList from '../components/achievements/AchievementsList';
import { Target, Award, TrendingUp, Users } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';

const PDI: React.FC = () => {
  const [currentCycle] = useState('2024-H1');
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);

  return (
    <div>
      <Header 
        title="Plano de Desenvolvimento Individual"
        subtitle={`Ciclo ${currentCycle}`}
      />
      
      <div className="p-8 space-y-8">
        {/* PDI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Objetivos Ativos"
            value="4"
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Completados"
            value="7"
            icon={Award}
            color="green"
          />
          <StatCard
            title="Progresso Geral"
            value="67%"
            icon={TrendingUp}
            color="yellow"
          />
          <StatCard
            title="Mentores"
            value="2"
            icon={Users}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main PDI Content */}
          <div className="lg:col-span-2">
            <PDIObjectives onSelectObjective={setSelectedObjectiveId} />
            
            {/* Comments Section */}
            {selectedObjectiveId && (
              <div className="mt-8">
                <PDIComments objectiveId={selectedObjectiveId} />
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <AchievementsList />

            {/* Progress by Competency */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso por Área</h3>
              
              <div className="space-y-4">
                {[
                  { area: 'Desenvolvimento Frontend', current: 12, total: 18, color: 'blue' as const },
                  { area: 'UX/UI Design', current: 8, total: 15, color: 'green' as const },
                  { area: 'Liderança', current: 3, total: 12, color: 'yellow' as const },
                  { area: 'Comunicação', current: 7, total: 10, color: 'indigo' as const }
                ].map((area, index) => (
                  <div key={index}>
                    <ProgressBar
                      current={area.current}
                      total={area.total}
                      label={area.area}
                      color={area.color}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDI;