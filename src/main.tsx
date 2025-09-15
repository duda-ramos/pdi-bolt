import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { ToastProvider } from './components/common/Toast';
import './index.css';

console.log('🎬 main.tsx: File loaded, starting application...');
console.log('🎬 Application starting...');

const rootElement = document.getElementById('root');
console.log('🎯 main.tsx: Root element found:', !!rootElement);

if (!rootElement) {
  console.error('❌ main.tsx: Root element not found!');
} else {
  console.log('✅ main.tsx: Root element found, creating React root');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeatureFlagProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </FeatureFlagProvider>
  </StrictMode>
);

console.log('✅ main.tsx: React root created and render called');
console.log('✅ Application mounted');