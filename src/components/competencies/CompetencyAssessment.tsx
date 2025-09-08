import React, { useState } from 'react';
import { Award, BarChart3, User, TrendingUp } from 'lucide-react';
import Badge from '../common/Badge';
import AssessmentForm from '../assessment/AssessmentForm';

interface CompetencyAssessmentProps {
  competencies: Array<{
    id: string;
    name: string;
    type: 'Hard' | 'Soft';
    selfScore: number;
    managerScore: number;
    divergence: number;
  }>;
}

const CompetencyAssessment: React.FC<CompetencyAssessmentProps> = ({ competencies }) => {
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);

  const sampleQuestions = [
    {
      id: '1',
      text: 'Tenho domínio técnico suficiente para executar minhas tarefas com autonomia',
      type: 'scale' as const,
      required: true
    },
    {
      id: '2', 
      text: 'Consigo resolver problemas complexos relacionados à minha área',
      type: 'scale' as const,
      required: true
    },
    {
      id: '3',
      text: 'Descreva uma situação onde você aplicou esta competência recentemente',
      type: 'text' as const,
      required: false
    }
  ];

  const handleStartAssessment = (competencyId: string) => {
    setSelectedCompetency(competencyId);
    setShowAssessment(true);
  };

  const handleSubmitAssessment = (answers: Record<string, any>) => {
    // Calculate score based on answers
    const scaleAnswers = Object.values(answers).filter(answer => typeof answer === 'number');
    const averageScore = scaleAnswers.reduce((sum, score) => sum + score, 0) / scaleAnswers.length;
    
    // Update competency score
    const updatedCompetencies = competencies.map(comp => 
      comp.id === selectedCompetency 
        ? { ...comp, selfScore: Math.round(averageScore) }
        : comp
    );
    
    alert(`Avaliação concluída! Pontuação: ${Math.round(averageScore)}/10`);
    setShowAssessment(false);
    setSelectedCompetency(null);
  };

  const selectedCompetencyData = competencies.find(c => c.id === selectedCompetency);

  if (showAssessment && selectedCompetencyData) {
    return (
      <AssessmentForm
        competencyName={selectedCompetencyData.name}
        questions={sampleQuestions}
        onSubmit={handleSubmitAssessment}
        onCancel={() => {
          setShowAssessment(false);
          setSelectedCompetency(null);
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Suas Competências</h3>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <BarChart3 className="w-4 h-4" />
            <span>Ver Relatórios</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {competencies.map((competency) => (
          <div
            key={competency.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-gray-900">{competency.name}</h4>
                <Badge variant={competency.type === 'Hard' ? 'info' : 'success'}>
                  {competency.type}
                </Badge>
              </div>
              
              <button
                onClick={() => handleStartAssessment(competency.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Avaliar
              </button>
            </div>
            
            {/* Divergence Indicator */}
            <div className={`text-sm font-medium mb-3 ${
              competency.divergence === 0 ? 'text-green-600' :
              Math.abs(competency.divergence) === 1 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {competency.divergence === 0 ? 'Alinhado' : 
               `Divergência: ${competency.divergence > 0 ? '+' : ''}${competency.divergence}`}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                <span className="text-gray-600">
                  Autoavaliação: <span className="font-medium text-gray-900">{competency.selfScore}/10</span>
                </span>
                <span className="text-gray-600">
                  Gestor: <span className="font-medium text-gray-900">{competency.managerScore}/10</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetencyAssessment;