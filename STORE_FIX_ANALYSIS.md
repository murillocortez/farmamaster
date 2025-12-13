# 🔍 ANÁLISE TÉCNICA - Store "Loja não encontrada"

## 📊 DIAGNÓSTICO DA CAUSA RAIZ

### ❌ **PROBLEMA CRÍTICO IDENTIFICADO**

A Store está **falhando silenciosamente** em produção devido a **incompatibilidade entre a estrutura da view `tenant_with_plan` e o código da aplicação**.

---

## 🎯 CAUSAS RAIZ (Ordem de Prioridade)

### 1️⃣ **DESCOMPASSO ENTRE VIEW E CÓDIGO** (CRÍTICO)

**Evidência no código:**

📁 `apps/store/src/context/TenantContext.tsx` (Linha 91):
```typescript
.eq('slug', slug)  // ❌ O código busca por 'slug'
```

📁 `infra/supabase/migrations/017_update_view_columns.sql` (Linha 6):
```sql
t.slug as tenant_slug,  -- ✅ Mas a VIEW retorna 'tenant_slug'
```

**Problema:**
- A query da Store busca `.eq('slug', slug)`
- A view `tenant_with_plan` NÃO tem coluna `slug`
- A view tem `tenant_slug` (aliased)
- **O Supabase retorna 0 linhas → erro "Loja não encontrada"**

**Impacto:**
- 100% das requisições em produção falham
- Nenhum tenant é encontrado mesmo que exista no banco

---

### 2️⃣ **VARIÁVEL DE AMBIENTE AUSENTE EM PRODUÇÃO** (ALTA)

**Evidência:**

📁 `apps/store/.env`:
```env
# ❌ VITE_DEFAULT_TENANT_SLUG_STORE não está configurado!
```

📁 `apps/store/src/App.tsx` (Linha 151):
```typescript
const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT_SLUG_STORE || 'farma-vida';
```

**Problema:**
- No Vercel, se não houver variável de ambiente configurada
- A Store usa fallback hardcoded `'farma-vida'`
- Se esse slug não existir no banco → erro

