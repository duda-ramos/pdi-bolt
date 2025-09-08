import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import HRAppointments from '../components/hr/HRAppointments';
import HRTests from '../components/hr/HRTests';
import { Heart, Calendar, MessageCircle, BarChart3, Shield, Users } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

const MentalHealth: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'appointments' | 'tests'>('overview');

  const wellnessStats = [
    { id: '1', metric: 'Consultas Agendadas', value: 12, trend: 'up' },
    { id: '2', metric: 'Testes Aplicados', value: 8, trend: 'up' },
    { id: '3', metric: 'Colaboradores Atendidos', value: 24, trend: 'stable' },
    { id: '4', metric: 'Satisfação Média', value: '4.2/5', trend: 'up' }
  ];

  const recentConsultations = [
    { id: '1', date: '2024-01-15', type: 'Individual', status: 'completed', confidential: true },
    { id: '2', date: '2024-01-14', type: 'Grupo', status: 'completed', confidential: false },
    { id: '3', date: '2024-01-12', type: 'Individual', status: 'completed', confidential: true }
  ];

  return (
    <div>
      <Header 
        title="Saúde Mental & Bem-estar"
        subtitle="Área confidencial para acompanhamento psicológico"
      />
      
      <div className="p-8 space-y-8">
        {/* Privacy Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Área Confidencial</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Todas as informações desta área são estritamente confidenciais e protegidas por sigilo profissional.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => alert('Agendando nova consulta...')}
            className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Agendar Consulta</span>
          </button>
          
          <button 
            onClick={() => alert('Iniciando autoavaliação de bem-estar...')}
            className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span>Autoavaliação</span>
          </button>
          
          <button 
            onClick={() => alert('Abrindo chat confidencial...')}
            className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat Confidencial</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Consultas Agendadas"
            value="12"
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Testes Aplicados"
            value="8"
            icon={BarChart3}
            color="green"
          />
          <StatCard
            title="Colaboradores Atendidos"
            value="24"
            icon={Users}
            color="yellow"
          />
          <StatCard
            title="Satisfação Média"
            value="4.2/5"
            icon={Heart}
            color="indigo"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'appointments', label: 'Consultas', icon: Calendar },
                { id: 'tests', label: 'Testes', icon: Heart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultas Recentes</h3>
                  <div className="space-y-3">
                    {recentConsultations.map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {consultation.confidential ? 'Consulta Confidencial' : consultation.type}
                            </p>
                            <p className="text-sm text-gray-600">{consultation.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {consultation.confidential && (
                            <Shield className="w-4 h-4 text-red-500" />
                          )}
                          <Badge variant="success">Concluída</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'appointments' && <HRAppointments />}
            {selectedTab === 'tests' && <HRTests />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;