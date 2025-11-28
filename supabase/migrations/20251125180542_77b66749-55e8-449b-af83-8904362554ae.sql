-- Add accepting_new_clients field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN accepting_new_clients boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.accepting_new_clients IS 'Indicates if the professional is currently accepting new clients';