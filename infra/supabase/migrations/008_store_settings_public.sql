-- 008_store_settings_public.sql

-- Allow public read of store settings for active tenants
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Settings Read" ON store_settings
FOR SELECT
TO anon, authenticated
USING (
  tenant_id IN (SELECT id FROM tenants WHERE status = 'active')
);
