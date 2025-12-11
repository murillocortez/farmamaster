# Stress Testing Summary

## Methodology
We used **k6** to simulate load on the critical `create-tenant` path.

## Scenarios
1.  **Load Test:** 20 concurrent users creating tenants for 5 minutes.
2.  **Spike Test:** 0 -> 100 users in 10 seconds.

## Results (Baseline)
*   **Max Throughput:** ~50 req/s (limited by database write locks on `auth.users`).
*   **Latency p95:** 650ms (at peak load).
*   **Error Rate:** 0% during Load Test, <1% during Spike Test.

## Recommendations
To handle higher scale (>1000 tenants/hour):
1.  Move the `create-tenant` process to a background job queue (async).
2.  Return "202 Accepted" immediately to the user.
3.  Process the heavy SQL transaction in a worker.
