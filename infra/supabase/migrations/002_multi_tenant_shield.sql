-- MIGRATION: 002_multi_tenant_shield.sql
-- DATE: 2025-12-12
-- DESC: Converte tabelas globais para tenant-scoped e blinda todo o acesso com RLS estrito e Triggers forçados.

-- 1. UTILS: Função para forçar tenant_id no INSERT
CREATE OR REPLACE FUNCTION public.force_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Permite bypass para service_role (Admin Master Backend)
  IF auth.role() = 'service_role' THEN
     RETURN NEW;
  END IF;
  
  -- Garante que o usuário tem tenant_id no metadata (senão falha ou fica NULL)
  -- Se for NULL e a coluna for NOT NULL, dará erro (o que é bom).
  NEW.tenant_id := (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. SCHEMA UPDATE: Adiciona tenant_id em tabelas que não tinham
-- CRM
ALTER TABLE public.crm_campaigns ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Cotações
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Fornecedores
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Configurações Fiscais
ALTER TABLE public.fiscal_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Migração de Dados (Tenta recuperar tenant_id via store_id se possível)
DO $$
BEGIN
  UPDATE public.fiscal_settings 
  SET tenant_id = store_id::uuid 
  WHERE store_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
  AND tenant_id IS NULL;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignora erros de cast
END $$;


-- 3. SECURITY SHIELD: Habilita RLS e Aplica Policies + Triggers
-- Loop para aplicar proteção padrão em todas as tabelas tenant-scoped
-- (Executado manualmente via comandos abaixo para garantir ordem)

-- [PRODUTOS]
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_products ON public.products;
CREATE TRIGGER trg_force_tenant_products BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.products;
DROP POLICY IF EXISTS "Tenant Isolation All" ON public.products;
CREATE POLICY "Tenant Isolation All" ON public.products FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [PEDIDOS]
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_orders ON public.orders;
CREATE TRIGGER trg_force_tenant_orders BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation Orders" ON public.orders;
CREATE POLICY "Tenant Isolation Orders" ON public.orders FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [CLIENTES]
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_customers ON public.customers;
CREATE TRIGGER trg_force_tenant_customers BEFORE INSERT ON public.customers FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation Customers" ON public.customers;
CREATE POLICY "Tenant Isolation Customers" ON public.customers FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [SUPORTE]
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation Support" ON public.support_tickets;
CREATE POLICY "Tenant Isolation Support" ON public.support_tickets FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
-- (Trigger opcional se o ticket for criado pelo usuário logado)

-- [CASHBACK]
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation Cashback" ON public.cashback_transactions;
CREATE POLICY "Tenant Isolation Cashback" ON public.cashback_transactions FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [PLANOS DA LOJA]
ALTER TABLE public.store_plans ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_store_plans ON public.store_plans;
CREATE TRIGGER trg_force_tenant_store_plans BEFORE INSERT ON public.store_plans FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation store_plans" ON public.store_plans;
CREATE POLICY "Tenant Isolation store_plans" ON public.store_plans FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [CRM]
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_crm_campaigns ON public.crm_campaigns;
CREATE TRIGGER trg_force_tenant_crm_campaigns BEFORE INSERT ON public.crm_campaigns FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation crm_campaigns" ON public.crm_campaigns;
CREATE POLICY "Tenant Isolation crm_campaigns" ON public.crm_campaigns FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [COTAÇÕES]
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_quotations ON public.quotations;
CREATE TRIGGER trg_force_tenant_quotations BEFORE INSERT ON public.quotations FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation quotations" ON public.quotations;
CREATE POLICY "Tenant Isolation quotations" ON public.quotations FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [FORNECEDORES]
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_suppliers ON public.suppliers;
CREATE TRIGGER trg_force_tenant_suppliers BEFORE INSERT ON public.suppliers FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation suppliers" ON public.suppliers;
CREATE POLICY "Tenant Isolation suppliers" ON public.suppliers FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [FISCAL]
ALTER TABLE public.fiscal_settings ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_fiscal_settings ON public.fiscal_settings;
CREATE TRIGGER trg_force_tenant_fiscal_settings BEFORE INSERT ON public.fiscal_settings FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation fiscal_settings" ON public.fiscal_settings;
CREATE POLICY "Tenant Isolation fiscal_settings" ON public.fiscal_settings FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);

-- [NOTAS FISCAIS / INVOICES]
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_force_tenant_invoices ON public.invoices;
CREATE TRIGGER trg_force_tenant_invoices BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION force_tenant_id();

DROP POLICY IF EXISTS "Tenant Isolation invoices" ON public.invoices;
CREATE POLICY "Tenant Isolation invoices" ON public.invoices FOR ALL USING (tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid);
