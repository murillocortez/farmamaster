# Environment Strategy

## 1. Environments

### Production (`production`)
*   **Purpose:** Live traffic, real users, real money.
*   **Branch:** `main`
*   **Domain:** `farmamaster.com` (and subdomains).
*   **Data:** Production Database (`nezma...`).
*   **Deployment:** Automated via CD pipeline after passing Staging & Tests.
*   **Logs:** Retention 30 days.

### Staging (`staging`)
*   **Purpose:** Pre-release auditing, QA, Client Demos.
*   **Branch:** `staging`
*   **Domain:** `staging.farmamaster.com`.
*   **Data:** Staging Database (Synced weekly with sanitized Prod data).
*   **Deployment:** Automated on push to `staging` branch.

### Preview (`preview`)
*   **Purpose:** Feature testing, Pull Request validation.
*   **Branch:** `feature/*`, `fix/*` (any PR open against main/staging).
*   **Domain:** `git-branch-name.farmamaster.vercel.app`.
*   **Data:** Development Database or Mock Data.
*   **Deployment:** Instant on every commit to a PR.

## 2. Approval Flow
1.  Developer pushes code to `feature/xyz`. -> **Preview Environment Created**.
2.  Developer opens PR to `staging`. -> CI Tests Run.
3.  Team Lead merges PR. -> **Deploy to Staging**.
4.  QA Validates Staging.
5.  Release Manager triggers promotion to `main`. -> **Deploy to Production**.
