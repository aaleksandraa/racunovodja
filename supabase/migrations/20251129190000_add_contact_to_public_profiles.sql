-- Add contact fields to public_profiles view for profile cards
DROP VIEW IF EXISTS public_profiles;

CREATE VIEW public_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  company_name,
  business_type,
  short_description,
  long_description,
  profile_image_url,
  website,
  email,
  phone,
  business_city_id,
  business_street,
  latitude,
  longitude,
  works_online,
  has_physical_office,
  works_locally_only,
  years_experience,
  professional_organizations,
  is_active,
  registration_completed,
  created_at,
  updated_at,
  slug,
  facebook_url,
  instagram_url,
  linkedin_url,
  license_type,
  is_license_verified,
  accepting_new_clients
FROM profiles
WHERE is_active = true AND registration_completed = true;

-- Grant access
GRANT SELECT ON public_profiles TO anon;
GRANT SELECT ON public_profiles TO authenticated;
