# Configuração de Billing Multi-tenant com Stripe

Esta integração implementa um sistema robusto de assinaturas utilizando Stripe, Supabase Edge Functions e o Adapter Pattern.

## 1. Variáveis de Ambiente (Supabase Secrets)

Você precisa configurar as seguintes chaves no seu projeto Supabase para que as Edge Functions funcionem:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_... 
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
# Opcional se usar Supabase localmente ou precisar de override
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

*   **STRIPE_SECRET_KEY**: Sua chave secreta (começa com `sk_test_...` ou `sk_live_...`).
*   **STRIPE_WEBHOOK_SECRET**: O segredo de assinatura do webhook (obtido no dashboard do Stripe após criar o endpoint).

## 2. Configuração do Webhook no Stripe

1.  Vá para o Stripe Dashboard > Developers > Webhooks.
2.  Adicione um endpoint apontando para sua Edge Function:
    `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
3.  Selecione os eventos:
    *   `checkout.session.completed`
    *   `customer.subscription.updated`
    *   `customer.subscription.deleted`
4.  Copie o "Signing secret" (`whsec_...`) e defina como variável de ambiente (passo 1).

## 3. Configuração dos Planos (Price IDs)

O código utiliza Price IDs para criar os checkouts. Como não foi possível criar via API com as chaves de teste fornecidas, você deve criar os produtos no Stripe e atualizar o arquivo `infra/supabase/functions/billing-ops/index.ts`:

1.  Crie 3 produtos no Stripe: **Starter** (R$ 49), **Pro** (R$ 99), **Premium** (R$ 199).
2.  Copie os **API ID** de cada preço (ex: `price_1Pxyz...`).
3.  Edite `infra/supabase/functions/billing-ops/index.ts`:

```typescript
const PLANS = {
  starter: 'price_SEU_ID_STARTER',
  pro: 'price_SEU_ID_PRO',
  premium: 'price_SEU_ID_PREMIUM'
};
```

4.  Opcional: Atualize os valores visuais em `apps/admin/src/pages/Billing.tsx` se diferirem.

## 4. Funcionamento do Multi-tenancy

*   **Isolamento**: Cada tenant tem seu `stripe_customer_id` salvo na tabela `tenants`.
*   **Segurança**: As Edge Functions validam o `tenant_id` do usuário logado antes de permitir qualquer operação.
*   **Webhooks**: Os eventos do Stripe atualizam automaticamente o status (`subscription_status`) na tabela `tenants`, liberando ou bloqueando acesso no Frontend.

## 5. Testando o Ciclo (Sandbox)

1.  Acesse o Admin como um tenant.
2.  Vá em **Configurações/Meu Plano** (Rota `/billing`).
3.  Escolha um plano e clique em Assinar.
4.  Use os dados de cartão de teste do Stripe (ex: `4242 4242...`).
5.  Após o sucesso, você será redirecionado e o status mudará para `Active`.
6.  Clique em "Gerenciar Assinatura" para abrir o Portal e testar cancelamento/upgrade.
