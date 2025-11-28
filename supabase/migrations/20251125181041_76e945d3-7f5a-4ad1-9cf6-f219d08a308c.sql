-- Add show_availability_filter to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN show_availability_filter boolean DEFAULT false;

COMMENT ON COLUMN public.site_settings.show_availability_filter IS 'Controls whether the "available for new clients" filter appears in search';