import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSentry } from './lib/sentry';
import { setupGlobalErrorHandler, useErrorHandler } from './hooks/useErrorHandler';

// Inicializar Sentry antes de qualquer outra coisa
const sentryInitialized = initializeSentry();

if (sentryInitialized) {
  console.log('✅ Sentry: Monitoramento de erros ativo');
} else {
  console.log('⚠️ Sentry: Monitoramento não configurado para este ambiente');
}

// Configurar handlers globais de erro
const { logError } = useErrorHandler();
setupGlobalErrorHandler(logError);

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
    <App />
  </StrictMode>
);

console.log('✅ main.tsx: React root created and render called');
console.log('✅ Application mounted');