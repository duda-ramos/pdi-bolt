/**
 * Sentry Configuration and Initialization
 * 
 * Este arquivo configura o Sentry para monitoramento de erros e performance
 * em diferentes ambientes (development, staging, production).
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Configuração do Sentry baseada no ambiente
const getSentryConfig = () => {
  const environment = import.meta.env.VITE_APP_ENV || 'development';
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Não inicializar Sentry em desenvolvimento se DSN não estiver configurado
  if (environment === 'development' && !dsn) {
    console.log('🔍 Sentry: DSN não configurado para desenvolvimento, pulando inicialização');
    return null;
  }

  return {
    dsn: dsn || '', // DSN será obrigatório para staging/production
    environment,
    integrations: [
      new BrowserTracing({
        // Configurar roteamento para SPA
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          React.useLocation,
          React.useNavigationType,
          React.createMatchPath
        ),
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% em produção, 100% em dev/staging
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
    
    // Configurações por ambiente
    beforeSend(event, hint) {
      // Filtrar erros conhecidos ou não críticos
      if (event.exception) {
        const error = hint.originalException;
        
        // Filtrar erros de rede temporários
        if (error instanceof Error && error.message.includes('fetch')) {
          console.warn('🌐 Sentry: Erro de rede filtrado:', error.message);
          return null;
        }
        
        // Filtrar erros de desenvolvimento
        if (environment === 'development' && error instanceof Error) {
          if (error.message.includes('HMR') || error.message.includes('hot reload')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Configurações de privacidade
    beforeBreadcrumb(breadcrumb) {
      // Filtrar breadcrumbs sensíveis
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        // Não enviar logs de console para o Sentry
        return null;
      }
      
      return breadcrumb;
    },
    
    // Tags padrão
    initialScope: {
      tags: {
        component: 'frontend',
        framework: 'react',
        build_tool: 'vite'
      }
    }
  };
};

// Inicializar Sentry
export const initializeSentry = () => {
  const config = getSentryConfig();
  
  if (!config) {
    console.log('🔍 Sentry: Configuração não disponível, pulando inicialização');
    return false;
  }
  
  if (!config.dsn) {
    console.error('❌ Sentry: DSN não configurado para ambiente:', config.environment);
    return false;
  }
  
  try {
    Sentry.init(config);
    console.log('✅ Sentry: Inicializado com sucesso para ambiente:', config.environment);
    
    // Testar conexão
    Sentry.addBreadcrumb({
      message: 'Sentry inicializado',
      level: 'info',
      category: 'app'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Sentry: Erro na inicialização:', error);
    return false;
  }
};

// Funções utilitárias para captura manual de erros
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
};

// Hook para capturar erros em componentes
export const useSentryErrorHandler = () => {
  const captureComponentError = (error: Error, errorInfo?: any) => {
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      Sentry.captureException(error);
    });
  };
  
  return { captureComponentError };
};

// Configurar usuário no Sentry quando autenticado
export const setSentryUser = (user: { id: string; email: string; nome: string; role: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.nome,
    role: user.role
  });
};

// Limpar usuário no Sentry quando logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};