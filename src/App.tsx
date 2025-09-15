console.log('✅ AppContent: User authenticated, showing main app');
console.log('✅ User authenticated, showing main app');

// Handle auth callback route
if (window.location.pathname === '/auth/callback') {
  return <AuthCallback />;
}

const renderPage = () => {
  switch (currentPage) {
    case 'dashboard':