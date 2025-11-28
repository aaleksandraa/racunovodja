-- Add display_order column to service_categories table for custom sorting

ALTER TABLE service_categories 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing rows with incremental order based on name
WITH ordered_categories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY name) as row_num
  FROM service_categories
)
UPDATE service_categories
SET display_order = ordered_categories.row_num
FROM ordered_categories
WHERE service_categories.id = ordered_categories.id;