-- MIGRATION: 010_fix_all_cascades_and_plans.sql
-- DATE: 2025-12-12
-- DESC: Fixes Tenant Deletion (Cascade) and Plans Editing (RLS/Permissions)

-- 1. FIX TENANT DELETION (CASCADE ALL DEPENDENCIES)
-- We explicitly drop and recreate constraints with ON DELETE CASCADE for all tenant-scoped tables

-- Products
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_tenant_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_tenant_id_fkey;
ALTER TABLE public.orders ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Order Items (Cascade from Orders)
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tenant_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Customers
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_tenant_id_fkey;
ALTER TABLE public.customers ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Support Tickets
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_tenant_id_fkey;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Cashback Transactions
ALTER TABLE public.cashback_transactions DROP CONSTRAINT IF EXISTS cashback_transactions_tenant_id_fkey;
ALTER TABLE public.cashback_transactions ADD CONSTRAINT cashback_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- CRM Campaigns
ALTER TABLE public.crm_campaigns DROP CONSTRAINT IF EXISTS crm_campaigns_tenant_id_fkey;
ALTER TABLE public.crm_campaigns ADD CONSTRAINT crm_campaigns_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Quotations
ALTER TABLE public.quotations DROP CONSTRAINT IF EXISTS quotations_tenant_id_fkey;
ALTER TABLE public.quotations ADD CONSTRAINT quotations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Suppliers
ALTER TABLE public.suppliers DROP CONSTRAINT IF EXISTS suppliers_tenant_id_fkey;
ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Fiscal Settings
ALTER TABLE public.fiscal_settings DROP CONSTRAINT IF EXISTS fiscal_settings_tenant_id_fkey;
ALTER TABLE public.fiscal_settings ADD CONSTRAINT fiscal_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Invoices
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_tenant_id_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 2. FIX PLANS EDITING (RLS & TRIGGER & COLUMNS)

-- Ensure tenant_id is not mandatory globally
ALTER TABLE public.store_plans ALTER COLUMN tenant_id DROP NOT NULL;

-- Remove Trigger that forces tenant_id on plans
DROP TRIGGER IF EXISTS trg_force_tenant_store_plans ON public.store_plans;

-- Remove Restrictive Policy
DROP POLICY IF EXISTS "Tenant Isolation store_plans" ON public.store_plans;
DROP POLICY IF EXISTS "Public read plans" ON public.store_plans;
DROP POLICY IF EXISTS "Admin Manage Plans" ON public.store_plans;

-- Add Correct Policies
CREATE POLICY "Public read plans" ON public.store_plans FOR SELECT USING (true);
CREATE POLICY "Admin Manage Plans" ON public.store_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
