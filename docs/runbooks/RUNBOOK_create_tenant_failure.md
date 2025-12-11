# RUNBOOK: Create Tenant Failure

## Symptom
*   **Alert:** `create-tenant failure rate > 5%`
*   **User Impact:** Master Admin cannot onboard new pharmacies.

## Diagnostic Steps

1.  **Check Supabase Logs:**
    *   Command: `supabase functions logs --project-ref nezmauiwtoersiwtpjmd`
    *   Look for: `TIMEOUT`, `Database Error`, `Auth Error`.

2.  **Verify Database Connection:**
    *   Can you query the `tenants` table via SQL Editor?
    *   Is the connection pooler overloaded?

3.  **Check Edge Function Status:**
    *   Is the function crashing on startup? (Memory limit?)

## Remediation

### Scenario A: Database Timeout
*   **Action:** Check if there are locking queries. Kill stuck queries in SQL Editor.
*   **Escalation:** Contact Database reliability engineer.

### Scenario B: Deployment Bug
*   **Action:** Rollback logic isn't automated yet. manually redeploy the previous known good version of the function logic or revert git commit and CI/CD will handle it.
*   **Command:** `git revert <commit-hash> && git push`

### Scenario C: Auth Service Down
*   **Action:** Check status.supabase.com. If GoTrue is down, wait for resolution.

## Verification
1.  Run the minimal Curl test.
2.  Monitor logs for 5 minutes.
