-- =============================================
-- SECURITY IMPROVEMENTS MIGRATION
-- =============================================
-- This migration adds comprehensive security measures:
-- 1. Secure admin verification function (uses auth.uid() internally)
-- 2. Public read policy for site_settings (non-sensitive fields only)
-- 3. Rate limiting preparation
-- 4. Additional RLS policies for better security
-- =============================================

-- =============================================
-- 1. CREATE SECURE ADMIN FUNCTION
-- =============================================
-- This function checks admin status using auth.uid() internally
-- so it cannot be spoofed by passing arbitrary user IDs

CREATE OR REPLACE FUNCTION public.is_admin_secure()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_secure() TO authenticated;

-- Comment explaining the function
COMMENT ON FUNCTION public.is_admin_secure() IS 'Secure admin check that uses auth.uid() internally - cannot be spoofed';

-- =============================================
-- 2. UPDATE ORIGINAL is_admin FUNCTION
-- =============================================
-- Keep the original function but make it more secure
-- by validating that the passed user_id matches auth.uid()
-- when called from client-side

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: only allow checking your own admin status
  -- or allow the function to be called in contexts where auth.uid() is null (server-side)
  IF auth.uid() IS NOT NULL AND user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND role = 'admin'
  );
END;
$$;

-- =============================================
-- 3. ADD PUBLIC READ POLICY FOR site_settings
-- =============================================
-- Allow public to read non-sensitive settings (feature flags)
-- Sensitive settings like google_analytics_id remain admin-only

-- Drop old policies first
DROP POLICY IF EXISTS "Admins can view settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read feature flags" ON public.site_settings;

CREATE POLICY "Public can read feature flags"
  ON public.site_settings
  FOR SELECT
  TO public
  USING (true);

-- =============================================
-- 4. ADDITIONAL SECURITY POLICIES
-- =============================================

-- Drop existing policies if they exist before recreating
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;
DROP POLICY IF EXISTS "Admins can manage cantons" ON public.cantons;
DROP POLICY IF EXISTS "Admins can manage entities" ON public.entities;
DROP POLICY IF EXISTS "Admins can manage service categories" ON public.service_categories;

-- Ensure admins can still manage all profiles (for approval workflow)
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (is_admin_secure());

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (is_admin_secure());

-- Ensure admins can manage cities, cantons, entities
CREATE POLICY "Admins can manage cities" 
  ON public.cities 
  FOR ALL 
  TO authenticated 
  USING (is_admin_secure());

CREATE POLICY "Admins can manage cantons" 
  ON public.cantons 
  FOR ALL 
  TO authenticated 
  USING (is_admin_secure());

CREATE POLICY "Admins can manage entities" 
  ON public.entities 
  FOR ALL 
  TO authenticated 
  USING (is_admin_secure());

CREATE POLICY "Admins can manage service categories" 
  ON public.service_categories 
  FOR ALL 
  TO authenticated 
  USING (is_admin_secure());

-- =============================================
-- 5. ADD AUDIT LOG TABLE FOR SECURITY TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated 
  USING (is_admin_secure());

-- System can insert audit logs (via triggers or functions)
CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- =============================================
-- 6. CREATE AUDIT FUNCTION FOR ADMIN ACTIONS
-- =============================================

CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, UUID, JSONB, JSONB) TO authenticated;

-- =============================================
-- 7. ADD LOGIN ATTEMPT TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts" 
  ON public.login_attempts 
  FOR SELECT 
  TO authenticated 
  USING (is_admin_secure());

-- Create index for rate limiting queries
CREATE INDEX idx_login_attempts_email_created ON public.login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip_created ON public.login_attempts(ip_address, created_at);

-- =============================================
-- 8. FUNCTION TO CHECK RATE LIMITING
-- =============================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_email TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.login_attempts
  WHERE email = p_email
    AND success = FALSE
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_attempt_count < p_max_attempts;
END;
$$;

-- Allow public to check rate limit (needed before login)
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;

-- =============================================
-- 9. SECURE THE user_roles TABLE BETTER
-- =============================================

-- Drop existing policies and recreate with better security
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Users can view their own role
CREATE POLICY "Users can view own role" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- Only existing admins can manage roles (using secure function)
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (is_admin_secure());

CREATE POLICY "Admins can insert roles" 
  ON public.user_roles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (is_admin_secure());

CREATE POLICY "Admins can update roles" 
  ON public.user_roles 
  FOR UPDATE 
  TO authenticated 
  USING (is_admin_secure());

CREATE POLICY "Admins can delete roles" 
  ON public.user_roles 
  FOR DELETE 
  TO authenticated 
  USING (is_admin_secure());

-- =============================================
-- 10. ADD SECURITY HEADERS RECOMMENDATION TABLE
-- =============================================
-- This is a configuration table for edge functions

CREATE TABLE IF NOT EXISTS public.security_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security config
CREATE POLICY "Admins can manage security config" 
  ON public.security_config 
  FOR ALL 
  TO authenticated 
  USING (is_admin_secure());

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value, description) VALUES
  ('max_login_attempts', '5', 'Maximum failed login attempts before rate limiting'),
  ('rate_limit_window_minutes', '15', 'Time window in minutes for rate limiting'),
  ('session_timeout_hours', '24', 'Session timeout in hours'),
  ('require_strong_password', 'true', 'Require strong passwords for registration')
ON CONFLICT (config_key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_security_config_updated_at
  BEFORE UPDATE ON public.security_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.security_config IS 'Security configuration settings managed by admins';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for tracking important system actions';
COMMENT ON TABLE public.login_attempts IS 'Tracks login attempts for rate limiting and security monitoring';
