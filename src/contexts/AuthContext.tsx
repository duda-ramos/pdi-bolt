import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nome: string, role?: 'admin' | 'gestor' | 'colaborador' | 'rh') => Promise<void>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing auth state');
    const supabase = getSupabaseClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider: Error getting session:', error);
          handleError(error, 'Erro ao verificar sessão');
        } else {
          console.log('✅ AuthProvider: Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ AuthProvider: Exception getting session:', error);
        handleError(error as Error, 'Erro ao verificar sessão');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event, session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Set user context for error monitoring
        if (session?.user && window.Sentry) {
          window.Sentry.setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else if (window.Sentry) {
          window.Sentry.setUser(null);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [handleError]);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Starting login for:', email);
      const supabase = getSupabaseClient();
      
      // Generate safe redirect URL for auth
      const redirectUrl = new URL('/auth/callback', window.location.origin).toString();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('❌ AuthProvider: Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ AuthProvider: Login successful for:', data.user.email);
        // Profile will be loaded by the auth state change listener
      }
    } catch (error: any) {
      console.error('❌ AuthProvider: Exception in login:', error);
      
      // Handle navigation errors specifically
      if (error.message?.includes('Cannot navigate to URL')) {
        throw new Error('Erro de navegação. Recarregue a página e tente novamente.');
      }
      
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signup = async (email: string, password: string, nome: string, role: 'admin' | 'gestor' | 'colaborador' | 'rh' = 'colaborador') => {
    try {
      console.log('📝 AuthProvider: Starting signup for:', email, 'Role:', role);
      const supabase = getSupabaseClient();
      
      // Generate safe redirect URL for auth
      const redirectUrl = new URL('/auth/callback', window.location.origin).toString();
      
      // 1. Criar usuário no Supabase Auth  
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome,
            role
          }
        }
      });

      if (error) {
        console.error('❌ AuthProvider: Signup error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ AuthProvider: Signup successful for:', data.user.email);
        // User will need to confirm email before they can login
      }
    } catch (error: any) {
      console.error('❌ AuthProvider: Exception in signup:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthProvider: Starting logout');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthProvider: Logout error:', error);
        throw error;
      }
      
      console.log('✅ AuthProvider: Logout successful');
      
      // Clear user context from error monitoring
      if (window.Sentry) {
        window.Sentry.setUser(null);
      }
    } catch (error: any) {
      console.error('❌ AuthProvider: Exception in logout:', error);
      handleError(error, 'Erro ao fazer logout');
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      console.log('📧 AuthProvider: Resending confirmation for:', email);
      const supabase = getSupabaseClient();
      
      // Generate safe redirect URL for auth
      const redirectUrl = new URL('/auth/callback', window.location.origin).toString();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('❌ AuthProvider: Resend confirmation error:', error);
        throw error;
      }

      console.log('✅ AuthProvider: Confirmation email resent successfully');
    } catch (error: any) {
      console.error('❌ AuthProvider: Exception in resend confirmation:', error);
      throw new Error(error.message || 'Erro ao reenviar confirmação');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};