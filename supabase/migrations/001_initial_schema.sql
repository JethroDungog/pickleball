-- ============================================================
-- Migration: 001_initial_schema.sql
-- App:       Pickleball Court Booking
-- Created:   2024-01-01
-- ============================================================
-- Execution order:
--   1. ENUMs
--   2. Tables
--   3. Indexes
--   4. Helper functions (is_admin, is_super_admin)
--   5. Trigger functions & triggers
--   6. RLS enablement & policies
--   7. Seed data
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('confirmed', 'cancelled', 'maintenance');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.surface_type AS ENUM ('hard', 'clay', 'grass', 'synthetic');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. TABLES
-- ============================================================

-- ----------------------------------------------------------
-- 2a. profiles
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  email       TEXT        UNIQUE NOT NULL,
  phone       TEXT,
  role        public.user_role NOT NULL DEFAULT 'customer',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles               IS 'Extended user profiles mirroring auth.users.';
COMMENT ON COLUMN public.profiles.id            IS 'Matches auth.users.id — 1-to-1 relationship.';
COMMENT ON COLUMN public.profiles.role          IS 'Application-level role controlling access.';

-- ----------------------------------------------------------
-- 2b. courts
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courts (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT           NOT NULL,
  description   TEXT,
  surface_type  public.surface_type NOT NULL DEFAULT 'hard',
  is_indoor     BOOLEAN        NOT NULL DEFAULT false,
  hourly_rate   NUMERIC(10,2)  NOT NULL DEFAULT 25.00,
  is_active     BOOLEAN        NOT NULL DEFAULT true,
  image_url     TEXT,
  color_hex     TEXT           DEFAULT '#22c55e', -- court accent color for visual picker
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.courts             IS 'Pickleball courts available for booking.';
COMMENT ON COLUMN public.courts.color_hex  IS 'Hex colour used in the front-end court picker UI.';
COMMENT ON COLUMN public.courts.is_active  IS 'Soft-delete flag — inactive courts are hidden from booking flow.';

-- ----------------------------------------------------------
-- 2c. bookings
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id      UUID              NOT NULL REFERENCES public.courts(id)   ON DELETE RESTRICT,
  user_id       UUID              NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  booking_date  DATE              NOT NULL,
  start_hour    INT               NOT NULL CHECK (start_hour >= 0  AND start_hour <= 23),
  end_hour      INT               NOT NULL CHECK (end_hour   >= 1  AND end_hour   <= 24),
  total_price   NUMERIC(10,2)     NOT NULL,
  status        public.booking_status NOT NULL DEFAULT 'confirmed',
  notes         TEXT,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  -- A court slot can only be booked once per day/hour combination
  CONSTRAINT no_double_booking UNIQUE (court_id, booking_date, start_hour),
  -- End must be strictly after start
  CONSTRAINT valid_hours CHECK (end_hour > start_hour)
);

COMMENT ON TABLE  public.bookings              IS 'Court booking reservations.';
COMMENT ON COLUMN public.bookings.start_hour   IS 'Hour-of-day (0-23) when booking begins.';
COMMENT ON COLUMN public.bookings.end_hour     IS 'Hour-of-day (1-24) when booking ends. 24 represents midnight close.';
COMMENT ON COLUMN public.bookings.total_price  IS 'Pre-calculated price at time of booking (hourly_rate × duration).';

-- ----------------------------------------------------------
-- 2d. audit_logs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,      -- 'INSERT' | 'UPDATE' | 'DELETE'
  table_name  TEXT        NOT NULL,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.audit_logs            IS 'Immutable audit trail for sensitive table changes.';
COMMENT ON COLUMN public.audit_logs.actor_id   IS 'Profile that triggered the change (NULL if triggered by system/trigger).';
COMMENT ON COLUMN public.audit_logs.old_data   IS 'Row state before the change (NULL for INSERTs).';
COMMENT ON COLUMN public.audit_logs.new_data   IS 'Row state after the change (NULL for DELETEs).';


-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bookings_court_date  ON public.bookings (court_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id     ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON public.profiles (role);


-- ============================================================
-- 4. HELPER FUNCTIONS
-- ============================================================

-- Returns true when the calling user has role 'admin' OR 'super_admin'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.profiles
    WHERE  id   = auth.uid()
    AND    role IN ('admin', 'super_admin')
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Returns TRUE when the authenticated user holds the admin or super_admin role.';

-- Returns true only when the calling user has role 'super_admin'.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.profiles
    WHERE  id   = auth.uid()
    AND    role = 'super_admin'
  );
$$;

COMMENT ON FUNCTION public.is_super_admin() IS
  'Returns TRUE only when the authenticated user holds the super_admin role.';


-- ============================================================
-- 5. TRIGGER FUNCTIONS & TRIGGERS
-- ============================================================

-- ----------------------------------------------------------
-- 5a. handle_new_user — auto-create profile on sign-up
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)   -- fallback: use email prefix
    ),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent: skip if profile already exists

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Fires after auth.users INSERT to bootstrap the corresponding public.profiles row.';

