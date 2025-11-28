-- Create license type enum
CREATE TYPE public.license_type AS ENUM ('certified_accountant', 'certified_accounting_technician');

-- Add license fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN license_type public.license_type,
ADD COLUMN license_number text,
ADD COLUMN is_license_verified boolean DEFAULT false;

-- Add admin approval setting to site_settings
ALTER TABLE public.site_settings
ADD COLUMN require_admin_approval boolean DEFAULT false;