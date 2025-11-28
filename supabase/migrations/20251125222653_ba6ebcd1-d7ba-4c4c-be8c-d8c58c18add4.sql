-- Add show_map_search setting to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN show_map_search BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.site_settings.show_map_search IS 'Prikazuje pretragu po imenu profesionalca direktno na mapi na početnoj stranici';