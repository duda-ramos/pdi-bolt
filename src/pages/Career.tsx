import React from 'react';
import Header from '../components/Layout/Header';
import CareerProgress from '../components/career/CareerProgress';
import { Award, TrendingUp, DollarSign } from 'lucide-react';
import StatCard from '../components/common/StatCard';

const Career: React.FC = () => {
  return (
    <div>
      <Header 
        title="Trilha de Carreira"
        subtitle="Acompanhe sua evolução profissional"
      />
      
      <div className="p-8 space-y-8">
        {/* Career Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Estágio Atual"
            value="Pleno"
            icon={Award}
            color="blue"
          />
          <StatCard
            title="Competências"
            value="12/18"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Faixa Salarial"
            value="R$ 6.500 - R$ 10.000"
            icon={DollarSign}
            color="yellow"
          />
        </div>

        {/* Career Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CareerProgress />
          
          {/* Competencies Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competências do Estágio</h3>
            
            <div className="space-y-4">
              {[
                { name: 'React/Frontend', type: 'Hard', level: 8, required: 7 },
                { name: 'TypeScript', type: 'Hard', level: 7, required: 6 },
                { name: 'Comunicação', type: 'Soft', level: 6, required: 7 },
                { name: 'Trabalho em Equipe', type: 'Soft', level: 8, required: 7 },
                { name: 'Resolução de Problemas', type: 'Soft', level: 7, required: 6 }
              ].map((competency, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{competency.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        competency.type === 'Hard' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {competency.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {competency.level}/{competency.required}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      competency.level >= competency.required 
                        ? 'bg-green-500' 
                        : 'bg-yellow-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;