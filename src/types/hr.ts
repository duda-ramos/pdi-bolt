export interface HRRecord {
  id: string;
  user_id: string;
  type: 'consultation' | 'test' | 'follow_up' | 'group_session';
  title: string;
  content: string;
  confidential: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HRTest {
  id: string;
  user_id: string;
  test_type: 'burnout' | 'stress' | 'wellbeing' | 'satisfaction';
  questions: Record<string, any>;
  answers?: Record<string, any>;
  score?: number;
  interpretation?: string;
  administered_by: string;
  completed_at?: string;
  created_at: string;
}

export interface HRAppointment {
  id: string;
  user_id: string;
  hr_professional_id: string;
  type: 'individual' | 'follow_up' | 'group';
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}