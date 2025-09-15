import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import RLSTestPanel from '../components/common/RLSTestPanel';
import { Settings as SettingsIcon, Users, Award, Target, Database, Shield, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Geral', icon: SettingsIcon },
    { id: 'users', name: 'Usuários', icon: Users },
    { id: 'tracks', name: 'Trilhas', icon: Target },
    { id: 'competencies', name: 'Competências', icon: Award },
    { id: 'system', name: 'Sistema', icon: Database },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'notifications', name: 'Notificações', icon: Bell }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Plataforma
                  </label>
                  <input
                    type="text"
                    defaultValue="DEA PDI"
                    onChange={(e) => {
                      console.log('Platform name changed to:', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    defaultValue="Plataforma de Desenvolvimento Individual"
                    onChange={(e) => {
                      console.log('Platform description changed to:', e.target.value);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Usuários</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">
                  Funcionalidades de gestão de usuários serão implementadas aqui.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'tracks':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trilhas de Carreira</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">
                  Configuração de trilhas de carreira e estágios.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <RLSTestPanel />
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <Header 
        title="Configurações do Sistema"
        subtitle="Gerencie configurações globais da plataforma"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;