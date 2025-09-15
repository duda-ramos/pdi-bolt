  const login = async (email: string, password: string) => {
     try {
       console.log('🔐 AuthProvider: Starting login for:', email);
       console.log('🔐 AuthProvider: Attempting login for:', email);
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
         console.error('❌ AuthProvider: Login error:', error);
         throw error;
       }

       if (data.user) {
         console.log('✅ AuthProvider: Login successful for:', data.user.email);
         console.log('✅ AuthProvider: Login successful for:', data.user.email);
         // Profile will be loaded by the auth state change listener
       }
     } catch (error: any) {
       console.error('❌ AuthProvider: Exception in login:', error);
       console.error('❌ AuthProvider: Login error:', error);
      
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
       console.log('📝 AuthProvider: Attempting signup for:', email, 'Role:', role);
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
     } catch (error: any) {
       throw error;
     }
   };