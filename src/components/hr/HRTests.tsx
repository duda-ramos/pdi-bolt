import React, { useState } from 'react';
import { FileText, Play, BarChart3, User } from 'lucide-react';
import Badge from '../common/Badge';

interface TestResult {
  id: string;
  testType: string;
  patient: string;
  score: number;
  interpretation: string;
  date: string;
  status: 'pending' | 'completed';
}

const HRTests: React.FC = () => {
  const [testResults] = useState<TestResult[]>([
    {
      id: '1',
      testType: 'Teste de Burnout',
      patient: 'Colaborador A',
      score: 3.2,
      interpretation: 'Baixo risco',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      testType: 'Avaliação de Estresse',
      patient: 'Colaborador B',
      score: 6.8,
      interpretation: 'Atenção necessária',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: '3',
      testType: 'Questionário de Bem-estar',
      patient: 'Colaborador C',
      score: 0,
      interpretation: '',
      date: '2024-01-16',
      status: 'pending'
    }
  ]);

  const availableTests = [
    { id: 'burnout', name: 'Teste de Burnout', color: 'bg-red-500' },
    { id: 'stress', name: 'Avaliação de Estresse', color: 'bg-yellow-500' },
    { id: 'wellbeing', name: 'Questionário de Bem-estar', color: 'bg-green-500' },
    { id: 'satisfaction', name: 'Escala de Satisfação', color: 'bg-blue-500' }
  ];

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Available Tests */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ferramentas Disponíveis</h3>
        <div className="grid grid-cols-2 gap-3">
          {availableTests.map((test) => (
            <button
              key={test.id}
              onClick={() => {
                alert(`Aplicando ${test.name}...`);
              }}
              className={`${test.color} text-white p-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center space-x-2`}
            >
              <Play className="w-4 h-4" />
              <span>{test.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados Recentes</h3>
        
        <div className="space-y-4">
          {testResults.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{result.testType}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>Paciente Confidencial</span>
                    </div>
                  </div>
                </div>
                <Badge variant={result.status === 'completed' ? 'success' : 'warning'}>
                  {result.status === 'completed' ? 'Concluído' : 'Pendente'}
                </Badge>
              </div>

              {result.status === 'completed' && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Pontuação:</span>
                    <div className={`font-medium ${getScoreColor(result.score)}`}>
                      {result.score}/10
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Interpretação:</span>
                    <div className="font-medium text-gray-900">{result.interpretation}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <div className="font-medium text-gray-900">{result.date}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRTests;