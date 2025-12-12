-- Fix store_plans RLS and Trigger
ALTER TABLE public.store_plans ALTER COLUMN tenant_id DROP NOT NULL;

-- Drop the trigger that forces tenant_id on store_plans (Global plans should not have tenant_id enforced)
DROP TRIGGER IF EXISTS trg_force_tenant_store_plans ON public.store_plans;

-- Drop the restrictive Tenant Isolation policy
DROP POLICY IF EXISTS "Tenant Isolation store_plans" ON public.store_plans;

-- Ensure Public Read Access
DROP POLICY IF EXISTS "Public read plans" ON public.store_plans;
CREATE POLICY "Public read plans" ON public.store_plans FOR SELECT USING (true);

-- Create Policy for Admin Management
-- Allow Authenticated users (Master Admins) to INSERT/UPDATE/DELETE.
DROP POLICY IF EXISTS "Admin Manage Plans" ON public.store_plans;
CREATE POLICY "Admin Manage Plans" ON public.store_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
