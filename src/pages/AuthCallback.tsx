import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 AuthCallback: Processing auth callback...');
        
        // Get the current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          console.error('❌ AuthCallback: Auth error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (code) {
          console.log('✅ AuthCallback: Auth code received, exchanging for session...');
          
          // Exchange the code for a session
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) {
            console.error('❌ AuthCallback: Session exchange error:', sessionError);
            setStatus('error');
            setMessage(sessionError.message);
            return;
          }

          if (data.user) {
            console.log('✅ AuthCallback: Session established for user:', data.user.email);
            setStatus('success');
            setMessage('Login realizado com sucesso! Redirecionando...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Falha ao estabelecer sessão do usuário.');
          }
        } else {
          // No code parameter, might be a direct access
          console.log('⚠️ AuthCallback: No auth code found, checking existing session...');
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('✅ AuthCallback: Existing session found, redirecting...');
            setStatus('success');
            setMessage('Sessão ativa encontrada! Redirecionando...');
            
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            setStatus('error');
            setMessage('Nenhum código de autenticação encontrado.');
          }
        }
      } catch (err) {
        console.error('❌ AuthCallback: Unexpected error:', err);
        setStatus('error');
        setMessage('Erro inesperado durante a autenticação.');
      }
    };

    handleAuthCallback();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processando autenticação...';
      case 'success':
        return 'Autenticação realizada com sucesso!';
      case 'error':
        return 'Erro na autenticação';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h1>
        
        {message && (
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        )}
        
        {status === 'loading' && (
          <div className="text-sm text-gray-500">
            Aguarde enquanto processamos sua autenticação...
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Voltar ao Login
            </button>
            
            <p className="text-xs text-gray-500">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-sm text-gray-500">
            Você será redirecionado automaticamente em alguns segundos...
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;