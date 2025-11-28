-- Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'user');
CREATE TYPE entity_type AS ENUM ('fbih', 'rs', 'brcko');
CREATE TYPE business_type AS ENUM ('company', 'individual');

-- Entities and locations
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code entity_type NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cantons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, entity_id)
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  canton_id UUID REFERENCES cantons(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, postal_code)
);

-- Service categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  slug TEXT UNIQUE,
  
  -- Personal address
  personal_street TEXT,
  personal_city_id UUID REFERENCES cities(id),
  
  -- Business data
  business_type business_type,
  company_name TEXT,
  website TEXT,
  tax_id TEXT,
  business_street TEXT,
  business_city_id UUID REFERENCES cities(id),
  
  -- Work details
  years_experience INTEGER DEFAULT 0,
  short_description TEXT,
  long_description TEXT,
  
  -- Availability
  works_online BOOLEAN DEFAULT false,
  has_physical_office BOOLEAN DEFAULT false,
  works_locally_only BOOLEAN DEFAULT false,
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  
  -- Social media
  linkedin_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  
  -- Membership
  professional_organizations TEXT,
  
  is_active BOOLEAN DEFAULT true,
  registration_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile services (many-to-many)
CREATE TABLE profile_services (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, service_id)
);

-- Working hours
CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, day_of_week)
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery images
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client references
CREATE TABLE client_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cantons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read for location data
CREATE POLICY "Public can view entities" ON entities FOR SELECT TO public USING (true);
CREATE POLICY "Public can view cantons" ON cantons FOR SELECT TO public USING (true);
CREATE POLICY "Public can view cities" ON cities FOR SELECT TO public USING (true);
CREATE POLICY "Public can view service categories" ON service_categories FOR SELECT TO public USING (true);

-- RLS Policies - Profiles (public read for active, authenticated users can manage own)
CREATE POLICY "Public can view active profiles" ON profiles FOR SELECT TO public USING (is_active = true AND registration_completed = true);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies - Profile related data (public read, users manage own)
CREATE POLICY "Public can view profile services" ON profile_services FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage own services" ON profile_services FOR ALL TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Public can view working hours" ON working_hours FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage own hours" ON working_hours FOR ALL TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Public can view certificates" ON certificates FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage own certificates" ON certificates FOR ALL TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Public can view gallery" ON gallery_images FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage own gallery" ON gallery_images FOR ALL TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Public can view references" ON client_references FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage own references" ON client_references FOR ALL TO authenticated USING (profile_id = auth.uid());

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND role = 'admin'
  );
$$;

-- Admin policies for user_roles
CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(first_name TEXT, last_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from first and last name
  base_slug := lower(regexp_replace(first_name || '-' || last_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  
  final_slug := base_slug;
  
  -- Check if slug exists, if so add counter
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug on profile creation
CREATE OR REPLACE FUNCTION set_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := generate_unique_slug(NEW.first_name, NEW.last_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profile_slug_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_profile_slug();

-- Insert initial data for BiH
INSERT INTO entities (name, code) VALUES
  ('Federacija BiH', 'fbih'),
  ('Republika Srpska', 'rs'),
  ('Brčko Distrikt', 'brcko');

-- Insert cantons (only for FBiH)
INSERT INTO cantons (name, entity_id) 
SELECT 'Unsko-sanski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Posavski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Tuzlanski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Zeničko-dobojski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Bosansko-podrinjski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Srednjobosanski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Hercegovačko-neretvanski kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Zapadnohercegovački kanton', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Kanton Sarajevo', id FROM entities WHERE code = 'fbih'
UNION ALL
SELECT 'Kanton 10', id FROM entities WHERE code = 'fbih';

-- Insert some major cities
INSERT INTO cities (name, postal_code, entity_id, canton_id)
SELECT 'Sarajevo', '71000', e.id, c.id 
FROM entities e
LEFT JOIN cantons c ON c.name = 'Kanton Sarajevo' AND c.entity_id = e.id
WHERE e.code = 'fbih'
UNION ALL
SELECT 'Banja Luka', '78000', id, NULL FROM entities WHERE code = 'rs'
UNION ALL
SELECT 'Tuzla', '75000', e.id, c.id 
FROM entities e
LEFT JOIN cantons c ON c.name = 'Tuzlanski kanton' AND c.entity_id = e.id
WHERE e.code = 'fbih'
UNION ALL
SELECT 'Zenica', '72000', e.id, c.id 
FROM entities e
LEFT JOIN cantons c ON c.name = 'Zeničko-dobojski kanton' AND c.entity_id = e.id
WHERE e.code = 'fbih'
UNION ALL
SELECT 'Mostar', '88000', e.id, c.id 
FROM entities e
LEFT JOIN cantons c ON c.name = 'Hercegovačko-neretvanski kanton' AND c.entity_id = e.id
WHERE e.code = 'fbih'
UNION ALL
SELECT 'Brčko', '76100', id, NULL FROM entities WHERE code = 'brcko';

-- Insert initial service categories
INSERT INTO service_categories (name, description) VALUES
  ('Knjigovodstvene usluge', 'Vođenje poslovnih knjiga i finansijskih evidencija'),
  ('Računovodstvene usluge', 'Priprema i analiza finansijskih izvještaja'),
  ('Revizorske usluge', 'Revizija finansijskih izvještaja'),
  ('Porezno savjetovanje', 'Savjetovanje o poreskim obavezama i optimizaciji'),
  ('Finansijsko planiranje', 'Izrada finansijskih planova i budžeta'),
  ('Obračun plata', 'Obračun zarada i doprinosa'),
  ('Konsultantske usluge', 'Poslovne i finansijske konsultacije');

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies
CREATE POLICY "Public can view profile images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own profile images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own profile images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view certificates" ON storage.objects FOR SELECT TO public USING (bucket_id = 'certificates');
CREATE POLICY "Authenticated users can upload certificates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own certificates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view gallery" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
CREATE POLICY "Authenticated users can upload gallery images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own gallery images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND auth.uid()::text = (storage.foldername(name))[1]);