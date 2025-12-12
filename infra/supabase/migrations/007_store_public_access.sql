-- 007_store_public_access.sql

-- 1. PUBLIC TENANT LOOKUP
-- Allow public access to active tenants for Store resolution
CREATE POLICY "Public Active Tenants" ON tenants
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- 2. PUBLIC PRODUCTS
-- Allow reading products from active tenants
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Product Read" ON products
FOR SELECT
TO anon, authenticated
USING (
  tenant_id IN (SELECT id FROM tenants WHERE status = 'active')
);

-- 3. PUBLIC CATEGORIES (If table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    EXECUTE 'ALTER TABLE categories ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Public Category Read" ON categories FOR SELECT TO anon, authenticated USING (tenant_id IN (SELECT id FROM tenants WHERE status = ''active''))';
  END IF;
END $$;

-- 4. PUBLIC OFFERS (daily_offers)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_offers') THEN
    EXECUTE 'ALTER TABLE daily_offers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Public Offers Read" ON daily_offers FOR SELECT TO anon, authenticated USING (tenant_id IN (SELECT id FROM tenants WHERE status = ''active''))';
  END IF;
END $$;
