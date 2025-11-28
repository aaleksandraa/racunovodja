-- Add RLS policies for service_categories management by admins

-- Policy for admins to insert service categories
CREATE POLICY "Admins can insert service categories"
ON service_categories
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Policy for admins to update service categories
CREATE POLICY "Admins can update service categories"
ON service_categories
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Policy for admins to delete service categories
CREATE POLICY "Admins can delete service categories"
ON service_categories
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));