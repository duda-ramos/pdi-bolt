export interface PDIObjective {
  id: string;
  colaborador_id: string;
  competency_id: string | null;
  titulo: string;
  descricao: string | null;
  status: 'proposto_colaborador' | 'proposto_gestor' | 'aprovado' | 'rejeitado';
  objetivo_status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  data_inicio: string | null;
  data_fim: string | null;
  mentor_id: string | null;
  pontos_extra: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PDIObjectiveInput {
  titulo: string;
  description: string;
  data_inicio: string;
  data_fim: string;
  competency_id?: string;
  mentor_id?: string;
}

export interface PDIComment {
  id: string;
  objective_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_by?: string;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  objective_id?: string;
}