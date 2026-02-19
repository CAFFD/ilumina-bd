
-- ============================================================
-- 🏙️ Zeladoria Urbana - Schema Completo
-- ============================================================

-- 1. ENUM DE ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'citizen');

-- 2. ENUM DE STATUS
CREATE TYPE public.occurrence_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'cancelled');
CREATE TYPE public.work_order_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- 3. TABELA DE ROLES (user_roles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. TABELA DE PERFIS (profiles)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. CATEGORIAS DE OCORRÊNCIA
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 6. HISTÓRICO DE IDs DE POSTES
CREATE TABLE public.pole_id_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pole_id UUID REFERENCES public.poles(id) ON DELETE CASCADE NOT NULL,
  old_external_id TEXT NOT NULL,
  new_external_id TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pole_id_history ENABLE ROW LEVEL SECURITY;

-- 7. OCORRÊNCIAS
CREATE TABLE public.occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol TEXT NOT NULL UNIQUE DEFAULT 'OC-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  pole_id UUID REFERENCES public.poles(id),
  title TEXT NOT NULL,
  description TEXT,
  status occurrence_status NOT NULL DEFAULT 'open',
  priority priority_level NOT NULL DEFAULT 'medium',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  reporter_name TEXT,
  reporter_phone TEXT,
  reporter_email TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_occurrences_status ON public.occurrences(status);
CREATE INDEX idx_occurrences_user ON public.occurrences(user_id);
CREATE INDEX idx_occurrences_pole ON public.occurrences(pole_id);
CREATE INDEX idx_occurrences_protocol ON public.occurrences(protocol);

-- 8. IMAGENS DE OCORRÊNCIAS
CREATE TABLE public.occurrence_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.occurrence_images ENABLE ROW LEVEL SECURITY;

-- 9. ORDENS DE SERVIÇO
CREATE TABLE public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  status work_order_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_work_orders_assigned ON public.work_orders(assigned_to);

-- 10. LOG DE ATIVIDADES
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_target ON public.activity_logs(target_table, target_id);

-- ============================================================
-- FUNÇÕES HELPER (SECURITY DEFINER)
-- ============================================================

-- Verifica se o usuário tem determinado role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Atalho: é admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Atalho: é operador?
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'operator')
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_occurrences_updated_at
  BEFORE UPDATE ON public.occurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- == user_roles ==
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update roles" ON public.user_roles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE USING (public.is_admin());

-- == profiles ==
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- == categories ==
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete categories" ON public.categories FOR DELETE USING (public.is_admin());

-- == pole_id_history ==
CREATE POLICY "Admins and operators view history" ON public.pole_id_history FOR SELECT USING (public.is_admin() OR public.is_operator());
CREATE POLICY "Admins insert history" ON public.pole_id_history FOR INSERT WITH CHECK (public.is_admin());

-- == occurrences ==
CREATE POLICY "Occurrences viewable by everyone" ON public.occurrences FOR SELECT USING (true);
CREATE POLICY "Authenticated users create occurrences" ON public.occurrences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Operators and admins update occurrences" ON public.occurrences FOR UPDATE USING (public.is_admin() OR public.is_operator());
CREATE POLICY "Admins delete occurrences" ON public.occurrences FOR DELETE USING (public.is_admin());

-- == occurrence_images ==
CREATE POLICY "Images viewable by everyone" ON public.occurrence_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users upload images" ON public.occurrence_images FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins delete images" ON public.occurrence_images FOR DELETE USING (public.is_admin());

-- == work_orders ==
CREATE POLICY "Operators and admins view work orders" ON public.work_orders FOR SELECT USING (public.is_admin() OR public.is_operator());
CREATE POLICY "Operators and admins create work orders" ON public.work_orders FOR INSERT WITH CHECK (public.is_admin() OR public.is_operator());
CREATE POLICY "Operators and admins update work orders" ON public.work_orders FOR UPDATE USING (public.is_admin() OR public.is_operator());
CREATE POLICY "Admins delete work orders" ON public.work_orders FOR DELETE USING (public.is_admin());

-- == activity_logs ==
CREATE POLICY "Admins view logs" ON public.activity_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System inserts logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED: CATEGORIAS PADRÃO
-- ============================================================
INSERT INTO public.categories (name, description, icon) VALUES
  ('Lâmpada Queimada', 'Poste com lâmpada apagada ou queimada', 'lightbulb-off'),
  ('Poste Danificado', 'Poste com estrutura danificada ou inclinado', 'alert-triangle'),
  ('Fiação Exposta', 'Fios expostos ou soltos no poste', 'zap'),
  ('Poste Sem Número', 'Poste sem identificação visível', 'hash'),
  ('Iluminação Fraca', 'Luminária com baixa intensidade', 'sun-dim'),
  ('Vandalismo', 'Poste vandalizado ou com componentes furtados', 'shield-alert'),
  ('Novo Ponto de Luz', 'Solicitação de instalação de novo ponto', 'plus-circle'),
  ('Outros', 'Outras situações não listadas', 'more-horizontal')
ON CONFLICT (name) DO NOTHING;
