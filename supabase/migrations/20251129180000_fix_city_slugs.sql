-- ============================================
-- FIX: Add slug column and update city slugs
-- ============================================

-- First, add the slug column if it doesn't exist
ALTER TABLE cities ADD COLUMN IF NOT EXISTS slug TEXT;

-- Drop existing index if exists (to avoid conflicts during update)
DROP INDEX IF EXISTS cities_slug_idx;

-- Funkcija za kreiranje slug-a (ako ne postoji)
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := lower(input_text);
  
  -- Replace special characters
  slug := replace(slug, 'č', 'c');
  slug := replace(slug, 'ć', 'c');
  slug := replace(slug, 'đ', 'dj');
  slug := replace(slug, 'š', 's');
  slug := replace(slug, 'ž', 'z');
  
  -- Replace spaces and special chars with hyphens
  slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
  
  -- Remove leading/trailing hyphens
  slug := trim(both '-' from slug);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- First handle duplicates - set unique slugs for cities with same base name
-- Trnovo (RS) needs different slug than Trnovo (FBiH)
UPDATE cities SET slug = 'trnovo-rs' WHERE name = 'Trnovo (RS)';
UPDATE cities SET slug = 'trnovo-fbih' WHERE name = 'Trnovo' AND region = 'Federacija BiH';
UPDATE cities SET slug = 'trnovo' WHERE name = 'Trnovo' AND slug IS NULL;

-- Update all other city slugs (where slug is still null)
UPDATE cities 
SET slug = generate_slug(name)
WHERE slug IS NULL OR slug = '';

-- Now create unique index
CREATE UNIQUE INDEX IF NOT EXISTS cities_slug_idx ON cities(slug);

-- Verify all cities have slugs
SELECT name, slug FROM cities ORDER BY name;
