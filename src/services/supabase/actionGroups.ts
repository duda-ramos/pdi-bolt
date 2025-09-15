import { supabase } from '../../lib/supabase';

export const actionGroupsService = {
  async getGroups(userId: string) {
    const { data, error } = await supabase
      .from('action_groups')
      .select(`
        *,
        action_group_members(count),
        action_group_tasks(count)
      `)
      .or(`created_by.eq.${userId},id.in.(${
        supabase.from('action_group_members').select('group_id').eq('user_id', userId)
      })`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createGroup(userId: string, groupData: { nome: string; descricao: string }) {
    const { data, error } = await supabase
      .from('action_groups')
      .insert({
        nome: groupData.nome,
        descricao: groupData.descricao,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGroupTasks(groupId: string) {
    const { data, error } = await supabase
      .from('action_group_tasks')
      .select(`
        *,
        profiles!responsavel_id(nome)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateTaskStatus(taskId: string, status: 'todo' | 'doing' | 'done') {
    const { error } = await supabase
      .from('action_group_tasks')
      .update({ 
        concluida: status === 'done',
        // Adicionar campo de status se necessário
      })
      .eq('id', taskId);

    if (error) throw error;
  }
};