import React from 'react';
import { ChevronRight, Award, Star } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';

interface CareerTrack {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
}

interface CareerStage {
  id: string;
  trilha_id: string;
  nome: string;
  ordem: number;
  etapa: 'desenvolvimento' | 'especializacao';
  salario_min: number | null;
  salario_max: number | null;
  flexivel_salario: boolean | null;
  created_at: string;
}

interface CareerProgressProps {
  careerTrack: CareerTrack | null;
  stages: CareerStage[];
  currentStageId?: string;
}

const CareerProgress: React.FC<CareerProgressProps> = ({ 
  careerTrack, 
  stages, 
  currentStageId 
}) => {
  const formatSalaryRange = (stage: CareerStage) => {
    if (stage.flexivel_salario) {
      return 'Flexível + Bônus';
    }
    if (stage.salario_min && stage.salario_max) {
      return `R$ ${stage.salario_min.toLocaleString()} - R$ ${stage.salario_max.toLocaleString()}`;
    }
    return 'Não informado';
  };

  const getStageStatus = (stage: CareerStage, index: number) => {
    if (!currentStageId) {
      // Se não há estágio atual definido, considerar o primeiro como atual
      return index === 0 ? 'current' : 'future';
    }
    
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'future';
  };

  const currentStageIndex = currentStageId 
    ? stages.findIndex(s => s.id === currentStageId)
    : 0;
  
  const progress = stages.length > 0 
    ? ((currentStageIndex + 1) / stages.length) * 100 
    : 0;

  if (!careerTrack || stages.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trilha de Carreira</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhuma trilha de carreira configurada.</p>
          <p className="text-sm text-gray-500 mt-2">Entre em contato com o RH para configurar sua trilha.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Trilha de Carreira</h3>
          <p className="text-gray-600">{careerTrack.nome}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Progresso Geral</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <ProgressBar 
          current={currentStageIndex + 1} 
          total={stages.length} 
          label="Evolução na Trilha" 
        />
      </div>

      {/* Stages Timeline */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage, index);
          
          return (
            <div key={stage.id} className="relative">
              <div className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                status === 'current'
                  ? 'border-blue-200 bg-blue-50' 
                  : status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed'
                    ? 'bg-green-500' 
                    : status === 'current'
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}>
                  {status === 'completed' ? (
                    <Award className="w-5 h-5 text-white" />
                  ) : status === 'current' ? (
                    <Star className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold text-sm">{stage.ordem}</span>
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${
                      status === 'current' 
                        ? 'text-blue-900' 
                        : status === 'completed' 
                        ? 'text-green-900' 
                        : 'text-gray-700'
                    }`}>
                      {stage.nome}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {formatSalaryRange(stage)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-2 space-x-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stage.etapa === 'desenvolvimento'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {stage.etapa === 'desenvolvimento' ? 'Desenvolvimento' : 'Especialização'}
                    </span>
                    
                    {status === 'current' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Estágio Atual
                      </span>
                    )}
                    
                    {status === 'completed' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Concluído
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
          );
        })}
      </div>

      {/* Action Button */}
      {currentStageIndex < stages.length - 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => {
              const nextStage = stages[currentStageIndex + 1];
              alert(`Proposta de avanço para "${nextStage?.nome}" enviada para aprovação do gestor!`);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            {stages[currentStageIndex + 1] 
              ? `Propor Avanço para ${stages[currentStageIndex + 1].nome}`
              : 'Propor Avanço'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerProgress;