-- Add warehouse role for warehouse panel staff
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'warehouse';
