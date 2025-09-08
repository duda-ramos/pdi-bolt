export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          nome: string
          email: string
          role: 'admin' | 'gestor' | 'colaborador' | 'rh'
          status: 'ativo' | 'inativo'
          data_admissao: string | null
          data_desligamento: string | null
          time_id: string | null
          gestor_id: string | null
          bio: string | null
          localizacao: string | null
          formacao: string | null
          trilha_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          email: string
          role?: 'admin' | 'gestor' | 'colaborador' | 'rh'
          status?: 'ativo' | 'inativo'
          data_admissao?: string | null
          data_desligamento?: string | null
          time_id?: string | null
          gestor_id?: string | null
          bio?: string | null
          localizacao?: string | null
          formacao?: string | null
          trilha_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          email?: string
          role?: 'admin' | 'gestor' | 'colaborador' | 'rh'
          status?: 'ativo' | 'inativo'
          data_admissao?: string | null
          data_desligamento?: string | null
          time_id?: string | null
          gestor_id?: string | null
          bio?: string | null
          localizacao?: string | null
          formacao?: string | null
          trilha_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          created_by?: string
          created_at?: string
        }
      }
      pdi_objectives: {
        Row: {
          id: string
          colaborador_id: string
          competency_id: string | null
          titulo: string
          descricao: string | null
          status: 'proposto_colaborador' | 'proposto_gestor' | 'aprovado' | 'rejeitado'
          objetivo_status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
          data_inicio: string | null
          data_fim: string | null
          mentor_id: string | null
          pontos_extra: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          colaborador_id: string
          competency_id?: string | null
          titulo: string
          descricao?: string | null
          status?: 'proposto_colaborador' | 'proposto_gestor' | 'aprovado' | 'rejeitado'
          objetivo_status?: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
          data_inicio?: string | null
          data_fim?: string | null
          mentor_id?: string | null
          pontos_extra?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          colaborador_id?: string
          competency_id?: string | null
          titulo?: string
          descricao?: string | null
          status?: 'proposto_colaborador' | 'proposto_gestor' | 'aprovado' | 'rejeitado'
          objetivo_status?: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
          data_inicio?: string | null
          data_fim?: string | null
          mentor_id?: string | null
          pontos_extra?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'gestor' | 'colaborador' | 'rh'
      user_status: 'ativo' | 'inativo'
      pdi_status: 'proposto_colaborador' | 'proposto_gestor' | 'aprovado' | 'rejeitado'
      objective_status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}