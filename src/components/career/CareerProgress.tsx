import React from 'react';
import { ChevronRight, Award, Star } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

interface Stage {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  competencies: number;
  salaryRange: string;
}

const CareerProgress: React.FC = () => {
  const currentTrack = 'Desenvolvedor Frontend';
  const stages: Stage[] = [
    {
      id: '1',
      title: 'Estagiário',
      description: 'Aprendendo fundamentos',
      completed: true,
      current: false,
      competencies: 8,
      salaryRange: 'R$ 1.500 - R$ 2.500'
    },
    {
      id: '2',
      title: 'Assistente',
      description: 'Desenvolvendo autonomia',
      completed: true,
      current: false,
      competencies: 12,
      salaryRange: 'R$ 2.500 - R$ 4.000'
    },
    {
      id: '3',
      title: 'Júnior',
      description: 'Executando tarefas com supervisão',
      completed: true,
      current: false,
      competencies: 15,
      salaryRange: 'R$ 4.000 - R$ 6.500'
    },
    {
      id: '4',
      title: 'Pleno',
      description: 'Trabalhando com autonomia',
      completed: false,
      current: true,
      competencies: 18,
      salaryRange: 'R$ 6.500 - R$ 10.000'
    },
    {
      id: '5',
      title: 'Sênior',
      description: 'Mentorando outros desenvolvedores',
      completed: false,
      current: false,
      competencies: 22,
      salaryRange: 'R$ 10.000 - R$ 15.000'
    },
    {
      id: '6',
      title: 'Especialista',
      description: 'Referência técnica',
      completed: false,
      current: false,
      competencies: 25,
      salaryRange: 'Flexível + Bônus'
    }
  ];

  const currentStageIndex = stages.findIndex(stage => stage.current);
  const progress = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Trilha de Carreira</h3>
          <p className="text-gray-600">{currentTrack}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Progresso Geral</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <ProgressBar current={currentStageIndex + 1} total={stages.length} label="Evolução na Trilha" />
      </div>

      {/* Stages Timeline */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            <div className={`flex items-center p-4 rounded-lg border-2 transition-all ${
              stage.current 
                ? 'border-blue-200 bg-blue-50' 
                : stage.completed 
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              {/* Status Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                stage.completed 
                  ? 'bg-green-500' 
                  : stage.current 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}>
                {stage.completed ? (
                  <Award className="w-5 h-5 text-white" />
                ) : stage.current ? (
                  <Star className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold ${
                    stage.current ? 'text-blue-900' : stage.completed ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {stage.title}
                  </h4>
                  <span className="text-sm text-gray-500">{stage.salaryRange}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-xs text-gray-500">{stage.competencies} competências</span>
                  {stage.current && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Estágio Atual
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow for non-final stages */}
              {index < stages.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={() => {
            alert('Proposta de avanço enviada para aprovação do gestor!');
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
        >
          Propor Avanço para Sênior
        </button>
      </div>
    </div>
  );
};

export default CareerProgress;