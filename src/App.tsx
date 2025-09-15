import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useFeatureFlags } from './contexts/FeatureFlagContext';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Teams from './pages/Teams';
import Career from './pages/Career';
import PDI from './pages/PDI';
import Competencies from './pages/Competencies';
import ActionGroups from './pages/ActionGroups';
import MentalHealth from './pages/MentalHealth';
import Settings from './pages/Settings';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import LoginForm from './components/auth/LoginForm';
import LoadingSpinner from './components/common/LoadingSpinner';

type PageType = 'dashboard' | 'profile' | 'teams' | 'career' | 'pdi' | 'competencies' | 'action-groups' | 'mental-health' | 'settings';

function App() {
  const { user, loading } = useAuth();
  const { useFallback } = useFeatureFlags();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  console.log('✅ App: Rendering with user:', user?.id, 'loading:', loading);

  // Handle auth callback route
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'teams':
        return <Teams />;
      case 'career':
        return <Career />;
      case 'pdi':
        return <PDI />;
      case 'competencies':
        return <Competencies />;
      case 'action-groups':
        return <ActionGroups />;
      case 'mental-health':
        return <MentalHealth />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    console.log('⏳ App: Loading auth state...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    console.log('🔐 App: No user, showing login form');
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginForm />
      </div>
    );
  }

  console.log('✅ App: User authenticated, showing main app');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
        <main className="flex-1 ml-64">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;