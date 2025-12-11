# Architecture Overview

```mermaid
graph TD
    User([User]) -->|Public Access| Store[Klyver Store]
    User -->|Auth Access| Admin[Klyver Admin]
    MasterUser([Master Admin]) -->|Auth Access| Master[Klyver Master]
    
    subgraph "Supabase Platform"
        Auth[GoTrue Auth]
        DB[(PostgreSQL)]
        Edge[Edge Functions]
    end
    
    Master -->|Create Tenant| Edge
    Edge -->|Service Role| DB
    Edge -->|Admin API| Auth
    
    Admin -->|RLS Queries| DB
    Store -->|Public Views| DB
    
    DB -->|Realtime| Admin
```

## Data Flow
1. **Creation:** Master calls `create-tenant` edge function.
2. **Provisioning:** Edge function creates Tenant record, Auth User, and Profile atomically (simulated).
3. **Access:** Admin logs in. RLS policies ensure they only see their Tenant's data.
4. **Public:** Store uses anonymous access restricted to `tenants_public` view and specific product columns.
