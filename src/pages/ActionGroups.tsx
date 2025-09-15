import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import { Users, Plus, Target, CheckCircle, Clock, TrendingUp, Crown } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useFeatureFlags } from '../contexts/FeatureFlagContext';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { mockActionGroups } from '../services/supabase/mockData';

const ActionGroups: React.FC = () => {
  const { useMockData } = useFeatureFlags();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const handleTaskStatusChange = (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    // Update task status
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    alert(`Status da tarefa atualizado para: ${newStatus === 'todo' ? 'A Fazer' : newStatus === 'doing' ? 'Em Andamento' : 'Concluído'}`);
  };
  
  const groups = useMockData ? mockActionGroups : [
    {
      id: '1',
      name: 'Melhoria de Processos',
      description: 'Otimização dos processos de desenvolvimento',
      status: 'active' as const,
      members: 6,
      tasks: 8,
      completedTasks: 5,
      progress: 62,
      coordinator: 'Ana Silva'
    },
    {
      id: '2',
      name: 'Cultura Organizacional',
      description: 'Fortalecimento da cultura e valores da empresa',
      status: 'active' as const,
      members: 12,
      tasks: 15,
      completedTasks: 12,
      progress: 80,
      coordinator: 'Carlos Santos'
    }
  ];

  const tasks = [
    { id: '1', title: 'Mapear processos atuais', status: 'done' as const, assignee: 'João Silva' },
    { id: '2', title: 'Identificar gargalos', status: 'done' as const, assignee: 'Ana Costa' },
    { id: '3', title: 'Propor melhorias', status: 'doing' as const, assignee: 'Pedro Santos' },
    { id: '4', title: 'Implementar mudanças', status: 'todo' as const, assignee: 'Carla Mendes' }
  ];

  const statusConfig = {
    active: { label: 'Ativo', variant: 'info' as const },
    completed: { label: 'Concluído', variant: 'success' as const },
    archived: { label: 'Arquivado', variant: 'neutral' as const }
  };

  const taskStatusConfig = {
    todo: { label: 'A Fazer', variant: 'neutral' as const, icon: Clock },
    doing: { label: 'Em Andamento', variant: 'info' as const, icon: Clock },
    done: { label: 'Concluído', variant: 'success' as const, icon: CheckCircle }
  };

  return (
    <div>
      <Header 
        title="Grupos de Ação"
        subtitle="Colaboração em projetos e iniciativas estratégicas"
      />
      
      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Grupos Ativos"
            value="2"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Total de Membros"
            value="26"
            icon={Users}
            color="green"
          />
          <StatCard
            title="Tarefas Ativas"
            value="23"
            icon={Target}
            color="yellow"
          />
          <StatCard
            title="Taxa de Conclusão"
            value="74%"
            icon={TrendingUp}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Grupos de Ação</h3>
                <button 
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    alert('Criando novo grupo de ação...');
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Grupo</span>
                </button>
              </div>

              <div className="space-y-4">
                {groups.map((group) => {
                  const config = statusConfig[group.status];
                  
                  return (
                    <div
                      key={group.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedGroup === group.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <ProgressBar
                          current={group.completedTasks}
                          total={group.tasks}
                          label="Progresso das Tarefas"
                          color="blue"
                        />
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {group.members} membros
                          </span>
                          <span className="flex items-center">
                            <Crown className="w-4 h-4 mr-1" />
                            {group.coordinator}
                          </span>
                        </div>
                        <span>{group.progress}% concluído</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {groups.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum grupo encontrado</h3>
                  <p className="text-gray-600 mb-6">Crie seu primeiro grupo de ação para colaborar em projetos</p>
                  <button 
                    onClick={() => alert('Criando novo grupo de ação...')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Criar Primeiro Grupo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Group Details */}
          <div className="space-y-6">
            {selectedGroup ? (
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas do Grupo</h3>
                  
                  <div className="space-y-3">
                    {tasks.map((task) => {
                      const config = taskStatusConfig[task.status];
                      const Icon = config.icon;
                      
                      return (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{task.title}</p>
                              <p className="text-sm text-gray-600">{task.assignee}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value as any)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <option value="todo">A Fazer</option>
                              <option value="doing">Em Andamento</option>
                              <option value="done">Concluído</option>
                            </select>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas do Grupo</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Processos Otimizados</span>
                        <span className="text-sm text-gray-500">5/8</span>
                      </div>
                      <ProgressBar current={5} total={8} color="green" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Redução de Tempo</span>
                        <span className="text-sm text-gray-500">25%</span>
                      </div>
                      <ProgressBar current={25} total={30} color="blue" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um Grupo</h3>
                <p className="text-gray-600">Clique em um grupo para ver detalhes das tarefas e metas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionGroups;