export interface Team {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'member' | 'lead';
  joined_at: string;
}