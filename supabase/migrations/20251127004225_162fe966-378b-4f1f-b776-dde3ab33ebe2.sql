-- Add verification display mode to site_settings
ALTER TABLE site_settings 
ADD COLUMN verification_display_mode TEXT DEFAULT 'colored' CHECK (verification_display_mode IN ('colored', 'checkmark'));

COMMENT ON COLUMN site_settings.verification_display_mode IS 'Display mode for verified licenses: colored (blue text) or checkmark (gray text with checkmark icon)';