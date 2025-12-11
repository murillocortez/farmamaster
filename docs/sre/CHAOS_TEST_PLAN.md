# Chaos Test Plan

## Objective
Proactively identify weaknesses in the system by injecting failures.

## Experiments

### 1. Latency Injection
**Hypothesis:** The frontend Administration panel should handle a 2s delay in API responses without crashing, displaying a loading skeleton instead.
**Method:**
Add a sleep in the `create-tenant` function or use a proxy to delay packets.
**Success Criteria:** UI shows "Loading...", no White Screen of Death.

### 2. Database Connection Exhaustion
**Hypothesis:** The Edge Function should fail gracefully (503 Service Unavailable) when the DB pool is full, rather than hanging indefinitely.
**Method:**
Run a script to open 1000 connections to Postgres.
**Success Criteria:** API returns 503 immediately (Fail Fast).

### 3. Invalid Tenant Data
**Hypothesis:** Sending malformed JSON (missing required fields) should return 400 Bad Request with specific validation errors.
**Method:**
CURL with empty body.
**Success Criteria:** HTTP 400, JSON error list.

## Schedule
Run Chaos experiments manually on Staging every Friday at 4 PM.
