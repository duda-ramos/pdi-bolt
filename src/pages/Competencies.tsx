import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import NineBoxMatrix from '../components/assessment/NineBoxMatrix';
import CompetencyAssessment from '../components/competencies/CompetencyAssessment';
import { Play, BarChart3, FileText } from 'lucide-react';
import Badge from '../components/common/Badge';

const Competencies: React.FC = () => {
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);

  const competencies = [
    { id: '1', name: 'React/Frontend', type: 'Hard', selfScore: 8, managerScore: 7, divergence: 1 },
    { id: '2', name: 'TypeScript', type: 'Hard', selfScore: 7, managerScore: 8, divergence: -1 },
    { id: '3', name: 'Comunicação', type: 'Soft', selfScore: 6, managerScore: 7, divergence: -1 },
    { id: '4', name: 'Liderança', type: 'Soft', selfScore: 5, managerScore: 6, divergence: -1 },
    { id: '5', name: 'Resolução de Problemas', type: 'Soft', selfScore: 8, managerScore: 8, divergence: 0 }
  ];

  const hardSkillsAvg = competencies
    .filter(c => c.type === 'Hard')
    .reduce((acc, c) => acc + c.managerScore, 0) / competencies.filter(c => c.type === 'Hard').length;
    
  const softSkillsAvg = competencies
    .filter(c => c.type === 'Soft')
    .reduce((acc, c) => acc + c.managerScore, 0) / competencies.filter(c => c.type === 'Soft').length;

  return (
    <div>
      <Header 
        title="Competências & Avaliações"
        subtitle="Desenvolva suas habilidades técnicas e comportamentais"
      />
      
      <div className="p-8 space-y-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => {
              alert('Iniciando nova avaliação de competências...');
            }}
            className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Iniciar Nova Avaliação</span>
          </button>
          
          <button 
            onClick={() => {
              alert('Abrindo relatórios de competências...');
            }}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Ver Relatórios</span>
          </button>
          
          <button 
            onClick={() => {
              alert('Agendando touchpoint com gestor...');
            }}
            className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Agendar Touchpoint</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Competencies List */}
          <CompetencyAssessment competencies={competencies} />
          
          {/* 9-Box Matrix */}
          <NineBoxMatrix hardScore={hardSkillsAvg} softScore={softSkillsAvg} />
        </div>
      </div>
    </div>
  );
};

export default Competencies;