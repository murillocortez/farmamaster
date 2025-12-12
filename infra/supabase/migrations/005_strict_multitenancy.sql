-- 005_strict_multitenancy.sql

-- 1. CLEANUP: Delete profiles that violate multi-tenancy
DELETE FROM profiles WHERE tenant_id IS NULL;
DELETE FROM profiles WHERE tenant_id NOT IN (SELECT id FROM tenants);

-- 2. CONSTRAINT: Enforce Tenant Presence
ALTER TABLE profiles ALTER COLUMN tenant_id SET NOT NULL;

-- 3. INDEX: Ensure performance for RLS
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);

-- 4. ROBUST GET_MY_TENANT_ID
-- safely casts and handles nulls
CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
DECLARE
  tid text;
BEGIN
  tid := auth.jwt() -> 'user_metadata' ->> 'tenant_id';
  IF tid IS NULL OR tid = '' THEN
    RETURN NULL;
  END IF;
  RETURN tid::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. RE-VERIFY RLS
-- Explicitly force correct policy incase previous migration failed or was overridden
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles Isolation Policy" ON profiles;

CREATE POLICY "Profiles Isolation Policy" ON profiles
FOR SELECT
USING (
  id = auth.uid() 
  OR 
  tenant_id = get_my_tenant_id()
);

-- Ensure Insert/Update restricted
DROP POLICY IF EXISTS "Profiles Update Policy" ON profiles;
CREATE POLICY "Profiles Update Policy" ON profiles
FOR UPDATE
USING (
  (id = auth.uid()) 
  OR 
  (
    (select (auth.jwt() -> 'user_metadata' ->> 'role')::text) IN ('CEO', 'ADMIN') 
    AND 
    tenant_id = get_my_tenant_id()
    AND
    role != 'CEO'
  )
);
