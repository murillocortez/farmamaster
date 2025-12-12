-- MIGRATION: 013_store_public_access.sql
-- DATE: 2025-12-12
-- DESC: Enables Public Read Access for Store entities (Products, Settings, Offers) to allow Anonymous Storefront browsing.

-- 1. PRODUCTS
-- Drop old restrictive policies if they interfere (OR logic usually allows, but cleanup is good)
DROP POLICY IF EXISTS "Tenant Isolation All" ON public.products;
DROP POLICY IF EXISTS "Public Read Products" ON public.products; 
-- Allow anyone to read products (Frontend filters by tenant_id)
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
-- Ensure Tenants (Store Admins) can still write
CREATE POLICY "Tenant Write Products" ON public.products FOR ALL TO authenticated USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- 2. PRODUCT BATCHES (Stock)
DROP POLICY IF EXISTS "Public read batches" ON public.product_batches;
CREATE POLICY "Public read batches" ON public.product_batches FOR SELECT USING (true);

-- 3. DAILY OFFERS
DROP POLICY IF EXISTS "Public read daily_offers" ON public.daily_offers;
CREATE POLICY "Public read daily_offers" ON public.daily_offers FOR SELECT USING (true);

-- 4. STORE SETTINGS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Settings" ON public.store_settings;
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);
