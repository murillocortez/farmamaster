-- MIGRATION: 014_fix_tenant_update_policy.sql
-- DATE: 2025-12-12
-- DESC: Adds missing RLS policy to allow Tenant Updates by Authenticated Users (Master Admins).
-- Previously, Master Admin could not update tenants (e.g. change plans) because only 'Update Own Tenant' policy existed.

DROP POLICY IF EXISTS "Allow Update Tenants" ON public.tenants;
CREATE POLICY "Allow Update Tenants" ON public.tenants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
