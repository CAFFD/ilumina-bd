
-- Corrigir políticas permissivas das tabelas existentes (addresses, neighborhoods, poles)
-- Restringir INSERT e UPDATE para admins e operadores

-- == addresses ==
DROP POLICY IF EXISTS "Addresses are insertable by authenticated users" ON public.addresses;
DROP POLICY IF EXISTS "Addresses are updatable by authenticated users" ON public.addresses;

CREATE POLICY "Admins and operators insert addresses" ON public.addresses
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_operator());

CREATE POLICY "Admins and operators update addresses" ON public.addresses
  FOR UPDATE USING (public.is_admin() OR public.is_operator());

-- == neighborhoods ==
DROP POLICY IF EXISTS "Neighborhoods are insertable by authenticated users" ON public.neighborhoods;
DROP POLICY IF EXISTS "Neighborhoods are updatable by authenticated users" ON public.neighborhoods;

CREATE POLICY "Admins and operators insert neighborhoods" ON public.neighborhoods
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_operator());

CREATE POLICY "Admins and operators update neighborhoods" ON public.neighborhoods
  FOR UPDATE USING (public.is_admin() OR public.is_operator());

-- == poles ==
DROP POLICY IF EXISTS "Poles are insertable by authenticated users" ON public.poles;
DROP POLICY IF EXISTS "Poles are updatable by authenticated users" ON public.poles;

CREATE POLICY "Admins and operators insert poles" ON public.poles
  FOR INSERT WITH CHECK (public.is_admin() OR public.is_operator());

CREATE POLICY "Admins and operators update poles" ON public.poles
  FOR UPDATE USING (public.is_admin() OR public.is_operator());
