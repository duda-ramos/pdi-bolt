import React from 'react';
import { Bell, Search, MessageCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              onChange={(e) => {
                // Handle search functionality
                if (e.target.value.length > 2) {
                  console.log('Searching for:', e.target.value);
                }
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          
          {/* Notifications */}
          <button 
            onClick={() => {
              alert('Abrindo notificações...');
            }}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Messages */}
          <button 
            onClick={() => {
              alert('Abrindo mensagens...');
            }}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;