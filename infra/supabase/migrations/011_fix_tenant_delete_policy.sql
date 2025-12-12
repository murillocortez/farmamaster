-- MIGRATION: 011_fix_tenant_delete_policy.sql
-- DATE: 2025-12-12
-- DESC: Adds missing RLS policy to allow Tenant Deletion by Authenticated Users (Master Admins)

-- Without this policy, 'DELETE FROM tenants' returns 0 rows (silent failure) for clients,
-- even if they are authenticated, because RLS blocks the operation by default.

DROP POLICY IF EXISTS "Allow Delete Tenants" ON public.tenants;
CREATE POLICY "Allow Delete Tenants" ON public.tenants FOR DELETE TO authenticated USING (true);
