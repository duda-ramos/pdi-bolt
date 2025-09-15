import { supabase } from '../../lib/supabase';

export const teamsService = {
  async createOneOnOne(managerId: string, employeeId: string, scheduledDate: string) {
    const { data, error } = await supabase
      .from('touchpoints')
      .insert({
        gestor_id: managerId,
        colaborador_id: employeeId,
        assessment_cycle_id: new Date().getFullYear().toString(),
        feedback: 'Reunião 1:1 agendada',
        data_reuniao: scheduledDate
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async giveFeedback(managerId: string, employeeId: string, feedback: string) {
    const { data, error } = await supabase
      .from('pdi_comments')
      .insert({
        objective_id: null, // Feedback geral, não específico de objetivo
        user_id: managerId,
        comentario: feedback
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createPerformanceReview(managerId: string, employeeId: string, reviewData: any) {
    // Implementar lógica de avaliação de performance
    // Pode envolver múltiplas tabelas: assessments, touchpoints, etc.
    
    const { data, error } = await supabase
      .from('touchpoints')
      .insert({
        gestor_id: managerId,
        colaborador_id: employeeId,
        assessment_cycle_id: new Date().getFullYear().toString(),
        feedback: reviewData.feedback,
        data_reuniao: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};