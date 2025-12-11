# Domain Management & Custom Domains

## 1. Domain Structure

| App | Pattern | Example |
| :--- | :--- | :--- |
| **Master** | `master.farmamaster.com` | `master.farmamaster.com` |
| **Admin** | `*.admin.farmamaster.com` | `nova-farma.admin.farmamaster.com` |
| **Store** | `*.farmamaster.com` | `nova-farma.farmamaster.com` |
| **Custom** | `store.my-pharmacy.com` | `store.drogariasilva.com.br` |

## 2. Vercel Configuration
We use **Wildcard Domains** (`*.farmamaster.com`) on Vercel pointed to the Monorepo.

### Middleware Routing
A `_middleware.ts` in the Vercel project intercepts every request:
1.  Parses the hostname.
2.  Extracts the subdomain (`nova-farma`).
3.  Rewrites the specific app (`/apps/store` or `/apps/admin`) with the tenant slug injected as a header or query param.

## 3. Custom Domains (White Label)
To support `drogariasilva.com.br`:
1.  User adds CNAME `store` pointing to `cname.vercel-dns.com`.
2.  We verify the domain via Vercel API.
3.  Vercel issues SSL automatically.
4.  Middleware detects the custom domain and maps to the correct tenant ID.
