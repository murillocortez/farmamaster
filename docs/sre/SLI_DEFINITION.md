# Service Level Indicators (SLIs) - Definition

## 1. Backend & Edge Functions

### `create-tenant` Latency
*   **Definition:** Time taken from receiving the HTTP request to returning the HTTP response (200 OK).
*   **Measurement:**
    *   `p50`: Median latency.
    *   `p95`: 95th percentile latency (outliers).
    *   `p99`: 99th percentile (slowest valid requests).
*   **Source:** Supabase Dashboard / Logflare / Custom Logger Middleware.

### `create-tenant` Availability
*   **Definition:** Percentage of requests returning 2xx status codes vs total requests.
*   **Formula:** `(Successful Requests / Total Requests) * 100`

### Admin API Latency (Protected Routes)
*   **Definition:** Response time for data-fetching endpoints (e.g., `/products`, `/orders`) authenticated via RLS.
*   **Measurement:** p95 latency.

### Supabase PostgREST Response Time
*   **Definition:** Internal processing time of the Database for CRUD operations.
*   **Source:** `supabase_response_time_seconds` (Prometheus/Grafana if available) or Client-side measurement.

## 2. Frontend (Store & Admin)

### Largest Contentful Paint (LCP) - Store
*   **Definition:** Render time of the largest image or text block visible within the viewport.
*   **Target:** Core Web Vitals standard (< 2.5s is 'Good', our internal goal is stricter).
*   **Source:** Sentry Performance Monitoring / `web-vitals` library.

### Login Time
*   **Definition:** Time elapsed between clicking "Login" and the Dashboard being interactive.
*   **Measurement:** `performance.now()` start/end markers sent to analytics.

## 3. Business Metrics

### Tenant Creation Success Rate
*   **Definition:** Tenants successfully provisioned / Total valid form submissions.
*   **Goal:** 100% (minus user errors like duplicate email).

### Throughput
*   **Definition:** Requests per second (RPS) per tenant.
*   **Purpose:** Capacity planning and rate limiting.
