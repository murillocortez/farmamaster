-- 1. PROFILES ISOLATION
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View profiles" ON profiles;
DROP POLICY IF EXISTS "Read Own Profile" ON profiles;
DROP POLICY IF EXISTS "Staff Read Profiles" ON profiles;
DROP POLICY IF EXISTS "Admin/CEO update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin/CEO delete profiles" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

-- Strict Read: Own profile OR Same Tenant (via JWT Metadata)
CREATE POLICY "Profiles Isolation Policy" ON profiles
FOR SELECT
USING (
  id = auth.uid() 
  OR 
  tenant_id = (select (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
);

-- Strict Update: Own profile OR Admin of same tenant
CREATE POLICY "Profiles Update Policy" ON profiles
FOR UPDATE
USING (
  (id = auth.uid()) 
  OR 
  (
    (select (auth.jwt() -> 'user_metadata' ->> 'role')::text) IN ('CEO', 'ADMIN') 
    AND 
    tenant_id = (select (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
    AND
    role != 'CEO' -- Admins cannot modify CEO
  )
);

-- Strict Insert: Only Admin/CEO
CREATE POLICY "Profiles Insert Policy" ON profiles
FOR INSERT
WITH CHECK (
  (select (auth.jwt() -> 'user_metadata' ->> 'role')::text) IN ('CEO', 'ADMIN')
  AND
  tenant_id = (select (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
);

-- Strict Delete: Only Admin/CEO
CREATE POLICY "Profiles Delete Policy" ON profiles
FOR DELETE
USING (
  (select (auth.jwt() -> 'user_metadata' ->> 'role')::text) IN ('CEO', 'ADMIN')
  AND
  tenant_id = (select (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid)
  AND
  role != 'CEO'
);

-- 2. HELPER FUNCTION
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. TENANTS TABLE ISOLATION
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read Own Tenant" ON tenants;
DROP POLICY IF EXISTS "Update Own Tenant" ON tenants;

CREATE POLICY "Read Own Tenant" ON tenants
FOR SELECT
USING (
  id = get_my_tenant_id()
);

CREATE POLICY "Update Own Tenant" ON tenants
FOR UPDATE
USING (
  id = get_my_tenant_id()
  AND
  (select (auth.jwt() -> 'user_metadata' ->> 'role')::text) = 'CEO'
);

-- 4. REINFORCE OTHER TABLES
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['products', 'customers', 'orders', 'suppliers', 'quotations', 'crm_campaigns', 'store_settings', 'cashback_transactions', 'support_tickets']) LOOP
        -- Check if table exists to avoid errors
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation" ON %I', t);
            -- Allow read/write if tenant matches
            EXECUTE format('CREATE POLICY "Tenant Isolation" ON %I USING (tenant_id = get_my_tenant_id()) WITH CHECK (tenant_id = get_my_tenant_id())', t, t);
        END IF;
    END LOOP;
END $$;
