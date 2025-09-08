export interface ActionGroup {
  id: string;
  name: string;
  description: string;
  created_by: string;
  status: 'active' | 'completed' | 'archived';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'coordinator';
  joined_at: string;
}

export interface GroupTask {
  id: string;
  group_id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupGoal {
  id: string;
  group_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}