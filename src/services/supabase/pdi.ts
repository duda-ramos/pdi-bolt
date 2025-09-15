import { supabase } from '../../lib/supabase';
import type { PDIObjectiveInput } from '../../types/pdi';

export const pdiService = {
  async getCompetencies(trackId?: string) {
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
  },

  async getMentors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, nome')
      .in('role', ['gestor', 'admin'])
      .eq('status', 'ativo')
      .order('nome');

    if (error) throw error;
    return data;
  },

  async createObjective(userId: string, objective: PDIObjectiveInput) {
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
  },

  async updateObjectiveStatus(objectiveId: string, status: string) {
    const { error } = await supabase
      .from('pdi_objectives')
      .update({ objetivo_status: status })
      .eq('id', objectiveId);

    if (error) throw error;
  },

  async updateObjectiveProgress(objectiveId: string, progress: number) {
    const { error } = await supabase
      .from('pdi_objectives')
      .update({ pontos_extra: progress })
      .eq('id', objectiveId);

    if (error) throw error;
  }
};