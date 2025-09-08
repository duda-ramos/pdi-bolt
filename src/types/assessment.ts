export interface Assessment {
  id: string;
  competency_id: string;
  user_id: string;
  manager_id: string;
  form_definition: Record<string, any>;
  self_score?: number;
  manager_score?: number;
  created_at: string;
  completed_at?: string;
}

export interface AssessmentReport {
  user_id: string;
  stage_id: string;
  competencies: {
    competency_id: string;
    name: string;
    type: 'hard' | 'soft';
    self_score: number;
    manager_score: number;
    divergence: number;
  }[];
  matrix_position: {
    hard_score: number;
    soft_score: number;
    quadrant: 'baixo-baixo' | 'baixo-alto' | 'alto-baixo' | 'alto-alto';
  };
  generated_at: string;
}