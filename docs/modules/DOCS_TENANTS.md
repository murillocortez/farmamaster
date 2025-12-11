# Tenant Management Module

## Overview
The Tenant module is the core of the multi-tenancy architecture. It handles the lifecycle of a Pharmacy (Tenant), from registration to deletion.

## Data Model

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key (RLS scoped) |
| `slug` | String | Unique identifier for URLs (e.g., `nova-farma`) |
| `status` | Enum | `active`, `pending`, `suspended`, `cancelled` |
| `plan_code` | String | Logic for feature gating |
| `config` | JSONB | Tenant-specific settings (theme, toggles) |

## Workflows

### 1. Creation (Secure)
**Actor:** Master Admin
**Flow:**
1. Calls `create-tenant` Edge Function.
2. **Function:**
   - Validates payload (Zod).
   - Generates unique slug.
   - **Transaction:**
     - Inserts `tenants` record (`status: pending_setup`).
     - Creates Auth User (Admin).
     - Creates Profile.
     - Updates `tenants` status to `active`.
3. Returns temp password.

### 2. Isolation (RLS)
Every query to sensitive tables (`products`, `orders`, `customers`) MUST include a filter for `tenant_id`.
- **Authenticated:** Enforced via RLS policy `tenant_id = auth.jwt() -> tenant_id`.
- **Public (Store):** Enforced via `tenants_public` view or explicit `slug` lookup.

### 3. Deletion (Cascade)
Deleting a tenant triggers `ON DELETE CASCADE` SQL constraints, removing:
- Users/Profiles
- Products & Batches
- Orders & Items
- Customers

## Security Criticals
- 🔴 **NEVER** expose `tenant_id` in public URLs if possible (use slug).
- 🔴 **NEVER** allow `tenant_id` to be passed as a mutable parameter in `update()` calls from the frontend.
