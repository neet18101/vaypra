-- Add address column to branches table
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS address text default '';
