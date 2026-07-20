
-- Helper is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Substitui policies existentes da profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_name" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- Garantia de RLS ativado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuário vê o próprio perfil
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admin vê todos os perfis
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- Usuário edita o próprio perfil (nome). Colunas sensíveis ficam protegidas por
-- GRANT de coluna abaixo.
CREATE POLICY "profiles_update_own_name"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin edita qualquer perfil
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Apenas admin pode excluir perfil
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin());

-- Nenhuma policy de INSERT: criação é só via trigger handle_new_user (SECURITY DEFINER).

-- Restringe update por coluna: usuário comum só pode alterar full_name.
-- Admins usam a policy profiles_update_admin com a service_role/coluna liberada.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;
GRANT SELECT, DELETE ON public.profiles TO authenticated;
