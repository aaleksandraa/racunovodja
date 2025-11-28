-- Add show_verified_filter column to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_verified_filter boolean DEFAULT false;