**Impacto Secundário:**
- Mesmo com o fallback, se a query estiver errada (problema #1), ainda falha

---

### 3️⃣ **TENANT STATUS FILTRADO DEMAIS** (MÉDIA)

📁 `apps/store/src/context/TenantContext.tsx` (Linha 92):
```typescript
.eq('status', 'active') // ⚠️ Filtra APENAS tenants com status = 'active'
```

**Problema:**
- Se o tenant existe mas tem `status = 'pending'` ou outro
- A query retorna vazio
- Store exibe "não encontrada"

**Schema real:**
```sql
t.status as tenant_status  -- A view retorna 'tenant_status', não 'status'
```

**Duplo problema:**
- Filtra por `.eq('status', 'active')` ❌
- Mas a coluna na view é `tenant_status` ❌

---

### 4️⃣ **RESOLUÇÃO DE SLUG COMPLEXA E FRÁGIL** (BAIXA/MÉDIA)

📁 `apps/store/src/App.tsx` (Linhas 134-152):

O código tenta resolver o slug em múltiplas etapas:
1. Query param `?tenant=`
2. Subdomínio (ex: `farmavida.vercel.app`)
3. Default env var
4. Fallback hardcoded

**Problema em Produção (Vercel):**
- URL típica: `store-wine-eight-15.vercel.app`
- Extração de subdomínio:
  ```typescript
  const parts = hostname.split('.');
  const sub = parts[0]; // 'store-wine-eight-15'
  ```
- Verifica se é "ignorado":
  ```typescript
  const isIgnored = ['www', 'app', 'admin', 'store', 'market', 'api'].includes(sub);
  ```
- ❌ **'store-wine-eight-15' NÃO está na lista de ignorados**
- ✅ Mas também não é IP
- **Resultado:** tenta usar `'store-wine-eight-15'` como slug
- ❌ Esse slug não existe no banco → erro

---

## 🛠️ SOLUÇÕES TÉCNICAS (EM ORDEM DE PRIORIDADE)

### ✅ **SOLUÇÃO 1: Corrigir Query da View** (CRÍTICO - DEPLOY IMEDIATO)

**Arquivo:** `apps/store/src/context/TenantContext.tsx`

**Correção:**
```typescript
// ANTES (ERRADO):
const { data, error } = await (supabase as any)
    .from('tenant_with_plan')
    .select('*')
    .eq('slug', slug)              // ❌ Coluna não existe!
    .eq('status', 'active')        // ❌ Coluna não existe!
    .maybeSingle();

// DEPOIS (CORRETO):
const { data, error } = await (supabase as any)
    .from('tenant_with_plan')
    .select('*')
    .eq('tenant_slug', slug)       // ✅ Coluna correta da view
    .eq('tenant_status', 'active') // ✅ Coluna correta da view
    .maybeSingle();
```

**Ajustar também o Interface:**
```typescript
export interface Tenant {
    id: string;
    slug: string;  // Manter para compatibilidade retroativa
    // ...resto
}
```

**Mapear na resposta:**
```typescript
if (!data) {
    throw new Error('Loja não encontrada ou inativa.');
}

// Mapear tenant_slug → slug para manter compatibilidade
const mappedData = {
    ...data,
    slug: data.tenant_slug,
    display_name: data.tenant_name,
    status: data.tenant_status
};

setTenant(mappedData as unknown as Tenant);
```

---

### ✅ **SOLUÇÃO 2: Adicionar Variável de Ambiente na Vercel** (ALTA)

**No painel da Vercel:**
```env
VITE_DEFAULT_TENANT_SLUG_STORE=farmavida  # ou slug do tenant principal
```

**OU** criar uma migration para garantir que `farmavida` existe:

```sql
-- Garantir tenant padrão
INSERT INTO tenants (slug, display_name, status, plan_id) 
VALUES ('farmavida', 'Farmavida', 'active', (SELECT id FROM store_plans WHERE code = 'free' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;
```

---

### ✅ **SOLUÇÃO 3: Melhorar Resolução de Slug** (MÉDIA)

**Arquivo:** `apps/store/src/App.tsx`

```typescript
const RootRedirect: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tenantParam = searchParams.get('tenant');

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    let subdomainSlug = '';

    // ✅ Melhorar lógica para Vercel
    if (parts.length >= 2) {
        const sub = parts[0];
        
        // ✅ Ignorar domínios Vercel automaticamente
        const isVercelDomain = hostname.includes('.vercel.app');
        const isCommonSubdomain = ['www', 'app', 'admin', 'store', 'market', 'api'].includes(sub);
        const isIp = /^[0-9]+$/.test(sub);

        if (!isVercelDomain && !isCommonSubdomain && !isIp) {
            subdomainSlug = sub;
        }
    }

    const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT_SLUG_STORE || 'farmavida';
    const finalSlug = tenantParam || subdomainSlug || defaultTenant;

    return <Navigate to={`/${finalSlug}`} replace />;
};
```

---

### ✅ **SOLUÇÃO 4: Melhorar UX de Erro** (BAIXA)

**Arquivo:** `apps/store/src/components/TenantRoot.tsx`

```typescript
if (error || !tenant) {
    // ✅ Adicionar mais informações de debug (apenas em dev)
    const isDev = import.meta.env.DEV;
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
                <p className="text-gray-500 mb-6 text-sm">
                    Verifique o endereço digitado ou entre em contato com o suporte.
                </p>
                
                {isDev && error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200 text-left">
                        <strong>Debug Info:</strong><br />
                        Error: {error}<br />
                        Slug tentado: {params.slug || 'N/A'}<br />
                        Hostname: {window.location.hostname}
                    </div>
                )}
                
                <button 
                    onClick={() => window.location.href = '/#/farmavida'}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                    Ir para loja padrão
                </button>
            </div>
        </div>
    );
}
```

---

## 📋 PLANO DE AÇÃO DEFINITIVO

### 🚨 **DEPLOY URGENTE (Hotfix)**

1. **Corrigir TenantContext.tsx** (5 min):
   - Trocar `.eq('slug', slug)` → `.eq('tenant_slug', slug)`
   - Trocar `.eq('status', 'active')` → `.eq('tenant_status', 'active')`
   - Mapear resposta para manter compatibilidade

2. **Adicionar variável no Vercel** (2 min):
   - `VITE_DEFAULT_TENANT_SLUG_STORE=farmavida`
   - Redeployar

3. **Rebuild e Deploy** (3 min):
   ```bash
   cd apps/store
   npm run build
   npx vercel --prod
   ```

**Tempo total:** ~10 minutos

---

### 🔧 **MELHORIAS POSTERIORES** (Não urgente)

4. Implementar resolução inteligente de slug (ignorar *.vercel.app)
5. Melhorar UX de erro com debug info
6. Adicionar logging para Sentry/Datadog
7. Criar healthcheck endpoint

---

## 🧪 TESTES DE VALIDAÇÃO

### ✅ **Teste 1: Acesso direto em produção**
```
URL: https://store-wine-eight-15.vercel.app
Esperado: Redireciona para /#/farmavida e carrega a loja
```

### ✅ **Teste 2: Acesso com slug específico**
```
URL: https://store-wine-eight-15.vercel.app/#/farmavida
Esperado: Carrega produtos da farmácia "Farmavida"
```

### ✅ **Teste 3: Acesso com query param**
```
URL: https://store-wine-eight-15.vercel.app/?tenant=farmavida
Esperado: Redireciona para /#/farmavida
```

### ✅ **Teste 4: Slug inexistente**
```
URL: https://store-wine-eight-15.vercel.app/#/nao-existe
Esperado: Mensagem "Loja não encontrada" + botão para loja padrão
```

---

## 📌 CONCLUSÃO

**Causa Raiz Primária:** Query na coluna errada (`slug` vs `tenant_slug`)  
**Causa Raiz Secundária:** Variável de ambiente ausente  
**Causa Raiz Terciária:** Resolução de slug não preparada para Vercel  

**Fix Prioritário:** Corrigir colunas na query do TenantContext  
**Tempo Estimado de Correção:** 10 minutos

**Status após correção:** ✅ Store 100% funcional em produção
