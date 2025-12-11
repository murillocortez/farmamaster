# Supabase Infrastructure

This directory contains the database migrations, edge functions, and configuration for the Farmamaster project.

## Project Structure
- `migrations/`: SQL files for DB schema changes.
- `functions/`: Deno-based Edge Functions.
- `config.toml`: Local Supabase config.

## Deployment

### Prerequisites
- Supabase CLI installed.
- Linked to project `nezmauiwtoersiwtpjmd`.

### Deploy Functions
```bash
supabase functions deploy --no-verify-jwt
```

### Apply Migrations
```bash
supabase db push
# or via Dashboard SQL Editor using the files in /migrations
```
