# Frontend Observability Implementation Report

## Summary
The 3 frontend applications (Master, Admin, Store) have been prepared for deep observability using Sentry and Web Vitals tracking.

## Components

### 1. Web Vitals
A shared utility in `@farmamaster/observability` captures:
*   **LCP:** Loading performance.
*   **FID:** Interactivity delay.
*   **CLS:** Visual stability.

### 2. Sentry Integration
We recommend wrapping the React root with `Sentry.ErrorBoundary` to catch UI crashes gracefully without white-screening the user.

### 3. Usage Strategy
*   **Master:** Focus on reliable operational forms.
*   **Admin:** Focus on complex data grid performance.
*   **Store:** Critical focus on LCP and CLS for SEO and Conversion rate optimization.

## Data Flow
Browser -> Sentry (Error/Perf) -> Slack Alerts (Criticals)
Browser -> Analytics Endpoint -> BigQuery (Long term stats)