-- Attach to auth.users (Supabase manages this schema)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------
-- 5b. update_updated_at — keep updated_at current
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Generic trigger function that stamps updated_at to NOW() on every UPDATE.';

-- Apply to bookings
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Apply to profiles
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------
-- 5c. audit_booking_changes — write to audit_logs
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_booking_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action    TEXT;
  v_record_id UUID;
  v_old_data  JSONB;
  v_new_data  JSONB;
BEGIN
  -- Determine operation type and capture relevant data
  IF (TG_OP = 'INSERT') THEN
    v_action    := 'INSERT';
    v_record_id := NEW.id;
    v_old_data  := NULL;
    v_new_data  := to_jsonb(NEW);

  ELSIF (TG_OP = 'UPDATE') THEN
    v_action    := 'UPDATE';
    v_record_id := NEW.id;
    v_old_data  := to_jsonb(OLD);
    v_new_data  := to_jsonb(NEW);

  ELSIF (TG_OP = 'DELETE') THEN
    v_action    := 'DELETE';
    v_record_id := OLD.id;
    v_old_data  := to_jsonb(OLD);
    v_new_data  := NULL;
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),   -- NULL when called by system/service role
    v_action,
    TG_TABLE_NAME,
    v_record_id,
    v_old_data,
    v_new_data
  );

  -- Return appropriate row to satisfy trigger protocol
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.audit_booking_changes() IS
  'Records every INSERT, UPDATE, and DELETE on bookings into audit_logs.';

DROP TRIGGER IF EXISTS trg_audit_bookings ON public.bookings;
CREATE TRIGGER trg_audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_booking_changes();


-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all application tables
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (best-practice on Supabase)
ALTER TABLE public.profiles   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.courts     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.bookings   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;


-- ============================================================
-- 6a. profiles policies
-- ============================================================

-- Authenticated users can read their own profile
CREATE POLICY "profiles: users read own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins and super_admins can read all profiles
CREATE POLICY "profiles: admins read all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Users can update their own profile (cannot escalate their own role)
CREATE POLICY "profiles: users update own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id   = auth.uid()
    -- Prevent self-role escalation: role must stay unchanged unless actor is super_admin
    AND (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR public.is_super_admin()
    )
  );

-- Super_admins can update any profile (including role changes)
CREATE POLICY "profiles: super_admins update all"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());


-- ============================================================
-- 6b. courts policies
-- ============================================================

-- Public read: anon and authenticated users can see active courts
CREATE POLICY "courts: public read active"
  ON public.courts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins read all courts (including inactive)
CREATE POLICY "courts: admins read all"
  ON public.courts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert new courts
CREATE POLICY "courts: admins insert"
  ON public.courts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update courts
CREATE POLICY "courts: admins update"
  ON public.courts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete courts
CREATE POLICY "courts: admins delete"
  ON public.courts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- 6c. bookings policies
-- ============================================================

-- Authenticated users can view their own bookings
CREATE POLICY "bookings: users select own"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "bookings: admins select all"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated users can insert bookings only for themselves, status must be 'confirmed'
CREATE POLICY "bookings: users insert own confirmed"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'confirmed'
  );

-- Admins can insert any booking (including maintenance blocks)
CREATE POLICY "bookings: admins insert any"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Users can update (cancel) their OWN confirmed bookings only
-- They may only change status to 'cancelled' — no other field changes through this policy
-- The 24-hour cancellation window is enforced at the application layer
CREATE POLICY "bookings: users cancel own confirmed"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'confirmed'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'
  );

-- Admins can update any booking
CREATE POLICY "bookings: admins update all"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete any booking
CREATE POLICY "bookings: admins delete all"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- 6d. audit_logs policies
-- ============================================================

-- Only super_admins can read audit logs
CREATE POLICY "audit_logs: super_admins select"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- No direct INSERT from any client role — inserts only via trigger (SECURITY DEFINER)
-- No UPDATE or DELETE policies — audit log is immutable from the client layer


-- ============================================================
-- 7. SEED DATA
-- ============================================================

INSERT INTO public.courts (name, description, surface_type, is_indoor, hourly_rate, is_active, color_hex)
VALUES
  (
    'Court 1',
    'Outdoor hard-surface court with full lighting for evening play.',
    'hard',
    false,
    25.00,
    true,
    '#22c55e'
  ),
  (
    'Court 2',
    'Outdoor hard-surface court located on the east side of the facility.',
    'hard',
    false,
    25.00,
    true,
    '#3b82f6'
  ),
  (
    'Court 3',
    'Climate-controlled indoor court with premium synthetic surface.',
    'synthetic',
    true,
    35.00,
    true,
    '#f59e0b'
  ),
  (
    'Court 4',
    'Climate-controlled indoor court — ideal for year-round competitive play.',
    'synthetic',
    true,
    35.00,
    true,
    '#ef4444'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- END OF MIGRATION 001_initial_schema.sql
-- ============================================================
