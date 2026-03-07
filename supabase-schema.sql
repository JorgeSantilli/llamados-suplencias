-- =============================================
-- TABLA: tenants (instituciones educativas)
-- =============================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cue TEXT,
  nivel TEXT NOT NULL CHECK (nivel IN (
    'Inicial', 'Primario', 'Secundario Orientado',
    'Secundario Técnico', 'Educación Especial',
    'CENS', 'CEBJA', 'Otro'
  )),
  departamento TEXT,
  localidad TEXT,
  domicilio TEXT,
  zona_porcentaje TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: profiles (usuarios vinculados a tenants)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre_completo TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('directivo', 'supervisor', 'secretario', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: llamados
-- =============================================
CREATE TABLE public.llamados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  tipo_cargo TEXT NOT NULL CHECK (tipo_cargo IN (
    'cargo_inicial', 'materias_especiales', 'maestro_secretario',
    'vicedirector', 'director_libre', 'director_maestro',
    'inspector_seccional', 'inspector_regional'
  )),
  cargo_nombre TEXT NOT NULL,
  causa_suplencia TEXT NOT NULL CHECK (causa_suplencia IN (
    'licencia', 'vacante', 'cambio_funciones', 'traslado', 'otra'
  )),
  instancia_llamado INTEGER NOT NULL DEFAULT 1,
  modalidad TEXT NOT NULL CHECK (modalidad IN ('virtual', 'presencial')),
  fecha_llamado TIMESTAMPTZ,
  hora_llamado TIME,
  turno TEXT CHECK (turno IN ('Mañana', 'Tarde', 'Vespertino')),
  horas_catedra INTEGER,
  materia TEXT,
  curso TEXT,
  articulo TEXT,
  duracion_estimada TEXT,
  ia_prioridades JSONB,
  ia_requisitos JSONB,
  ia_condiciones JSONB,
  ia_documentacion JSONB,
  ia_observaciones TEXT,
  ia_anexo_aplicable TEXT,
  ia_raw_response JSONB,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN (
    'borrador', 'validado', 'publicado', 'cancelado'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS: Habilitar en todas las tablas
-- =============================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llamados ENABLE ROW LEVEL SECURITY;

-- Helper function para obtener tenant_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- TENANTS: solo ver el propio
CREATE POLICY "tenant_select" ON public.tenants
  FOR SELECT USING (id = public.get_my_tenant_id());

-- Permitir INSERT sin restriccion para registro (el tenant se crea antes del profile)
CREATE POLICY "tenant_insert" ON public.tenants
  FOR INSERT WITH CHECK (true);

-- PROFILES: solo ver los de mi tenant
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- LLAMADOS: CRUD aislado por tenant
CREATE POLICY "llamados_select" ON public.llamados
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "llamados_insert" ON public.llamados
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

CREATE POLICY "llamados_update" ON public.llamados
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

CREATE POLICY "llamados_delete" ON public.llamados
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

-- =============================================
-- TRIGGER: Crear profile automaticamente al registrarse
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, tenant_id, email, nombre_completo, rol)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'tenant_id')::uuid,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'directivo')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
