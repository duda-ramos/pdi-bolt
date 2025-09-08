export interface CareerTrack {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Stage {
  id: string;
  track_id: string;
  phase: 'desenvolvimento' | 'especializacao';
  title: string;
  description?: string;
  order: number;
  is_final: boolean;
  created_at: string;
}

export interface Competency {
  id: string;
  type: 'hard' | 'soft';
  track_id: string;
  stage_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface SalaryRange {
  id: string;
  stage_id: string;
  min_salary: number;
  max_salary: number;
  currency: string;
  is_flexible: boolean;
  created_at: string;
}

export interface Bonus {
  id: string;
  user_id: string;
  stage_id: string;
  amount: number;
  reason: string;
  granted_by: string;
  granted_at: string;
}