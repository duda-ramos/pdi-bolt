import React from 'react';
import { 
  Home, 
  User, 
  TrendingUp, 
  Target, 
  Users, 
  Award, 
  Brain,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, roles: ['admin', 'gestor', 'colaborador', 'rh'] },
    { id: 'profile', name: 'Meu Perfil', icon: User, roles: ['admin', 'gestor', 'colaborador', 'rh'] },
    { id: 'career', name: 'Carreira', icon: TrendingUp, roles: ['admin', 'gestor', 'colaborador'] },
    { id: 'competencies', name: 'Competências', icon: Award, roles: ['admin', 'gestor', 'colaborador'] },
    { id: 'pdi', name: 'PDI', icon: Target, roles: ['admin', 'gestor', 'colaborador'] },
    { id: 'teams', name: 'Equipes', icon: Users, roles: ['admin', 'gestor'] },
    { id: 'mental-health', name: 'Bem-estar', icon: Brain, roles: ['rh', 'colaborador'] },
    { id: 'action-groups', name: 'Grupos de Ação', icon: Users, roles: ['admin', 'gestor', 'colaborador'] },
    { id: 'settings', name: 'Configurações', icon: Settings, roles: ['admin'] }
  ];

  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DEA PDI</h1>
            <p className="text-sm text-gray-500">Desenvolvimento Individual</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleNavigation.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={user?.avatar || 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150'} 
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;