# Service Level Objectives (SLOs) & Error Budgets

## Targets

| Indicator | Target (SLO) | Time Window | Compliance |
| :--- | :--- | :--- | :--- |
| **Availability (Backend)** | 99.95% | 30 Rolling Days | High |
| **`create-tenant` Latency** | p95 < 400ms | 24 Hours | Medium |
| **Admin API Latency** | p95 < 200ms | 24 Hours | Low |
| **Error Rate (Global)** | < 0.1% | 1 Hour | High |
| **Store LCP** | < 1.8s | 7 Days | Medium |

## Error Budget Calculation

### Monthly Request Budget
Assuming **1,000,000 requests/month**.

*   **Target:** 99.95% Availability.
*   **Allowed Failure Rate:** 0.05%.
*   **Error Budget:** `1,000,000 * 0.0005` = **500 failed requests** per month.

### Latency Budget
Assuming **10,000 `create-tenant` calls/month**.

*   **Target:** p95 < 400ms.
*   **Allowed Slow Requests:** 5% of requests can be slower than 400ms.
*   **Budget:** **500 slow requests**.

## Spending the Budget
We use the error budget to:
1.  **Innovate:** Ship risky features or upgrades if we have budget left.
2.  **Freeze:** If budget is exhausted (burned), we **halt all non-critical deployments** and focus 100% on reliability/performance until the window rolls over.

## Alerting Policies
*   **Burn Rate Alert:** Trigger if we burn > 2% of the budget in 1 hour.
*   **Critical Alert:** Trigger if error rate > 1% (10x the SLO limit) for 5 minutes.
