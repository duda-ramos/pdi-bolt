import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSupabaseClient, getCurrentUser, getUserProfile, signOut as supabaseSignOut, createUserProfile } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🏗️ AuthProvider: Component mounting/re-mounting');

  useEffect(() => {
    let mounted = true;
    console.log('🔄 AuthProvider: useEffect triggered, mounted:', mounted);

    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthProvider: Getting initial session...');
        const supabase = getSupabaseClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthProvider: Error getting session:', error);
          if (mounted) {
            console.log('🔄 AuthProvider: Setting loading to false (error case)');
            setLoading(false);
          }
          return;
        }

        console.log('📋 AuthProvider: Session data:', session ? `User: ${session.user.email}` : 'No session');

        if (session?.user && mounted) {
          console.log('📝 AuthProvider: Session found, loading profile...');
          await loadUserProfile(session.user);
        } else {
          console.log('❌ AuthProvider: No session found');
          if (mounted) {
            console.log('🔄 AuthProvider: Setting loading to false (no session)');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error in getInitialSession:', error);
        if (mounted) {
          console.log('🔄 AuthProvider: Setting loading to false (catch block)');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    console.log('👂 AuthProvider: Setting up auth state change listener');
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed:', event, session ? `User: ${session.user.email}` : 'No session');
        
        if (!mounted) {
          console.log('⚠️ AuthProvider: Component unmounted, ignoring auth state change');
          return;
        }

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ AuthProvider: User signed in, loading profile');
            await loadUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 AuthProvider: User signed out, clearing user state');
            setUser(null);
            setLoading(false);
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            console.log('🔄 AuthProvider: Token refreshed, updating profile if needed');
            // Optionally reload profile on token refresh
          }
        } catch (error) {
          console.error('❌ AuthProvider: Error handling auth state change:', error);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 AuthProvider: Cleanup - unmounting, unsubscribing from auth changes');
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
      console.log('👤 AuthProvider: Loading profile for user:', supabaseUser.id, supabaseUser.email);
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
        
        console.log('✅ AuthProvider: Profile loaded successfully:', user.nome, user.role);
        setUser(user);
        setLoading(false);
      } else {
        console.error('❌ AuthProvider: Profile not found for user:', supabaseUser.id);
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error loading user profile:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Attempting login for:', email);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
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
      console.error('❌ AuthProvider: Login error:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signup = async (email: string, password: string, nome: string, role: 'admin' | 'gestor' | 'colaborador' | 'rh' = 'colaborador') => {
    try {
      console.log('📝 AuthProvider: Attempting signup for:', email, 'Role:', role);
      const supabase = getSupabaseClient();
      
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
        console.error('❌ AuthProvider: Signup error:', error);
        throw error;
      }

      console.log('📋 AuthProvider: Signup data:', data.user ? `User created: ${data.user.email}` : 'No user data');

      // 2. Criar perfil na tabela profiles se o usuário foi criado
      if (data.user) {
        try {
          console.log('🆕 AuthProvider: Creating user profile...');
          await createUserProfile(data.user.id, email, {
            nome,
            role
          });
          
          console.log('✅ AuthProvider: Profile created successfully for user:', data.user.id);
        } catch (profileError) {
          console.error('❌ AuthProvider: Error creating user profile:', profileError);
          // If profile creation fails, still allow signup to complete
          console.log('⚠️ AuthProvider: Profile creation failed, but user account was created.');
        }
      }

      // 3. Verificar se precisa de confirmação de email
      if (data.user && !data.session) {
        console.log('📧 AuthProvider: User created but needs email confirmation');
        return { 
          success: true, 
          message: 'Conta criada com sucesso! Verifique seu email (incluindo spam) para confirmar a conta. Após clicar no link de confirmação, você poderá fazer login.',
          needsConfirmation: true 
        };
      }

      // 4. Se temos uma sessão, carregar o perfil
      if (data.session && data.user) {
        console.log('✅ AuthProvider: Automatic login after signup');
        // Profile will be loaded by the auth state change listener
        return { success: true, message: 'Conta criada e login realizado com sucesso!' };
      }

      // Unexpected case
      console.log('⚠️ AuthProvider: Unexpected signup result');
      return { 
        success: true, 
        message: 'Conta criada com sucesso! Faça login para continuar.',
        needsConfirmation: false 
      };

    } catch (error: any) {
      console.error('❌ AuthProvider: Signup error:', error);
      
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
      console.log('🚪 AuthProvider: Logging out...');
      await supabaseSignOut();
      setUser(null);
      setLoading(false);
      console.log('✅ AuthProvider: Logout successful');
    } catch (error) {
      console.error('❌ AuthProvider: Logout error:', error);
      // Still clear user state even if logout fails
      setUser(null);
      setLoading(false);
    }
  };

  // Função para atualizar perfil do usuário
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      console.error('❌ AuthProvider: Cannot update profile - no user authenticated');
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('📝 AuthProvider: Updating profile for user:', user.id, updates);
      const supabase = getSupabaseClient();
      
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

      if (error) {
        console.error('❌ AuthProvider: Error updating profile:', error);
        throw error;
      }

      console.log('✅ AuthProvider: Profile updated successfully');
      // Atualizar estado local
      setUser(prev => prev ? { ...prev, ...updates, updated_at: data.updated_at } : null);
      
      return data;
    } catch (error) {
      console.error('❌ AuthProvider: Error updating profile:', error);
      throw error;
    }
  };

  console.log('🎯 AuthProvider: Rendering with state:', { 
    hasUser: !!user, 
    loading, 
    userName: user?.nome,
    userRole: user?.role 
  });

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