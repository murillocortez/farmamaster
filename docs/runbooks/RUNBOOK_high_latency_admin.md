# RUNBOOK: High Latency Admin

## Symptom
*   **Alert:** `Admin API p95 Latency > 200ms`
*   **User Impact:** Admin Dashboard feels sluggish, potential timeouts on heavy reports.

## Diagnostic Steps

1.  **Identify Slow Queries:**
    *   Check Supabase Dashboard > Database > Query Performance.
    *   Look for sequential scans on large tables (`orders`, `products`).

2.  **Check Client Netwrok:**
    *   Is the issue global or localized to a region? (Check CDN status if applicable).

3.  **Analyze Function/Backend Logs:**
    *   Are the Edge Functions creating the bottleneck?

## Remediation

### Scenario A: Missing Index
*   **Action:** Add the missing index.
*   **Command:** `CREATE INDEX CONCURRENTLY idx_table_column ON table(column);`

### Scenario B: N+1 Problem in Frontend
*   **Action:** The frontend might be fetching items one by one.
*   **Fix:** Hotfix the frontend to use `in()` filters or bulk data loading.

## Verification
Wait 15 minutes and check if p95 returns to < 200ms.
