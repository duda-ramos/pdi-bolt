import { supabase } from '../../lib/supabase';
import type { User } from '../../types/auth';

export interface ProfileUpdateData {
  nome?: string;
  bio?: string;
  localizacao?: string;
  formacao?: string;
  trilha_id?: string;
  avatar?: string;
}

export const profileService = {
  async updateProfile(userId: string, updates: ProfileUpdateData) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async getSalaryHistory(userId: string) {
    const { data, error } = await supabase
      .from('salary_history')
      .select('*')
      .eq('user_id', userId)
      .order('data_inicio', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getNextObjective(userId: string) {
    const { data, error } = await supabase
      .from('pdi_objectives')
      .select(`
        *,
        competencies(nome)
      `)
      .eq('colaborador_id', userId)
      .in('objetivo_status', ['pendente', 'em_andamento'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};