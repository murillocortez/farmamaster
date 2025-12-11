# Production Guide V1

## 1. Deploying
*   **Routine:** Push to `main`. GitHub Actions runs tests -> Deploys to Vercel Prod.
*   **Emergency:** Use `vercel --prod` locally (requires Token).

## 2. Rollback
If a critical bug is found:
1.  Go to Vercel Dashboard > Deployments.
2.  Find the last green deployment.
3.  Click "Redeploy" or "Promote to Production".
4.  Total time: ~30 seconds.

## 3. Managing Tenants
*   **Create:** Use the Master Admin UI (`master.farmamaster.com`).
*   **Suspend:** Toggle status in Master Admin. RLS immediately blocks access.
*   **Custom Domain:** Add domain in Vercel, then update Tenant record in Admin.

## 4. Disaster Recovery
In case of total data loss:
1.  Go to Supabase Dashboard > Database > Backups.
2.  Select "Point in Time Recovery".
3.  Choose a timestamp before the incident.
4.  Restore. (Down time ~5-10 mins).
