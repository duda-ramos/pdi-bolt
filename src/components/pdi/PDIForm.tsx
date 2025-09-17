import React, { useState, useEffect } from 'react';
import { Target, Calendar, Award, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { PDIObjectiveInput } from '../../types/pdi';

interface Competency {
  id: string;
  nome: string;
  tipo: 'hard_skill' | 'soft_skill';
}

interface Mentor {
  user_id: string;
  nome: string;
}

interface PDIFormProps {
  onSubmit: (objective: PDIObjectiveInput) => void;
  onCancel: () => void;
}

const PDIForm: React.FC<PDIFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    titulo: '',
    description: '',
    data_inicio: '',
    data_fim: '',
    competency_id: '',
    mentor_id: ''
  });

  useEffect(() => {
    fetchFormData();
  }, [user]);

  const fetchFormData = async () => {
    if (!user) return;

    try {
      // Get user's career track competencies
      let userTrackId = user.trilha_id;
      
      if (!userTrackId) {
        const { data: tracks } = await supabase
          .from('career_tracks')
          .select('id')
          .limit(1);
        
        if (tracks && tracks.length > 0) {
          userTrackId = tracks[0].id;
        }
      }

      if (userTrackId) {
        // Single query to get competencies for the track
        const { data: competenciesData } = await supabase
          .from('competencies')
          .select(`
            id, 
            nome, 
            tipo,
            career_stages!competencies_stage_id_fkey(trilha_id)
          `)
          .eq('career_stages.trilha_id', userTrackId)
          .order('nome');
        
        setCompetencies(competenciesData || []);
      }

      // Get potential mentors (users with gestor or admin role)
      const { data: mentorsData } = await supabase
        .from('profiles')
        .select('user_id, nome')
        .in('role', ['gestor', 'admin'])
        .eq('status', 'ativo')
        .order('nome');
      
      setMentors(mentorsData || []);

    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.titulo || !formData.description || !formData.data_inicio || !formData.data_fim) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Validate dates
    const startDate = new Date(formData.data_inicio);
    const endDate = new Date(formData.data_fim);
    
    if (endDate <= startDate) {
      alert('A data de conclusão deve ser posterior à data de início.');
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">Novo Objetivo PDI</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Objetivo
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Concluir Curso de React Avançado"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o objetivo e como pretende alcançá-lo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competência Relacionada (Opcional)
              </label>
              <select
                value={formData.competency_id}
                onChange={(e) => handleChange('competency_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Selecione uma competência</option>
                {competencies.map((competency) => (
                  <option key={competency.id} value={competency.id}>
                    {competency.nome} ({competency.tipo === 'hard_skill' ? 'Hard' : 'Soft'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mentor (Opcional)
              </label>
              <select
                value={formData.mentor_id}
                onChange={(e) => handleChange('mentor_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Selecione um mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor.user_id} value={mentor.user_id}>
                    {mentor.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => handleChange('data_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => handleChange('data_fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Criar Objetivo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PDIForm;