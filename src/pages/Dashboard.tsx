import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import CareerProgress from '../components/career/CareerProgress';
import PDIObjectives from '../components/pdi/PDIObjectives';
import Badge from '../components/common/Badge';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'colaborador':
        return 'Seu Desenvolvimento';
      case 'gestor':
        return 'Gestão de Equipe';
      case 'rh':
        return 'Bem-estar Organizacional';
      case 'admin':
        return 'Administração do Sistema';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div>
      <Header 
        title={`${getGreeting()}, ${user?.nome}!`}
        subtitle={getDashboardTitle()}
      />
      
      <div className="p-8 space-y-8">
        {/* Stats */}
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {user?.role === 'colaborador' && (
              <>
                <CareerProgress />
                <PDIObjectives />
              </>
            )}
            
            {user?.role === 'gestor' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sua Equipe</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Maria Oliveira', status: 'Avaliação pendente', urgency: 'high' },
                    { name: 'João Silva', status: 'PDI aprovado', urgency: 'low' },
                    { name: 'Ana Costa', status: 'Objetivo completado', urgency: 'medium' }
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.status}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        member.urgency === 'high' ? 'bg-red-500' :
                        member.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'rh' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agenda Clínica</h3>
                <div className="space-y-3">
                  {[
                    { time: '09:00', patient: 'Colaborador A', type: 'Consulta Individual', status: 'confirmed' },
                    { time: '10:30', patient: 'Colaborador B', type: 'Acompanhamento', status: 'pending' },
                    { time: '14:00', patient: 'Equipe Tech', type: 'Dinâmica de Grupo', status: 'confirmed' }
                  ].map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{appointment.time}</span>
                          <span className="text-gray-600">{appointment.patient}</span>
                        </div>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                      <Badge variant={appointment.status === 'confirmed' ? 'success' : 'warning'}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;