-- Fix security definer view issue
-- Drop the view and recreate without security definer
DROP VIEW IF EXISTS public.public_profiles;

-- Create view without security definer (invoker's rights)
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker=true) AS
SELECT 
  id,
  first_name,
  last_name,
  company_name,
  business_type,
  business_city_id,
  short_description,
  long_description,
  profile_image_url,
  slug,
  website,
  years_experience,
  works_online,
  works_locally_only,
  has_physical_office,
  latitude,
  longitude,
  professional_organizations,
  linkedin_url,
  facebook_url,
  instagram_url,
  is_active,
  registration_completed,
  created_at,
  updated_at
FROM public.profiles
WHERE is_active = true AND registration_completed = true;