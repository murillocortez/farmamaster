# Resilience Report

## Strategies Implemented

### 1. Circuit Breaker
We implemented a Circuit Breaker pattern for external service calls (e.g., calling Supabase functions from the backend Node service or third-party APIs).
- **Threshold:** 5 failures in 10 seconds invokes the `OPEN` state.
- **Cool-down:** 30 seconds before attempting `HALF-OPEN`.

### 2. Exponential Backoff Retry
Critical operations (like Tenant Provisioning or Payment Processing) now have a retry wrapper.
- **Max Retries:** 3
- **Factor:** 2 (1s -> 2s -> 4s)

### 3. Timeouts
All external fetch requests are wrapped in a strictly enforced timeout controller (default 5000ms).

## Usage Example

```typescript
import { withResilience } from '@farmamaster/resilience';

const data = await withResilience(
  () => fetch('https://api.external.com'),
  { retries: 3, timeout: 5000 }
);
```

## Impact
Significantly reduced "hanging" processes and improved system recovery during intermittent Supabase API outages.
