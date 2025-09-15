import React, { useState } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Career from './pages/Career';
import Competencies from './pages/Competencies';
import PDI from './pages/PDI';
import MentalHealth from './pages/MentalHealth';
import Teams from './pages/Teams';
import ActionGroups from './pages/ActionGroups';
import Settings from './pages/Settings';

console.log('🚀 App.tsx: File loaded and parsed');

const AppContent: React.FC = () => {
  console.log('🎯 AppContent: Component function called');
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  console.log('🎯 App render state:', { hasUser: !!user, loading, currentPage });

  if (loading) {
    console.log('⏳ AppContent: Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('👤 AppContent: No user found, showing login form');
    console.log('👤 No user found, showing login form');
    return <LoginForm />;
  }

  console.log('✅ AppContent: User authenticated, showing main app');
  console.log('✅ User authenticated, showing main app');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'career':
        return <Career />;
      case 'competencies':
        return <Competencies />;
      case 'pdi':
        return <PDI />;
      case 'mental-health':
        return <MentalHealth />;
      case 'teams':
        return <Teams />;
      case 'action-groups':
        return <ActionGroups />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
};

function App() {
  console.log('🚀 App: Component mounting');
  console.log('🚀 App component mounting');
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

console.log('📄 App.tsx: File execution completed');

export default App;