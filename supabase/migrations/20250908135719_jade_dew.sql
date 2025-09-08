/*
  # Atualizar políticas RLS para profiles

  1. Security
    - Remove política existente se houver conflito
    - Cria nova política para INSERT que funciona corretamente
    - Garante que usuários autenticados possam criar seus próprios perfis
*/

-- Remove política existente se houver conflito
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;

-- Cria política para permitir INSERT de perfis próprios
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Garante que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;