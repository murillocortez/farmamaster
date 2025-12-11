# Secrets Management

## Required Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Public | URL of the Supabase project. |
| `VITE_SUPABASE_ANON_KEY` | Public | Anonymous API key (safe for client). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Admin key (Backend only). |
| `SENTRY_DSN` | Public | Error tracking DSN. |
| `VERCEL_API_TOKEN` | CI/CD | Token for deploying via API. |

## Injection Strategy
*   **Local:** `.env` files (git-ignored).
*   **Vercel:** Project Settings > Environment Variables.
*   **GitHub Actions:** Repository Secrets.

## Rotation Policy
*   Supabase Keys: Rotate annually or upon team member exit.
*   Service Tokens: Rotate every 90 days.
