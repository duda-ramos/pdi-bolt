import React, { useState } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useErrorHandler, setupGlobalErrorHandler } from './hooks/useErrorHandler';
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

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { logError } = useErrorHandler();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Setup global error handling
  React.useEffect(() => {
    setupGlobalErrorHandler(logError);
  }, [logError]);

  if (loading) {
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
    return <LoginForm />;
  }

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
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;