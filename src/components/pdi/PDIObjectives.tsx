import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, MessageSquare, User, Award, UserCheck } from 'lucide-react';
import Badge from '../common/Badge';
import PDIForm from './PDIForm';
import { getSupabaseClient } from '../../lib/supabase';
import { pdiService } from '../../services/supabase/pdi';
import { achievementsService } from '../../services/supabase/achievements';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import type { PDIObjective, PDIObjectiveInput } from '../../types/pdi';

interface ExtendedPDIObjective extends PDIObjective {
  competency_name?: string;
  mentor_name?: string;
  comments_count?: number;
}

interface PDIObjectivesProps {
  onSelectObjective?: (objectiveId: string | null) => void;
}

// Map database status to UI labels
const statusLabels = {
  pendente: 'A Fazer',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

const PDIObjectives: React.FC<PDIObjectivesProps> = ({ onSelectObjective }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [objectives, setObjectives] = useState<ExtendedPDIObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  // Fetch objectives from Supabase
  useEffect(() => {
    if (user) {
      fetchObjectives();
    }
  }, [user]);

  const fetchObjectives = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('pdi_objectives')
        .select('*')
        .eq('colaborador_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Enrich objectives with additional data
      const enrichedObjectives = await Promise.all(
        (data || []).map(async (objective) => {
          const enriched: ExtendedPDIObjective = { ...objective };

          // Get competency name if linked
          if (objective.competency_id) {
            const { data: competency } = await supabase
              .from('competencies')
              .select('nome')
              .eq('id', objective.competency_id)
              .single();
            
            if (competency) {
              enriched.competency_name = competency.nome;
            }
          }

          // Get mentor name if assigned
          if (objective.mentor_id) {
            const { data: mentor } = await supabase
              .from('profiles')
              .select('nome')
              .eq('user_id', objective.mentor_id)
              .single();
            
            if (mentor) {
              enriched.mentor_name = mentor.nome;
            }
          }

          // Get comments count
          const { count } = await supabase
            .from('pdi_comments')
            .select('*', { count: 'exact', head: true })
            .eq('objective_id', objective.id);
          
          enriched.comments_count = count || 0;

          return enriched;
        })
      );

      setObjectives(enrichedObjectives);
    } catch (err) {
      console.error('Error fetching objectives:', err);
      setError('Erro ao carregar objetivos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = async (newObjectiveInput: PDIObjectiveInput) => {
    if (!user) return;

    try {
      const data = await pdiService.createObjective(user.id, newObjectiveInput);

      setObjectives(prev => [data, ...prev]);
      setShowForm(false);
      showToast('success', 'Objetivo criado com sucesso!');
    } catch (err) {
      console.error('Error creating objective:', err);
      showToast('error', 'Erro ao criar objetivo. Tente novamente.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado') => {
    try {
      // Optimistic update
      setObjectives(prev => prev.map(obj => 
        obj.id === id ? { ...obj, objetivo_status: newStatus } : obj
      ));
      
      await pdiService.updateObjectiveStatus(id, newStatus);
      
      // Check for achievements if objective completed
      if (newStatus === 'concluido' && user) {
        await achievementsService.checkAndUnlockAchievements(user.id);
      }
      
      showToast('success', 'Status atualizado com sucesso!');
    } catch (err) {
      console.error('Error updating objective status:', err);
      showToast('error', 'Erro ao atualizar status. Tente novamente.');
      
      // Revert optimistic update
      fetchObjectives();
    }
  };

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    try {
      // Optimistic update
      setObjectives(prev => prev.map(obj => 
        obj.id === id ? { ...obj, pontos_extra: newProgress } : obj
      ));
      
      await pdiService.updateObjectiveProgress(id, newProgress);
      
      showToast('info', `Progresso atualizado para ${newProgress}%`);
    } catch (err) {
      console.error('Error updating objective progress:', err);
      showToast('error', 'Erro ao atualizar progresso. Tente novamente.');
      
      // Revert optimistic update
      fetchObjectives();
    }
  };

  const handleSelectObjective = (objectiveId: string) => {
    const newSelection = selectedObjective === objectiveId ? null : objectiveId;
    setSelectedObjective(newSelection);
    onSelectObjective?.(newSelection);
  };

  const statusConfig = {
    pendente: { label: 'A Fazer', variant: 'neutral' as const, icon: Clock },
    em_andamento: { label: 'Em Andamento', variant: 'info' as const, icon: Clock },
    concluido: { label: 'Concluído', variant: 'success' as const, icon: CheckCircle },
    cancelado: { label: 'Cancelado', variant: 'error' as const, icon: AlertCircle }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando objetivos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchObjectives}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Objetivos PDI 2024</h3>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Objetivo</span>
        </button>
      </div>

      <div className="space-y-4">
        {objectives.map((objective) => {
          const config = statusConfig[objective.objetivo_status];
          const Icon = config.icon;
          
          return (
            <div 
              key={objective.id} 
              className={`border rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer ${
                selectedObjective === objective.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => handleSelectObjective(objective.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{objective.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1">{objective.descricao}</p>
                  
                  {/* Competency and Mentor Info */}
                  <div className="flex items-center space-x-4 mt-2">
                    {objective.competency_name && (
                      <div className="flex items-center space-x-1 text-sm text-blue-600">
                        <Award className="w-3 h-3" />
                        <span>{objective.competency_name}</span>
                      </div>
                    )}
                    {objective.mentor_name && (
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <UserCheck className="w-3 h-3" />
                        <span>Mentor: {objective.mentor_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={objective.objetivo_status}
                    onChange={(e) => handleStatusChange(objective.id, e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <option value="pendente">A Fazer</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  <Badge variant={config.variant}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progresso</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={objective.pontos_extra || 0}
                      onChange={(e) => handleProgressUpdate(objective.id, parseInt(e.target.value))}
                      className="w-16 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-gray-900 font-medium">{objective.pontos_extra || 0}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${objective.pontos_extra || 0}%` }}
                  />
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {objective.data_fim ? new Date(objective.data_fim).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    className="flex items-center hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectObjective(objective.id);
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {objective.comments_count || 0}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {objectives.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Nenhum objetivo encontrado</p>
          <p className="text-sm text-gray-500">Clique em "Novo Objetivo" para começar</p>
        </div>
      )}
      
      {showForm && (
        <PDIForm
          onSubmit={handleAddObjective}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default PDIObjectives;