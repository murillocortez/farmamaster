# Observability Strategy

## 1. Backend (Edge Functions)
- **Error Tracking:** Calls are wrapped in try/catch blocks returning standard JSON errors.
- **Logs:** Deploy logs accessible via CLI (`supabase functions logs`).
- **Metrics:** Execution time and memory usage monitored in Dashboard.

## 2. Frontend (Apps)
- **Error Boundary:** React apps should wrap main routes in ErrorBoundaries to catch crashes.
- **Performance:** Tracking Web Vitals (LCP, FID, CLS).

## 3. Proposal: Sentry Integration
We recommend installing `@sentry/react` in all 3 apps.

```bash
# In each app
npm install @sentry/react @sentry/tracing
```

Initialize in `main.tsx`:
```javascript
Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```
