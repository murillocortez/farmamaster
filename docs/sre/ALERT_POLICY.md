# Alert Policy & Configuration

## Alerting Philosophy
We only alert on **symptoms** that affect the user (SLO violations), not on causes (high CPU).
*   **Page:** Immediate action required (SLO breach imminent).
*   **Ticket:** Investigate during working hours (Warning thresholds).

## Defined Alerts

### 1. High Failure Rate (Critical)
*   **Condition:** `create-tenant` error rate > 5% for 5 minutes.
*   **Channel:** PagerDuty / Telegram Critical Channel.
*   **Action:** Trigger Incident Response.

### 2. Latency Degradation (Warning)
*   **Condition:** `create-tenant` p95 > 500ms for 15 minutes.
*   **Channel:** Slack #alerts-warning.
*   **Action:** Create Jira Ticket.

### 3. Store Outage (Critical)
*   **Condition:** Store LCP synthetic probe fails or returns > 5s.
*   **Channel:** PagerDuty.

### 4. RLS Policy Violation (Security)
*   **Condition:** Postgres Log contains "RLS policy violation".
*   **Channel:** Security Team Email.
