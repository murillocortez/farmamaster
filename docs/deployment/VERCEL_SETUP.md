# Vercel Deployment Setup

## Overview
Farmamaster uses Vercel's Monorepo support to deploy 3 distinct applications from a single codebase.

## Configuration (`vercel.json`)
We use a root `vercel.json` to define "Project Linking" isn't strictly necessary with Vercel's GUI, but we configure `builds` matches if using legacy imports, or rely on Vercel's framework detection.

**Best Practice:** Connect the GitHub Repository to Vercel, and create 3 separate Vercel Projects, all pointing to the SAME repo, but with different `Root Directory` settings:

1.  **Project: Farmamaster Master**
    *   Root Directory: `apps/master`
    *   Framework: Vite / React
    *   Build Command: `cd ../.. && npx turbo run build --filter=master`

2.  **Project: Farmamaster Admin**
    *   Root Directory: `apps/admin`
    *   Framework: Vite / React
    *   Build Command: `cd ../.. && npx turbo run build --filter=admin`

3.  **Project: Farmamaster Store**
    *   Root Directory: `apps/store`
    *   Framework: Vite / React
    *   Build Command: `cd ../.. && npx turbo run build --filter=store`

## Secrets
Ensure the secrets from `docs/security/SECRETS_MAP.md` are applied to ALL 3 projects.
