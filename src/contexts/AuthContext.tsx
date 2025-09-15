import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getCurrentUser, getUserProfile, signOut as supabaseSignOut, createUserProfile } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('📝 Session found, loading profile...');
          await loadUserProfile(session.user);
        } else {
          console.log('❌ No session found');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Função para gerar URL de avatar baseado no nome
  const generateAvatarUrl = (nome: string) => {
    const initials = nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=3b82f6&color=ffffff&size=150&font-size=0.6`;
  };

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('👤 Loading profile for user:', supabaseUser.id);
      const profile = await getUserProfile(supabaseUser.id);
      
      if (profile) {
        const user: User = {
          id: profile.user_id, // Use user_id instead of id for consistency
          nome: profile.nome,
          email: profile.email,
          role: profile.role,
          status: profile.status,
          data_admissao: profile.data_admissao,
          data_desligamento: profile.data_desligamento,
          time_id: profile.time_id,
          gestor_id: profile.gestor_id,
          localizacao: profile.localizacao,
          bio: profile.bio,
          formacao: profile.formacao,
          trilha_id: profile.trilha_id,
          avatar: generateAvatarUrl(profile.nome),
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };
        
        console.log('✅ Profile loaded successfully:', user.nome);
        setUser(user);
      } else {
        console.error('❌ Profile not found for user:', supabaseUser.id);
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ Login successful');
        await loadUserProfile(data.user);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signup = async (email: string, password: string, nome: string, role: 'admin' | 'gestor' | 'colaborador' | 'rh' = 'colaborador') => {
    try {
      console.log('📝 Attempting signup for:', email);
      
      // 1. Criar usuário no Supabase Auth  
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            role
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      // 2. Criar perfil na tabela profiles se o usuário foi criado
      if (data.user) {
        try {
          await createUserProfile(data.user.id, email, {
            nome,
            role
          });
          
          console.log('✅ Profile created successfully for user:', data.user.id);
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // If profile creation fails, still allow signup to complete
          console.log('Profile creation failed, but user account was created.');
        }
      }

      // 3. Verificar se precisa de confirmação de email
      if (data.user && !data.session) {
        // User created but needs email confirmation - this is normal
        return { 
          success: true, 
          message: 'Conta criada com sucesso! Verifique seu email (incluindo spam) para confirmar a conta. Após clicar no link de confirmação, você poderá fazer login.',
          needsConfirmation: true 
        };
      }

      // 4. Se temos uma sessão, carregar o perfil
      if (data.session && data.user) {
        // Automatic login - load profile
        try {
          await loadUserProfile(data.user);
          return { success: true, message: 'Conta criada e login realizado com sucesso!' };
        } catch (loadError) {
          console.error('Error loading profile after signup:', loadError);
          return { 
            success: true, 
            message: 'Conta criada com sucesso! Faça login para acessar sua conta.',
            needsConfirmation: false 
          };
        }
      }

      // Unexpected case
      return { 
        success: true, 
        message: 'Conta criada com sucesso! Faça login para continuar.',
        needsConfirmation: false 
      };

    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('User already registered')) {
        throw new Error('Este email já está cadastrado. Tente fazer login ou use outro email.');
      } else if (error.message?.includes('Password should be at least')) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Por favor, insira um email válido.');
      } else {
        throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
      }
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      const { error } = await supabaseSignOut();
      if (error) throw error;
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
    }
  };

  // Função para atualizar perfil do usuário
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nome: updates.nome,
          bio: updates.bio,
          localizacao: updates.localizacao,
          formacao: updates.formacao,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updates, updated_at: data.updated_at } : null);
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};