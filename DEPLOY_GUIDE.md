# 🚀 Guia de Deploy - FarmaMaster

**Status**: ✅ Ambos os apps compilados com sucesso!

---

## 📦 Backend (Supabase)

### ✅ Status dos Edge Functions
Todos os Edge Functions já foram deployados:
- ✅ `billing-engine` - Processamento diário de cobrança
- ✅ `communication-engine` - Envio de emails e comunicações
- ✅ `decision-engine` - Motor de decisões automatizadas

### ✅ Migrações do Banco de Dados
Todas as migrações foram aplicadas, incluindo:
- Estrutura de multi-tenancy
- Sistema de billing e planos
- Motor de decisões
- Engine de comunicação
- Hardening de segurança (RLS)

---

## 🌐 Frontend - Apps

### 1️⃣ Admin App (Painel das Farmácias)

**Build**: ✅ Compilado com sucesso em `apps/admin/dist/`

#### Deploy para Vercel:

```bash
cd apps/admin

# Via CLI do Vercel
npx vercel --prod

# Configurar variáveis de ambiente na Vercel:
# VITE_SUPABASE_URL=https://nezmauiwtoersiwtpjmd.supabase.co
# VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

#### Deploy para Netlify:

```bash
cd apps/admin

# Via CLI do Netlify
npx netlify deploy --prod --dir=dist

# Configurar variáveis de ambiente no Netlify:
# VITE_SUPABASE_URL=https://nezmauiwtoersiwtpjmd.supabase.co
# VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

**URL Exemplo**: `https://admin.farmamaster.com.br` ou subdomínio personalizado por tenant

---

### 2️⃣ Master App (Painel Administrativo Central)

**Build**: ✅ Compilado com sucesso em `apps/master/dist/`

#### Deploy para Vercel:

```bash
cd apps/master

# Via CLI do Vercel
npx vercel --prod

# Configurar variáveis de ambiente:
# VITE_SUPABASE_URL=https://nezmauiwtoersiwtpjmd.supabase.co
# VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

#### Deploy para Netlify:

```bash
cd apps/master

# Via CLI do Netlify
npx netlify deploy --prod --dir=dist

# Variáveis de ambiente:
# VITE_SUPABASE_URL=https://nezmauiwtoersiwtpjmd.supabase.co
# VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

**URL Exemplo**: `https://master.farmamaster.com.br`

**⚠️ ATENÇÃO**: O Master app ainda usa login mockado. Implementar autenticação real antes do deploy em produção.

---

## 🔐 Variáveis de Ambiente

### Supabase (Backend)

Configure no painel do Supabase > Edge Functions > Environment Variables:

```env
# Email (escolha um)
SENDGRID_API_KEY=seu_sendgrid_key
# ou
RESEND_API_KEY=seu_resend_key

# Stripe (para billing real)
STRIPE_SECRET_KEY=seu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
```

### Frontend Apps

Ambos os apps precisam das mesmas variáveis base:

```env
VITE_SUPABASE_URL=https://nezmauiwtoersiwtpjmd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter o Anon Key**:
1. Acesse o painel do Supabase
2. Settings > API
3. Copie a chave `anon` (public)

---

## 📋 Checklist Pré-Deploy

- [x] ✅ Edge Functions deployados
- [x] ✅ Migrações aplicadas
- [x] ✅ RLS policies configuradas
- [x] ✅ Admin App compilado
- [x] ✅ Master App compilado
- [ ] ⚠️ Configurar chaves de email (SendGrid/Resend)
- [ ] ⚠️ Substituir login mockado no Master por Supabase Auth
- [ ] ⚠️ Configurar domínios personalizados (opcional)
- [ ] ⚠️ Configurar Stripe para billing real (opcional)

---

## 🎯 Próximos Passos Recomendados

### Crítico (Antes de Produção):
1. **Autenticação Master**: Remover mock e implementar Supabase Auth
2. **Email API Keys**: Configurar SendGrid ou Resend para emails reais
3. **Testes End-to-End**: Validar fluxos críticos em staging

### Opcional (Melhorias):
1. **Stripe Integration**: Conectar billing real via Stripe
2. **Domínios Personalizados**: Configurar DNS para cada tenant
3. **Monitoramento**: Configurar Sentry ou similar para error tracking
4. **CDN**: Configurar Cloudflare para melhor performance

---

## 🐛 Troubleshooting

### Build falha com erros TypeScript
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Edge Function não responde
```bash
# Ver logs no Supabase Dashboard
# Functions > [nome-do-function] > Logs

# Ou via CLI
supabase functions logs billing-engine --tail
```

### Erro de CORS no frontend
- Verificar se `VITE_SUPABASE_URL` está correto
- Verificar políticas RLS no Supabase
- Verificar se o anon key está configurado

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
- **Documentação Supabase**: https://supabase.com/docs
- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Netlify**: https://docs.netlify.com

---

**Última Atualização**: 13/12/2024 - 10:25 BRT  
**Status**: ✅ Pronto para deploy em staging/homologação
