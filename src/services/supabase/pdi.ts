import { supabase } from '../../lib/supabase';
import type { PDIObjectiveInput } from '../../types/pdi';
import { mockCompetencies, mockProfiles } from './mockData';

export const pdiService = {
  async getCompetencies(trackId?: string, useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      return mockCompetencies.map(comp => ({
        id: comp.id,
        nome: comp.name,
        tipo: comp.type === 'Hard' ? 'hard_skill' : 'soft_skill',
        career_stages: { trilha_id: trackId || 'mock-track-1' }
      }));
    }

    try {
    let query = supabase
      .from('competencies')
      .select(`
        id, nome, tipo,
        career_stages(trilha_id)
      `)
      .order('nome');

    if (trackId) {
      query = query.eq('career_stages.trilha_id', trackId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
    } catch (error) {
      console.error('Error fetching competencies:', error);
      setUseFallback?.(true);
      return mockCompetencies.map(comp => ({
        id: comp.id,
        nome: comp.name,
        tipo: comp.type === 'Hard' ? 'hard_skill' : 'soft_skill',
        career_stages: { trilha_id: trackId || 'mock-track-1' }
      }));
    }
  },

  async getMentors(useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      return mockProfiles
        .filter(p => p.role === 'gestor')
        .map(p => ({ user_id: p.user_id, nome: p.nome }));
    }

    try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, nome')
      .in('role', ['gestor', 'admin'])
      .eq('status', 'ativo')
      .order('nome');

    if (error) throw error;
    return data;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setUseFallback?.(true);
      return mockProfiles
        .filter(p => p.role === 'gestor')
        .map(p => ({ user_id: p.user_id, nome: p.nome }));
    }
  },

  async createObjective(userId: string, objective: PDIObjectiveInput, useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      const newObjective = {
        id: `mock-obj-${Date.now()}`,
        colaborador_id: userId,
        created_by: userId,
        titulo: objective.titulo,
        descricao: objective.description,
        data_inicio: objective.data_inicio,
        data_fim: objective.data_fim,
        competency_id: objective.competency_id || null,
        mentor_id: objective.mentor_id || null,
        objetivo_status: 'pendente' as const,
        pontos_extra: 0,
        status: 'proposto_colaborador' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newObjective;
    }

    try {
    const { data, error } = await supabase
      .from('pdi_objectives')
      .insert({
        colaborador_id: userId,
        created_by: userId,
        titulo: objective.titulo,
        descricao: objective.description,
        data_inicio: objective.data_inicio,
        data_fim: objective.data_fim,
        competency_id: objective.competency_id || null,
        mentor_id: objective.mentor_id || null,
        objetivo_status: 'pendente',
        pontos_extra: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
    } catch (error) {
      console.error('Error creating objective:', error);
      setUseFallback?.(true);
      throw error; // Re-throw for UI error handling
    }
  },

  async updateObjectiveStatus(objectiveId: string, status: string, useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      return; // Mock update - no actual change needed
    }

    try {
    const { error } = await supabase
      .from('pdi_objectives')
      .update({ objetivo_status: status })
      .eq('id', objectiveId);

    if (error) throw error;
    } catch (error) {
      console.error('Error updating objective status:', error);
      setUseFallback?.(true);
      throw error; // Re-throw for UI error handling
    }
  },

  async updateObjectiveProgress(objectiveId: string, progress: number, useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      return; // Mock update - no actual change needed
    }

    try {
    const { error } = await supabase
      .from('pdi_objectives')
      .update({ pontos_extra: progress })
      .eq('id', objectiveId);

    if (error) throw error;
    } catch (error) {
      console.error('Error updating objective progress:', error);
      setUseFallback?.(true);
      throw error; // Re-throw for UI error handling
    }
  }
};