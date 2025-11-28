-- Add RLS policies for cities table to allow admin operations
CREATE POLICY "Admins can insert cities"
ON public.cities
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update cities"
ON public.cities
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete cities"
ON public.cities
FOR DELETE
USING (is_admin(auth.uid()));