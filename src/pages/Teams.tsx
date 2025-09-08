import React, { useState } from 'react';
import { Users, Plus, Calendar, FileText, MessageSquare, Star, Award, Target } from 'lucide-react';

const Teams: React.FC = () => {
  const [teams] = useState([
    {
      id: 1,
      name: 'Desenvolvimento Frontend',
      members: 8,
      lead: 'Ana Silva',
      performance: 92,
      projects: 3
    },
    {
      id: 2,
      name: 'Backend & APIs',
      members: 6,
      lead: 'Carlos Santos',
      performance: 88,
      projects: 5
    },
    {
      id: 3,
      name: 'UX/UI Design',
      members: 4,
      lead: 'Maria Costa',
      performance: 95,
      projects: 2
    }
  ]);

  const [teamMembers] = useState([
    {
      id: 1,
      name: 'João Pedro',
      role: 'Desenvolvedor Sênior',
      team: 'Frontend',
      performance: 94,
      lastPDI: '2024-01-15'
    },
    {
      id: 2,
      name: 'Fernanda Lima',
      role: 'Desenvolvedora Pleno',
      team: 'Backend',
      performance: 87,
      lastPDI: '2024-01-10'
    },
    {
      id: 3,
      name: 'Ricardo Oliveira',
      role: 'Designer UX',
      team: 'Design',
      performance: 91,
      lastPDI: '2024-01-20'
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Equipes</h1>
          <p className="text-gray-600 mt-2">Gerencie suas equipes e acompanhe o desempenho</p>
        </div>
        <button
          onClick={() => {
            alert('Abrindo formulário para criar nova equipe...');
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5 inline mr-2" />
          Nova Equipe
        </button>
      </div>

      {/* Teams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Líder:</span> {team.lead}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Membros:</span> {team.members}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Projetos:</span> {team.projects}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">Performance:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${team.performance}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-green-600">{team.performance}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações da Equipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => {
              alert('Agendando reunião 1:1...');
            }}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Agendar 1:1</span>
          </button>
          <button
            onClick={() => {
              alert('Abrindo revisão de PDIs...');
            }}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-green-500" />
            <span>Revisar PDIs</span>
          </button>
          <button
            onClick={() => {
              alert('Abrindo sistema de feedback...');
            }}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <span>Dar Feedback</span>
          </button>
          <button
            onClick={() => {
              alert('Abrindo avaliação de performance...');
            }}
            className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Avaliar Performance</span>
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Membros da Equipe</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Cargo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Equipe</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Último PDI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.role}</td>
                  <td className="py-3 px-4 text-gray-600">{member.team}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${member.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">{member.performance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.lastPDI}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          alert(`Visualizando perfil de ${member.name}...`);
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={() => {
                          alert(`Editando informações de ${member.name}...`);
                        }}
                        className="text-green-500 hover:text-green-700 text-sm"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">3</p>
            <p className="text-sm text-gray-600">Membros com 90%+ performance</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Metas Atingidas</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">87%</p>
            <p className="text-sm text-gray-600">Das metas do trimestre</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Engajamento</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">92%</p>
            <p className="text-sm text-gray-600">Satisfação da equipe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;