# Failover & Resilience Plan

## 1. Vercel Failure
**Scenario:** Vercel Edge Network goes down in a region.
**Mitigation:** Vercel automatically re-routes traffic to the nearest healthy region.
**Manual Action:** If Vercel Global is down, switch DNS (Cloudflare) to a backup bucket (S3/Netlify) hosting a "Maintenance Mode" static site.

## 2. Supabase Failure
**Scenario:** Database outage.
**Mitigation:**
*   **Read Replicas:** (Enterprise Plan) Enable read-replicas in a different AZ.
*   **Edge Functions:** Functions will fail fast. Resilience package handles retries.
**Recovery:** Use Point-in-Time Recovery (PITR) to restore data to 5 minutes prior to corruption.

## 3. Bad Deploy (Bug)
**Scenario:** New version breaks checkout.
**Mitigation:** Vercel "Instant Rollback".
**Action:** Click "Rollback" on the Deployment Dashboard. Takes < 10 seconds.

## 4. Backups
*   **Database:** Daily Midnight Dump + WAL archiving (PITR).
*   **Code:** GitHub (Distributed).
