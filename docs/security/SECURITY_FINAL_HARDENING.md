# Security Final Hardening

## 1. Headers (Implemented)
We apply strict HTTP headers at the Edge (Vercel middleware level):
*   `HSTS`: 2 years, preload.
*   `CSP`: Prevents XSS by whitelisting only Supabase and Self as valid sources.
*   `Permissions-Policy`: Disables Camera/Mic/Location access by default.

## 2. CORS Strategy
*   **Production:** `https://*.farmamaster.com` ONLY.
*   **Staging:** `https://*.vercel.app` allowed.
*   **Dev:** `localhost:3000` allowed.

## 3. Database Hardening
*   **Public Schema:** No tables are publicly readable without RLS.
*   **Functions:** `SECURITY DEFINER` Used only where strictly necessary (e.g., `create-tenant`).
*   **PgBouncer:** Enabled in Transaction Mode for connection pooling.
