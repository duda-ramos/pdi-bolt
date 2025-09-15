import { supabase } from '../../lib/supabase';
import { mockAchievements } from './mockData';

export const achievementsService = {
  async getUserAchievements(userId: string, useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      return mockAchievements.filter(ach => ach.user_id === userId);
    }

    try {
    const { data, error } = await supabase
      .from('achievements')
      .select(`
        id, titulo, descricao, conquistado_em,
        objective_id,
        pdi_objectives(titulo)
      `)
      .eq('user_id', userId)
      .order('conquistado_em', { ascending: false });

    if (error) throw error;
    return data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setUseFallback?.(true);
      return mockAchievements.filter(ach => ach.user_id === userId);
    }
  },

  async checkAndUnlockAchievements(userId: string, useMockData: boolean = false, setUseFallback?: (value: boolean) => void) {
    if (useMockData) {
      return; // Mock - no actual achievement unlocking
    }

    try {
    // Lógica para verificar e desbloquear conquistas baseadas em critérios
    // Por exemplo: completar 5 objetivos PDI, receber nota alta em avaliação, etc.
    
    // Verificar se completou 5 objetivos
    const { count: completedObjectives } = await supabase
      .from('pdi_objectives')
      .select('*', { count: 'exact', head: true })
      .eq('colaborador_id', userId)
      .eq('objetivo_status', 'concluido');

    if (completedObjectives && completedObjectives >= 5) {
      // Verificar se já tem a conquista
      const { data: existingAchievement } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('titulo', 'Aprendiz Dedicado')
        .single();

      if (!existingAchievement) {
        await supabase
          .from('achievements')
          .insert({
            user_id: userId,
            titulo: 'Aprendiz Dedicado',
            descricao: 'Complete 5 objetivos de aprendizado',
            conquistado_em: new Date().toISOString(),
            created_by: userId
          });
      }
    }

    // Adicionar mais verificações de conquistas aqui...
    } catch (error) {
      console.error('Error checking achievements:', error);
      setUseFallback?.(true);
    }
  }
};