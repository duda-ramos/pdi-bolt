import React, { useState } from 'react';
import { Award, Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<'admin' | 'gestor' | 'colaborador' | 'rh'>('colaborador');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [emailForConfirmation, setEmailForConfirmation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login, signup, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Basic validation
    if (!email || !password || (isSignup && !nome)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    try {
      if (isSignup) {
        const result = await signup(email, password, nome, role);
        if (result?.needsConfirmation) {
          setEmailForConfirmation(email);
          setShowEmailConfirmation(true);
          setMessage('');
        } else {
          setMessage(result?.message || 'Conta criada com sucesso!');
        }
      } else {
        // Timeout para login para evitar travamento
        const loginPromise = login(email, password);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout - tente novamente')), 10000)
        );
        
        await Promise.race([loginPromise, timeoutPromise]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique seu email e senha.');
      } else if (errorMessage.includes('timeout')) {
        setError('Tempo limite excedido. Verifique sua conexão e tente novamente.');
      } else if (errorMessage.includes('User already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada (incluindo spam) e clique no link de confirmação enviado pelo Supabase.');
      } else if (errorMessage.includes('Too many requests')) {
        setError('Muitas tentativas. Tente novamente em alguns minutos.');
      } else {
        setError(`Erro ao ${isSignup ? 'criar conta' : 'fazer login'}: ${errorMessage}`);
      }
    }
  };

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForConfirmation
      });
      
      if (error) throw error;
      
      setMessage('E-mail de confirmação reenviado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reenviar confirmação';
      setError(errorMessage);
    }
  };

  const handleBackToLogin = () => {
    setShowEmailConfirmation(false);
    setIsSignup(false);
    setEmailForConfirmation('');
    setError('');
    setMessage('');
  };

  // Email Confirmation Screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Confirme seu E-mail</h1>
            <p className="text-gray-600 mt-2">Quase lá! Precisamos verificar seu e-mail.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">E-mail enviado para:</h3>
                  <p className="text-sm text-blue-700 font-mono mt-1">{emailForConfirmation}</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>📧 Verifique sua caixa de entrada (e spam) para encontrar o e-mail de confirmação.</p>
              <p>🔗 Clique no link de confirmação para ativar sua conta.</p>
              <p>⏰ O link expira em 24 horas.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Reenviando...' : 'Reenviar E-mail de Confirmação'}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Voltar ao Login
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Não recebeu o e-mail? Verifique sua pasta de spam ou aguarde alguns minutos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DEA PDI</h1>
          <p className="text-gray-600">Desenvolvimento Individual</p>
          <div className="flex items-center justify-center mt-4 space-x-1">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isSignup 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSignup 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome (apenas no signup) */}
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                  required={isSignup}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role (apenas no signup) */}
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="colaborador">Colaborador</option>
                <option value="gestor">Gestor</option>
                <option value="rh">RH</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (isSignup ? 'Criando conta...' : 'Entrando...') : (isSignup ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;