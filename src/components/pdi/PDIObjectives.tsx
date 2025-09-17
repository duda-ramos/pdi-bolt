import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, MessageSquare, User, Award, UserCheck } from 'lucide-react';
import Badge from '../common/Badge';
import PDIForm from './PDIForm';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
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

      // Single query with joins to get objectives and related data
      const { data, error: fetchError } = await supabase
        .from('pdi_objectives')
        .select(`
          *,
          competencies(nome),
          mentor:profiles!pdi_objectives_mentor_id_fkey(nome)
        `)
        .eq('colaborador_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Get comment counts for all objectives in a single query
      const objectiveIds = (data || []).map(obj => obj.id);
      const { data: commentCounts } = await supabase
        .from('pdi_comments')
        .select('objective_id')
        .in('objective_id', objectiveIds);

      // Count comments by objective
      const commentCountsByObjective = (commentCounts || []).reduce((acc, comment) => {
        acc[comment.objective_id] = (acc[comment.objective_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Process objectives with joined data
      const enrichedObjectives: ExtendedPDIObjective[] = (data || []).map(objective => ({
        ...objective,
        competency_name: objective.competencies?.nome,
        mentor_name: objective.mentor?.nome,
        comments_count: commentCountsByObjective[objective.id] || 0
      }));

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
      const { data, error: insertError } = await supabase
        .from('pdi_objectives')
        .insert([{
          colaborador_id: user.id,
          created_by: user.id,
          titulo: newObjectiveInput.titulo,
          descricao: newObjectiveInput.description,
          data_inicio: newObjectiveInput.data_inicio,
          data_fim: newObjectiveInput.data_fim,
          objetivo_status: 'pendente' as const,
          pontos_extra: 0
        }])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setObjectives(prev => [data, ...prev]);
      setShowForm(false);
      alert('Objetivo criado com sucesso!');
    } catch (err) {
      console.error('Error creating objective:', err);
      alert('Erro ao criar objetivo. Tente novamente.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado') => {
    try {
      const { error: updateError } = await supabase
        .from('pdi_objectives')
        .update({ objetivo_status: newStatus })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setObjectives(prev => prev.map(obj => 
        obj.id === id ? { ...obj, objetivo_status: newStatus } : obj
      ));
    } catch (err) {
      console.error('Error updating objective status:', err);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const handleProgressUpdate = async (id: string, newProgress: number) => {
    try {
      const { error: updateError } = await supabase
        .from('pdi_objectives')
        .update({ pontos_extra: newProgress })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setObjectives(prev => prev.map(obj => 
        obj.id === id ? { ...obj, pontos_extra: newProgress } : obj
      ));
    } catch (err) {
      console.error('Error updating objective progress:', err);
      alert('Erro ao atualizar progresso. Tente novamente.');
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