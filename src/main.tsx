import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
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
    <App />
  </StrictMode>
);

console.log('✅ main.tsx: React root created and render called');
console.log('✅ Application mounted');