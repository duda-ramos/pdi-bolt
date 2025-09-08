import React from 'react';
import { Plus, FileText, Users, MessageSquare, Target, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../common/Badge';

const QuickActions: React.FC = () => {
  const { user } = useAuth();

  const getActionsForRole = () => {
    switch (user?.role) {
      case 'colaborador':
        return [
          { icon: Plus, label: 'Novo Objetivo', color: 'bg-blue-500 hover:bg-blue-600' },
          { icon: FileText, label: 'Avaliar Competência', color: 'bg-green-500 hover:bg-green-600' },
          { icon: MessageSquare, label: 'Solicitar Feedback', color: 'bg-yellow-500 hover:bg-yellow-600' },
          { icon: Award, label: 'Ver Conquistas', color: 'bg-purple-500 hover:bg-purple-600' }
        ];
      
      case 'gestor':
        return [
          { icon: Users, label: 'Revisar Equipe', color: 'bg-blue-500 hover:bg-blue-600' },
          { icon: Target, label: 'Aprovar PDI', color: 'bg-green-500 hover:bg-green-600' },
          { icon: Award, label: 'Dar Bonificação', color: 'bg-yellow-500 hover:bg-yellow-600' },
          { icon: FileText, label: 'Avaliar Colaborador', color: 'bg-indigo-500 hover:bg-indigo-600' }
        ];
      
      case 'rh':
        return [
          { icon: Plus, label: 'Agendar Consulta', color: 'bg-blue-500 hover:bg-blue-600' },
          { icon: FileText, label: 'Novo Teste', color: 'bg-green-500 hover:bg-green-600' },
          { icon: MessageSquare, label: 'Acompanhamento', color: 'bg-yellow-500 hover:bg-yellow-600' },
          { icon: Users, label: 'Relatórios', color: 'bg-purple-500 hover:bg-purple-600' }
        ];
      
      case 'admin':
        return [
          { icon: Plus, label: 'Nova Trilha', color: 'bg-blue-500 hover:bg-blue-600' },
          { icon: Users, label: 'Gerenciar Usuários', color: 'bg-green-500 hover:bg-green-600' },
          { icon: Target, label: 'Configurar Competências', color: 'bg-yellow-500 hover:bg-yellow-600' },
          { icon: FileText, label: 'Relatórios Globais', color: 'bg-indigo-500 hover:bg-indigo-600' }
        ];
      
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              // Handle action click
              switch(action.label) {
                case 'Novo Objetivo':
                case 'Nova Trilha':
                  alert('Redirecionando para criação...');
                  break;
                case 'Avaliar Competência':
                case 'Avaliar Colaborador':
                  alert('Iniciando avaliação...');
                  break;
                case 'Agendar Consulta':
                  alert('Abrindo agenda...');
                  break;
                default:
                  alert(`Executando: ${action.label}`);
              }
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-lg text-white transition-all hover:scale-105 ${action.color}`}
          >
            <action.icon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;