export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador' | 'rh';
  status: 'ativo' | 'inativo';
  data_admissao: string | null;
  data_desligamento?: string | null;
  time_id?: string | null;
  gestor_id?: string | null;
  localizacao: string | null;
  bio?: string;
  formacao?: string;
  trilha_id?: string | null;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nome: string, role?: 'admin' | 'gestor' | 'colaborador' | 'rh') => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateProfile: (updates: Partial<User>) => Promise<any>;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  admin: Permission[];
  gestor: Permission[];
  colaborador: Permission[];
  rh: Permission[];
}