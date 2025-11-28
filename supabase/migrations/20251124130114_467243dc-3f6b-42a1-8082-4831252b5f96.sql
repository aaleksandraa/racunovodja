-- Create settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_analytics_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to view and manage settings
CREATE POLICY "Admins can view settings"
  ON public.site_settings
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update settings"
  ON public.site_settings
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert settings"
  ON public.site_settings
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.site_settings (google_analytics_id) VALUES (NULL);