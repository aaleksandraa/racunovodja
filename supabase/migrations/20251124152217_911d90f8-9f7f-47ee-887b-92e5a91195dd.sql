-- ============================================
-- COMPREHENSIVE SECURITY FIXES
-- ============================================

-- 1. DROP existing public SELECT policy for profiles that exposes sensitive data
DROP POLICY IF EXISTS "Public can view active profiles" ON public.profiles;

-- 2. CREATE new public SELECT policy (RLS can't exclude specific columns, so we rely on application layer)
CREATE POLICY "Public can view active profiles"
ON public.profiles
FOR SELECT
TO public
USING ((is_active = true) AND (registration_completed = true));

-- 3. Strengthen user's own profile SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Add DELETE policy for users to delete their own profile (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 5. Add explicit DELETE policies for user-owned data
CREATE POLICY "Users can delete own certificates"
ON public.certificates
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own gallery images"
ON public.gallery_images
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own references"
ON public.client_references
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own services"
ON public.profile_services
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own working hours"
ON public.working_hours
FOR DELETE
TO authenticated
USING (profile_id = auth.uid());

-- 6. Restrict working_hours public access to only active, verified profiles
DROP POLICY IF EXISTS "Public can view working hours" ON public.working_hours;
CREATE POLICY "Public can view working hours of active profiles"
ON public.working_hours
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = working_hours.profile_id
      AND profiles.is_active = true
      AND profiles.registration_completed = true
  )
);

-- 7. Add policy for admins to view ALL profile data including sensitive fields
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 8. Add policy for admins to manage all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete any profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 9. Add security comment to profiles table
COMMENT ON TABLE public.profiles IS 'Professional profiles. Public access restricted to active, completed profiles. Sensitive fields (email, phone, tax_id) must be filtered at application layer for public queries.';

-- 10. Create view for public profile data (excludes sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Grant public access to the view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;