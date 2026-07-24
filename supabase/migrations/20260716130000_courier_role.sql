-- Add courier role for courier panel staff
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'courier';
